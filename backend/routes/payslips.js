/**
 * routes/payslips.js   (all routes need a signed-in user)
 *
 * GET  /api/payslips          → { payslips: [{ id, fileName, period, employer, gross, net, en, tl, ml, ru, createdAt }] }
 * POST /api/payslips/upload   Body: { files: [{ base64, mimeType, name }] }  one PDF / Word file or up to 5 photos
 *                             → { payslip }   (read, explained in every app language, stored encrypted)
 * POST /api/payslips/delete   Body: { id } → { success: true }
 */

const express = require("express");
const router = express.Router();
const { requireAuth } = require("../services/users");
const { readContractFiles } = require("../services/contractReader");
const payslips = require("../services/payslips");

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    res.json({ payslips: await payslips.listPayslips(req.user.id) });
  } catch (err) {
    next(err);
  }
});

router.post("/upload", async (req, res) => {
  try {
    const { text, fileName } = await readContractFiles(req.body.files, "an Israeli payslip");
    const explanation = await payslips.explainPayslip(text);
    const payslip = await payslips.addPayslip(req.user.id, { fileName, ...explanation });
    console.log(`[payslips] Payslip explained (${text.length} chars)`);
    return res.json({ payslip });
  } catch (err) {
    if (err.expose) return res.status(err.status || 400).json({ error: err.message, code: err.code });
    console.error("[payslips/upload] Error:", err.cause?.message || err.message);
    return res.status(500).json({ error: "Could not read the payslip. Please try again." });
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    const id = String(req.body?.id || "");
    if (!/^\d+$/.test(id)) return res.status(400).json({ error: "Missing payslip id." });
    await payslips.deletePayslip(req.user.id, id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
