/**
 * routes/rates.js
 *
 * GET /api/rates → { base: "USD", rates: { ILS: 3.7, PHP: 57.1, ... }, updatedAt, source }
 *
 * Exchange rates for the remittance page's currency converter. They come from
 * ExchangeRate-API's free open endpoint (no key; daily rates; attribution
 * required, which the app shows). We cache them for 6 hours, so every user
 * shares one request and the free rate limit is never reached.
 */

const express = require("express");
const router = express.Router();

const SOURCE_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_MS = 6 * 60 * 60 * 1000;

let cache = null;      // { data, fetchedAt }
let inFlight = null;

async function fetchRates() {
  const res = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.result !== "success" || !json.rates) throw new Error("unexpected reply");
  return {
    base: "USD",
    rates: json.rates,
    updatedAt: json.time_last_update_utc ? new Date(json.time_last_update_utc).toISOString() : new Date().toISOString(),
    source: { name: "ExchangeRate-API", url: "https://www.exchangerate-api.com" },
  };
}

router.get("/", async (_req, res) => {
  const fresh = cache && Date.now() - cache.fetchedAt < CACHE_MS;
  if (!fresh) {
    try {
      inFlight = inFlight || fetchRates();
      cache = { data: await inFlight, fetchedAt: Date.now() };
    } catch (err) {
      console.warn("[rates] could not fetch rates:", err.message);
      // Older rates are better than none; the app shows their date.
      if (!cache) return res.status(503).json({ error: "Exchange rates are not available right now.", code: "unavailable" });
    } finally {
      inFlight = null;
    }
  }
  res.set("Cache-Control", "public, max-age=3600");
  return res.json(cache.data);
});

module.exports = router;
