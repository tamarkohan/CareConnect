/**
 * routes/payslips.js   (all routes need a signed-in user)
 *
 * GET  /api/payslips          → { payslips: [{ id, fileName, period, employer, gross, net, en, tl, ml, ru, createdAt }] }
 * The "Payments" page: payslips and other payment documents (an Excel / CSV table of hours and
 * salary, a salary calculation…). URLs keep the name "payslips".
 *
 * POST /api/payslips/upload   Body: { files: [{ base64, mimeType, name }] }  one PDF / Word / Excel / CSV file or up to 5 photos
 *                             → { payslip }   (read, explained in every app language, stored encrypted)
 * GET  /api/payslips/:id/files → { files: [{ name, mimeType, base64 }] }   the original files, to download
 * POST /api/payslips/explain-line Body: { id, line, language: "en"|"tl"|"ml"|"ru" } → { text }
 *                             a longer explanation of one line (saved, so asking again is free)
 * POST /api/payslips/delete   Body: { id } → { success: true }   deletes the payslip and its files for good
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
    const { text, fileName } = await readContractFiles(req.body.files, "an Israeli payslip or another payment document (e.g. a table of hours and salary)");
    const explanation = await payslips.explainPayslip(text);
    const payslip = await payslips.addPayslip(req.user.id, { fileName, text, ...explanation }, req.body.files);
    console.log(`[payslips] Payslip explained (${text.length} chars)`);
    return res.json({ payslip });
  } catch (err) {
    if (err.expose) return res.status(err.status || 400).json({ error: err.message, code: err.code });
    console.error("[payslips/upload] Error:", err.cause?.message || err.message);
    return res.status(500).json({ error: "Could not read the payslip. Please try again." });
  }
});

const validId = (id) => /^\d+$/.test(String(id || ""));

router.get("/:id/files", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: "Missing payslip id." });
    const files = await payslips.getPayslipFiles(req.user.id, req.params.id);
    if (!files) return res.status(404).json({ error: "The original file of this payslip isn't saved." });
    res.set("Cache-Control", "no-store");
    res.json({ files });
  } catch (err) {
    next(err);
  }
});

router.post("/explain-line", async (req, res) => {
  try {
    const { id, line, language } = req.body || {};
    if (!validId(id) || typeof line !== "string" || !line.trim() || line.length > 200) {
      return res.status(400).json({ error: "Missing payslip line." });
    }
    const text = await payslips.explainLine(req.user.id, String(id), line, ["en", "tl", "ml", "ru", "hi", "ta"].includes(language) ? language : "en");
    if (text === null) return res.status(404).json({ error: "Payslip not found." });
    res.json({ text });
  } catch (err) {
    console.error("[payslips/explain-line] Error:", err.cause?.message || err.message);
    res.status(500).json({ error: "Could not explain this line. Please try again." });
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
