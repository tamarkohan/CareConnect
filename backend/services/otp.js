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
 *   Email via Resend  – RESEND_API_KEY, OTP_EMAIL_FROM (e.g. "CareConnect <login@yourdomain>")
 * With no provider configured the code is printed in the server log, but only
 * outside production (NODE_ENV !== "production"), for local testing.
 *
 * Test mode: OTP_TEST_CODE=123456 makes that the code for EVERY phone number and
 * email, and nothing is sent. Lets testers create as many accounts as they want.
 * Turn it off (remove it) before real users sign up.
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

function canSend(kind) {
  if (kind === "phone") {
    return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);
  }
  return !!(process.env.RESEND_API_KEY && process.env.OTP_EMAIL_FROM);
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

async function sendEmail(to, code) {
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

  const code = testCode() ?? crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  pending.set(key, { hash: sha256(`${key}:${code}`), expiresAt: Date.now() + CODE_TTL_MS, attempts: 0, sentAt: Date.now() });

  if (isTestMode()) {
    // Test mode: nothing is sent, the fixed test code works.
  } else if (canSend(id.kind)) {
    if (id.kind === "phone") await sendSms(id.value, `Your CareConnect code is ${code}`);
    else await sendEmail(id.value, code);
  } else {
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

  const given = Buffer.from(sha256(`${key}:${String(code ?? "").trim()}`));
  if (!crypto.timingSafeEqual(given, Buffer.from(entry.hash))) return "invalid";
  pending.delete(key);
  return "ok";
}

// Forget expired codes now and then so the map can't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of pending) if (v.expiresAt < now) pending.delete(k);
}, 60 * 1000).unref();

module.exports = { requestCode, verifyCode, isAvailable, isTestMode };
