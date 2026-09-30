/**
 * routes/legal.js
 *
 * POST /api/legal/upload-contract
 *   Body: { userId: string, contractText: string }
 *   Stores the extracted contract text in memory, keyed by userId.
 *   (Replace the in-memory store with a real database when ready.)
 *
 * POST /api/legal/ask
 *   Body: { userId: string, question: string, language: string }
 *   Retrieves the stored contract for userId, sends it plus the user's
 *   question to Gemini acting as an Israeli labour-law expert, and returns
 *   the answer in the requested language.
 */

const express = require("express");
const router = express.Router();
const { generate } = require("../services/geminiService");

// ── In-memory contract store ──────────────────────────────────────────────────
// Map<userId: string, contractText: string>
// TODO: replace with a persistent database (e.g. MongoDB, Supabase, Firebase).
const contractStore = new Map();

// ── System prompt ─────────────────────────────────────────────────────────────
const LEGAL_SYSTEM_PROMPT = `You are an expert in Israeli labour law and workers' rights, with specific knowledge of:
- The Israeli Work Hours and Rest Law (חוק שעות עבודה ומנוחה)
- The Annual Leave Law (חוק חופשה שנתית)
- The Wage Protection Law (חוק הגנת השכר)
- Sick pay regulations (דמי מחלה)
- Rights of foreign workers (עובדים זרים) including live-in caregivers (סיעוד)
- Employment contracts and collective agreements in the caregiving sector
- Discrimination, illegal deductions, and overtime violations

Your role is to help foreign workers in Israel understand their rights by analysing their actual employment contract.

Guidelines:
- Always base your answer on the specific contract text provided AND on Israeli law.
- Flag any clauses that appear to violate Israeli law or industry standards.
- Use plain, simple language appropriate for someone who may not have a legal background.
- Respond in the language explicitly requested by the user.
- If the contract text is missing, say so clearly and advise the user to upload their contract first.
- Never provide generic advice — always refer to the specific contract when available.
- End every answer with a short "⚠️ Disclaimer" reminding the user this is informational only and they should consult a certified labour lawyer for formal legal advice.`;

// ── POST /api/legal/upload-contract ──────────────────────────────────────────
router.post("/upload-contract", (req, res) => {
  try {
    const { userId, contractText } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required." });
    }

    if (!contractText || typeof contractText !== "string" || contractText.trim() === "") {
      return res.status(400).json({ error: "contractText is required and must not be empty." });
    }

    // Store (or overwrite) the contract for this user
    contractStore.set(userId.trim(), contractText.trim());

    console.log(`[legal] Contract stored for userId: ${userId}`);
    return res.json({
      success: true,
      message: "Contract uploaded successfully. You can now ask questions about it.",
      userId,
      characterCount: contractText.trim().length,
    });
  } catch (err) {
    console.error("[legal/upload-contract] Error:", err);
    return res
      .status(500)
      .json({ error: "Failed to store contract.", details: err.message });
  }
});

// ── POST /api/legal/ask ───────────────────────────────────────────────────────
router.post("/ask", async (req, res) => {
  try {
    const { userId, question, language } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required." });
    }

    if (!question || typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({ error: "question is required." });
    }

    if (!language || typeof language !== "string") {
      return res.status(400).json({ error: "language is required (e.g. 'English', 'Hebrew', 'Tagalog')." });
    }

    // Retrieve stored contract
    const contractText = contractStore.get(userId.trim());

    // Build the user-facing prompt
    const userPrompt = contractText
      ? `The user's employment contract is:\n\n---\n${contractText}\n---\n\nUser question (answer in ${language}):\n${question}`
      : `The user has NOT uploaded a contract yet.\n\nUser question (answer in ${language}):\n${question}`;

    const { text: answer } = await generate({
      system: LEGAL_SYSTEM_PROMPT,
      contents: userPrompt,
    });

    return res.json({
      answer,
      contractAvailable: !!contractText,
      language,
    });
  } catch (err) {
    console.error("[legal/ask] Error:", err.cause || err);
    return res
      .status(err.status === 503 ? 503 : 500)
      .json({ error: err.status === 503 ? err.message : "Legal query failed.", details: err.message });
  }
});

module.exports = router;
