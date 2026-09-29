/**
 * server.js – CareConnect Backend Entry Point
 *
 * Start in development:  npm run dev
 * Start in production:   npm start
 */

// Load environment variables from .env BEFORE anything else
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Routes
const translateRouter = require("./routes/translate");
const legalRouter = require("./routes/legal");

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────

// CORS – allow any origin in development.
// In production, restrict to your Expo/web frontend domain.
app.use(
  cors({
    origin: "*", // TODO: tighten to specific domains in production
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies (increase limit to handle base64 images)
app.use(express.json({ limit: "10mb" }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "CareConnect Backend",
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/translate", translateRouter);
app.use("/api/legal", legalRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error.", details: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 CareConnect backend running on http://localhost:${PORT}`);
  console.log(`   Health:     GET  http://localhost:${PORT}/health`);
  console.log(`   Translate:  POST http://localhost:${PORT}/api/translate`);
  console.log(`   Contract:   POST http://localhost:${PORT}/api/legal/upload-contract`);
  console.log(`   Legal Q&A:  POST http://localhost:${PORT}/api/legal/ask\n`);
});
