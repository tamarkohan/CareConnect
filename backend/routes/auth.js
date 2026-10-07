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
 * POST /api/auth/me             { disclaimerVersion } → { user }
 * POST /api/auth/logout         (signed in)                    → { success: true }
 *
 * Environment variables:
 *   DEMO_LOGIN=true      lets phone number "123" sign in without a code (demo account)
 *   OTP_TEST_CODE=123456 the code for every phone/email, nothing sent (see services/otp.js)
 */

const express = require("express");
const router = express.Router();
const users = require("../services/users");
const otp = require("../services/otp");

const demoEnabled = () => process.env.DEMO_LOGIN === "true";

async function signIn(id, res) {
  const user = await users.findOrCreateUser(id);
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

router.get("/me", users.requireAuth, (req, res) => {
  res.json({ user: users.publicUser(req.user) });
});

router.post("/me", users.requireAuth, async (req, res, next) => {
  try {
    const { disclaimerVersion } = req.body || {};
    if (disclaimerVersion !== undefined && !(Number.isInteger(disclaimerVersion) && disclaimerVersion > 0)) {
      return res.status(400).json({ error: "disclaimerVersion must be a positive integer." });
    }
    const user = await users.updateUser(req.user.id, { disclaimerVersion });
    res.json({ user: users.publicUser(user) });
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
