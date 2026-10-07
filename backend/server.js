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
const authRouter = require("./routes/auth");

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

// Parse JSON bodies. Big enough for a contract upload (up to 5 compressed
// photos or a 7 MB PDF, sent as base64 which adds about a third).
app.use(express.json({ limit: "12mb" }));

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
app.use("/api/auth", authRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "The file is too large. Please use a smaller file or fewer photos.", code: "tooLarge" });
  }
  if (err.expose) return res.status(err.status || 400).json({ error: err.message });
  console.error("[server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 CareConnect backend running on http://localhost:${PORT}`);
  console.log(`   Health:     GET  http://localhost:${PORT}/health`);
  console.log(`   Translate:  POST http://localhost:${PORT}/api/translate`);
  console.log(`   Contract:   POST http://localhost:${PORT}/api/legal/upload-contract`);
  console.log(`   Legal Q&A:  POST http://localhost:${PORT}/api/legal/ask`);
  console.log(`   Delete:     POST http://localhost:${PORT}/api/legal/delete-contract\n`);
});
