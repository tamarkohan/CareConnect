/**
 * routes/auth.js
 *
 * Sign-in with a one-time code sent by SMS or email. No passwords.
 *
 * GET  /api/auth/options        → { phone, email, demo, testCode } which sign-in methods work
 * POST /api/auth/request-code   { phone } | { email }          → { sent: true }
 *                               demo phone "123" (when DEMO_LOGIN=true) signs in at once:
 *                               → { token, user }
 * POST /api/auth/verify-code    { phone | email, code }        → { token, user }
 * GET  /api/auth/me             (signed in)                    → { user }
 * POST /api/auth/me             { disclaimerVersion?, displayName?, guideSeen?: true } → { user }
 *                               displayName: first name, spelled in every app language (services/names.js)
 *                               guideSeen: the welcome guide was shown, so it doesn't open at the next sign-in
 * POST /api/auth/logout         (signed in)                    → { success: true }
 *
 * Profile (signed in; not for the demo account):
 * POST /api/auth/link/request-code  { phone } | { email }       → { sent: true }
 *                               adds a phone or email to the account, so the user can sign in
 *                               with either one; code "alreadyUsed" when another account has it
 * POST /api/auth/link/verify    { phone | email, code }        → { user }
 * POST /api/auth/delete-account (signed in)                    → { success: true }
 *                               deletes the account and everything in it, for good
 *
 * Environment variables:
 *   DEMO_LOGIN=true      lets phone number "123" sign in without a code (demo account)
 *   OTP_TEST_CODE=123456 the code for every phone/email, nothing sent (see services/otp.js)
 */

const express = require("express");
const router = express.Router();
const users = require("../services/users");
const otp = require("../services/otp");
const { ensureName } = require("../services/names");

const demoEnabled = () => process.env.DEMO_LOGIN === "true";

async function signIn(id, res) {
  const user = await ensureName(await users.findOrCreateUser(id));
  const token = await users.createSession(user.id);
  console.log(`[auth] signed in (${id.kind}${user.is_demo ? ", demo" : ""})`);
  return res.json({ token, user: users.publicUser(user) });
}

router.get("/options", (_req, res) => {
  res.json({
    phone: otp.isAvailable("phone"),
    email: otp.isAvailable("email"),
    demo: demoEnabled(),
    // Test mode: the code is the same for everyone, so the login screen shows it.
    testCode: otp.isTestMode() ? process.env.OTP_TEST_CODE : null,
  });
});

router.post("/request-code", async (req, res, next) => {
  try {
    const id = users.normaliseIdentifier(req.body || {});
    if (!id) return res.status(400).json({ error: "Please enter a valid phone number or email.", code: "invalid" });

    if (users.isDemoIdentifier(id)) {
      if (!demoEnabled()) return res.status(400).json({ error: "Please enter a valid phone number.", code: "invalid" });
      return signIn(id, res);
    }

    const result = await otp.requestCode(id);
    if (!result.ok && result.reason === "wait") {
      return res.status(429).json({ error: "Please wait 30 seconds before asking for a new code.", code: "wait" });
    }
    if (!result.ok) {
      return res.status(503).json({
        error: id.kind === "phone"
          ? "Sign-in by SMS isn't available yet."
          : "Sign-in by email isn't available yet.",
        code: "unavailable",
      });
    }
    return res.json({ sent: true });
  } catch (err) {
    console.error("[auth/request-code] Error:", err.message);
    next(Object.assign(new Error("Could not send the code. Please try again."), { expose: true, status: 502 }));
  }
});

router.post("/verify-code", async (req, res, next) => {
  try {
    const id = users.normaliseIdentifier(req.body || {});
    if (!id) return res.status(400).json({ error: "Please enter a valid phone number or email.", code: "invalid" });

    const result = otp.verifyCode(id, req.body.code);
    if (result === "ok") return signIn(id, res);

    const messages = {
      invalid: "That code is not correct.",
      expired: "The code has expired. Please ask for a new one.",
      locked: "Too many wrong tries. Please ask for a new code.",
    };
    return res.status(400).json({ error: messages[result], code: result });
  } catch (err) {
    next(err);
  }
});

router.get("/me", users.requireAuth, async (req, res, next) => {
  try {
    res.json({ user: users.publicUser(await ensureName(req.user)) });
  } catch (err) {
    next(err);
  }
});

router.post("/me", users.requireAuth, async (req, res, next) => {
  try {
    const { disclaimerVersion, displayName, guideSeen } = req.body || {};
    if (disclaimerVersion !== undefined && !(Number.isInteger(disclaimerVersion) && disclaimerVersion > 0)) {
      return res.status(400).json({ error: "disclaimerVersion must be a positive integer." });
    }
    const user = await users.updateUser(req.user.id, { disclaimerVersion, displayName, guideSeen });
    res.json({ user: users.publicUser(user) });
  } catch (err) {
    if (err.expose) return res.status(err.status || 400).json({ error: err.message, code: err.code });
    next(err);
  }
});

// ── Profile: a second way to sign in, deleting the account ───────────────────
const CODE_MESSAGES = {
  invalid: "That code is not correct.",
  expired: "The code has expired. Please ask for a new one.",
  locked: "Too many wrong tries. Please ask for a new code.",
};

/** The phone / email to link, or an error already sent. */
async function linkTarget(req, res) {
  if (req.user.is_demo) {
    res.status(403).json({ error: "The demo account can't be changed.", code: "demo" });
    return null;
  }
  const id = users.normaliseIdentifier(req.body || {});
  if (!id || users.isDemoIdentifier(id)) {
    res.status(400).json({ error: "Please enter a valid phone number or email.", code: "invalid" });
    return null;
  }
  const owner = await users.findUserByIdentifier(id);
  if (owner?.id === req.user.id) {
    res.status(400).json({ error: "This is already on your account.", code: "alreadyYours" });
    return null;
  }
  if (owner) {
    res.status(409).json({ error: "This is already used by another account.", code: "alreadyUsed" });
    return null;
  }
  return id;
}

router.post("/link/request-code", users.requireAuth, async (req, res, next) => {
  try {
    const id = await linkTarget(req, res);
    if (!id) return;
    const result = await otp.requestCode(id);
    if (!result.ok && result.reason === "wait") {
      return res.status(429).json({ error: "Please wait 30 seconds before asking for a new code.", code: "wait" });
    }
    if (!result.ok) {
      return res.status(503).json({
        error: id.kind === "phone" ? "Sending codes by SMS isn't available yet." : "Sending codes by email isn't available yet.",
        code: "unavailable",
      });
    }
    return res.json({ sent: true });
  } catch (err) {
    console.error("[auth/link/request-code] Error:", err.message);
    next(Object.assign(new Error("Could not send the code. Please try again."), { expose: true, status: 502 }));
  }
});

router.post("/link/verify", users.requireAuth, async (req, res, next) => {
  try {
    const id = await linkTarget(req, res);
    if (!id) return;
    const result = otp.verifyCode(id, req.body.code);
    if (result !== "ok") return res.status(400).json({ error: CODE_MESSAGES[result], code: result });
    const user = await users.linkIdentifier(req.user.id, id);
    if (!user) return res.status(409).json({ error: "This is already used by another account.", code: "alreadyUsed" });
    console.log(`[auth] ${id.kind} linked to an account`);
    res.json({ user: users.publicUser(await ensureName(user)) });
  } catch (err) {
    next(err);
  }
});

router.post("/delete-account", users.requireAuth, async (req, res, next) => {
  try {
    if (req.user.is_demo) return res.status(403).json({ error: "The demo account can't be deleted.", code: "demo" });
    await users.deleteUser(req.user.id);
    console.log("[auth] account deleted");
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", users.requireAuth, async (req, res, next) => {
  try {
    await users.deleteSession(req.sessionToken);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
