/**
 * otp.js
 *
 * One-time sign-in codes (6 digits, valid 10 minutes, 5 tries).
 *
 * Codes are kept in this server's memory, not in the database: they live for
 * minutes, there is a single backend instance, and it keeps the DB small.
 * If the server restarts the user simply asks for a new code.
 *
 * Sending:
 *   SMS   via Twilio  – TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
 *   Email via Resend  – RESEND_API_KEY, OTP_EMAIL_FROM (e.g. "CareConnect <login@yourdomain>"),
 *                       needs your own domain
 *   Email via Gmail   – GMAIL_SCRIPT_URL, GMAIL_SCRIPT_SECRET: a small Google Apps Script
 *                       (backend/gmail-sender/Code.gs) that sends from a Gmail account. Free,
 *                       no domain, about 100 emails a day. Over HTTPS, so it also works where
 *                       the host blocks email ports (DigitalOcean does).
 * With no provider configured the code is printed in the server log, but only
 * outside production (NODE_ENV !== "production"), for local testing.
 *
 * Test mode: OTP_TEST_CODE=123456 makes that code work for EVERY phone number and
 * email. Where a real code can be sent (e.g. email via Gmail), it is sent too, and
 * either one signs in; where nothing can be sent (e.g. SMS without Twilio), only the
 * test code works. Lets testers create as many accounts as they want. Anyone who
 * knows the test code can sign in to any account: remove it before real users.
 */

const crypto = require("crypto");
const { sha256 } = require("./crypto");

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_MS = 30 * 1000;

/** key ("phone:+972…" / "email:…") → { hash, expiresAt, attempts, sentAt } */
const pending = new Map();

const keyOf = (id) => `${id.kind}:${id.value}`;
const testCode = () => (/^\d{6}$/.test(process.env.OTP_TEST_CODE || "") ? process.env.OTP_TEST_CODE : null);
const isTestMode = () => testCode() !== null;
const isProduction = () => process.env.NODE_ENV === "production";

const hasResend = () => !!(process.env.RESEND_API_KEY && process.env.OTP_EMAIL_FROM);
const hasGmail = () => !!(process.env.GMAIL_SCRIPT_URL && process.env.GMAIL_SCRIPT_SECRET);

/** True when a real code can be sent to this kind of identifier. */
function canSend(kind) {
  if (kind === "phone") {
    return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
  }
  return hasResend() || hasGmail();
}

/** True when codes can reach this kind of identifier (or dev logging is on). */
const isAvailable = (kind) => isTestMode() || canSend(kind) || !isProduction();

async function sendSms(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: process.env.TWILIO_FROM, Body: body }),
  });
  if (!res.ok) throw new Error(`SMS provider answered ${res.status}`);
}

// Gmail: the Apps Script web app sends the email (it writes the text itself).
async function sendEmailViaGmail(to, code) {
  const res = await fetch(process.env.GMAIL_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ secret: process.env.GMAIL_SCRIPT_SECRET, to, code }),
    redirect: "follow",                        // the script answers through a Google redirect
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    throw new Error(`Gmail script answered ${res.status}${data?.error ? `: ${data.error}` : " (not the expected reply – check GMAIL_SCRIPT_URL)"}`);
  }
}

async function sendEmail(to, code) {
  if (!hasResend()) return sendEmailViaGmail(to, code);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.OTP_EMAIL_FROM,
      to,
      subject: `CareConnect code: ${code}`,
      text: `Your CareConnect sign-in code is ${code}\n\nIt is valid for 10 minutes. If you didn't ask for it, ignore this email.`,
    }),
  });
  if (!res.ok) throw new Error(`Email provider answered ${res.status}`);
}

/**
 * Creates and sends a code.
 * @returns {Promise<{ ok: true } | { ok: false, reason: "wait" | "unavailable" }>}
 */
async function requestCode(id) {
  if (!isAvailable(id.kind)) return { ok: false, reason: "unavailable" };

  const key = keyOf(id);
  const prev = pending.get(key);
  if (prev && Date.now() - prev.sentAt < RESEND_AFTER_MS) return { ok: false, reason: "wait" };

  // A real code whenever it can be sent; in test mode without a way to send, just the
  // test code. (In test mode the test code is accepted as well, see verifyCode.)
  const sending = canSend(id.kind);
  const code = !sending && isTestMode() ? testCode() : crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  pending.set(key, { hash: sha256(`${key}:${code}`), expiresAt: Date.now() + CODE_TTL_MS, attempts: 0, sentAt: Date.now() });

  if (sending) {
    try {
      if (id.kind === "phone") await sendSms(id.value, `Your CareConnect code is ${code}`);
      else await sendEmail(id.value, code);
    } catch (err) {
      if (!isTestMode()) {
        pending.delete(key);   // so the user can ask again right away
        throw err;
      }
      // Test mode: the test code still works, so signing in isn't blocked.
      console.error(`[otp] sending failed (the test code still works): ${err.message}`);
    }
  } else if (!isTestMode()) {
    console.log(`[otp] (dev only, no provider configured) code for ${id.value}: ${code}`);
  }
  return { ok: true };
}

/** @returns {"ok" | "invalid" | "expired" | "locked"} */
function verifyCode(id, code) {
  const key = keyOf(id);
  const entry = pending.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    pending.delete(key);
    return "expired";
  }
  if (entry.attempts >= MAX_ATTEMPTS) return "locked";
  entry.attempts++;

  const typed = String(code ?? "").trim();
  const given = Buffer.from(sha256(`${key}:${typed}`));
  const rightCode = crypto.timingSafeEqual(given, Buffer.from(entry.hash));
  // Test mode: the test code works too, next to the code that was sent.
  const theTestCode = isTestMode() && typed === testCode();
  if (!rightCode && !theTestCode) return "invalid";
  pending.delete(key);
  return "ok";
}

// Forget expired codes now and then so the map can't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of pending) if (v.expiresAt < now) pending.delete(k);
}, 60 * 1000).unref();

module.exports = { requestCode, verifyCode, isAvailable, isTestMode, canSend };
