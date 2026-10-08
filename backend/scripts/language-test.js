/**
 * scripts/language-test.js  —  `npm run language-test`
 *
 * Builds a printable rating sheet for caregivers: it sends the test sentences in
 * data/language-test-tl.json to the real translator (25 translations, 5 per
 * kind of text) and has a 10-question conversation with the legal bot, all in
 * Tagalog, then writes the answers into an HTML page with 1–5 rating boxes.
 *
 * It signs in as the demo account (phone "123", needs DEMO_LOGIN=true on that
 * server) and uses its contract, so run `npm run demo:reset` first for a clean
 * start. The demo chat is cleared before the conversation starts.
 *
 * Usage (from the backend folder):
 *   npm run language-test                    against the local backend (npm run dev)
 *   npm run language-test -- https://careconnect-il-app-id9mu.ondigitalocean.app
 *                                            against the live site
 *   npm run language-test -- --retry-failed  only redo the items that failed in
 *                                            today's run (keeps the rest)
 *
 * Output: backend/reports/language-test-tagalog-<date>.html  (open it, print it)
 *         backend/reports/language-test-tagalog-<date>.json  (raw answers)
 */

const fs = require("fs");
const path = require("path");
const test = require("../data/language-test-tl.json");

const args = process.argv.slice(2);
const RETRY_FAILED = args.includes("--retry-failed");
const BASE = (args.find((a) => !a.startsWith("--")) || process.env.LANGTEST_URL || "http://localhost:3000").replace(/\/+$/, "");
const OUT_DIR = path.join(__dirname, "../reports");
const PAUSE_MS = 1500; // be gentle with the Gemini free tier
// The model the app is meant to use; answers from a backup model are marked.
const PRIMARY = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let token = null;
async function api(p, body) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(`${BASE}${p}`, {
      method: body ? "POST" : "GET",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      // The server isn't answering (stopped, or restarting): wait for it a little.
      if (attempt < 4) {
        console.log(`   … can't reach ${BASE} (${err.cause?.code || err.message}), retrying in ${attempt * 10}s`);
        await sleep(attempt * 10_000);
        continue;
      }
      throw new Error(`can't reach ${BASE} — is the backend still running?`);
    }
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data;
    // "AI busy" / rate limit: wait and try again a few times.
    if ((res.status === 503 || res.status === 429) && attempt < 4) {
      console.log(`   … server busy (${res.status}), retrying in ${attempt * 10}s`);
      await sleep(attempt * 10_000);
      continue;
    }
    throw new Error(`${p} → ${res.status} ${data.error || ""}`);
  }
}

// ── HTML helpers ─────────────────────────────────────────────────────────────
const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** The small Markdown the legal bot uses → HTML. */
function md(text) {
  const out = [];
  let list = null;
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(?!\s)(.+?)\*/g, "<i>$1</i>");
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of String(text).split("\n")) {
    const line = raw.trim();
    let m;
    if (!line || /^([-*_]\s*){3,}$/.test(line)) { close(); continue; }
    if ((m = line.match(/^[-*•]\s+(.*)$/))) {
      if (list !== "ul") { close(); out.push("<ul>"); list = "ul"; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = line.match(/^\d+[.)]\s+(.*)$/))) {
      if (list !== "ol") { close(); out.push("<ol>"); list = "ol"; }
      out.push(`<li>${inline(m[1])}</li>`);
    } else {
      close();
      out.push(`<p>${inline(line.replace(/^#{1,6}\s+/, ""))}</p>`);
    }
  }
  close();
  return out.join("\n");
}

const scale = (label) => `
  <div class="rate"><span class="q">${label}</span>
    <span class="boxes">${[1, 2, 3, 4, 5].map((n) => `<span class="box">${n}</span>`).join("")}</span>
  </div>`;
const lineField = (label) => `<div class="field"><span class="q">${label}</span><span class="line"></span></div>`;

const GROUPS = {
  medical: "Medikal · Medical",
  transit: "Transportasyon · Transport",
  slang: "Slang · Salitang kalye",
  general: "Pangkalahatan · General",
  double: "Dobleng kahulugan · Double meaning",
};

function buildHtml({ translations, legal, contractName, date }) {
  let n = 0;
  const trItems = Object.keys(GROUPS)
    .map((g) => {
      const items = translations.filter((t) => t.group === g);
      if (!items.length) return "";
      return `<h2>${GROUPS[g]}</h2>` + items.map((t) => {
        n++;
        const r = t.result || {};
        return `
        <div class="item">
          <div class="num">${n}</div>
          <div class="body">
            <div class="label">Orihinal (Hebrew)</div>
            <div class="he" dir="auto">${esc(t.he)}</div>
            <div class="key"><b>Ibig sabihin / Meaning:</b> ${esc(t.en)}</div>
            <div class="label">Salin ng app / App's translation</div>
            ${t.error ? `<div class="err">Error: ${esc(t.error)}</div>` : `
            <div class="answer">${esc(r.translatedText)}</div>
            ${r.phonetic ? `<div class="small"><b>Bigkas / Pronunciation:</b> ${esc(r.phonetic)}</div>` : ""}
            ${r.note ? `<div class="small"><b>Paalala / Note:</b> ${esc(r.note)}</div>` : ""}
            ${r.alternatives?.length ? `<div class="small"><b>Maaari ring mangahulugang / Could also mean:</b> ${r.alternatives.map((a) => `${esc(a.meaning)}${a.language ? ` (${esc(a.language)})` : ""}`).join(" · ")}</div>` : ""}`}
            <div class="ratings">
              ${scale("Tama ba ang kahulugan? · Is the meaning correct?")}
              ${scale("Natural ba ang Tagalog? · Does it sound natural?")}
              ${g === "double" ? scale("Tama ba ang ibang kahulugan? · Are the other meanings right?") : ""}
              ${lineField("Mas magandang salin · Better translation:")}
            </div>
          </div>
        </div>`;
      }).join("");
    })
    .join("");

  const legalItems = legal.map((m, i) => `
    <div class="item">
      <div class="num">${i + 1}</div>
      <div class="body">
        <div class="label">Tanong / Question</div>
        <div class="question">${esc(m.question)}</div>
        <div class="label">Sagot ng app / App's answer</div>
        ${m.error ? `<div class="err">Error: ${esc(m.error)}</div>` : `<div class="answer md">${md(m.answer)}</div>
        ${m.sources?.length ? `<div class="small"><b>Pinagkunan / Sources:</b> ${m.sources.map((s) => `[${s.id}] ${esc(s.title)}`).join(" · ")}</div>` : ""}`}
        <div class="ratings">
          ${scale("Madaling maintindihan? · Easy to understand?")}
          ${scale("Natural ba ang Tagalog? · Does it sound natural?")}
          ${scale("Nakatulong ba ang sagot? · Was the answer helpful?")}
          ${lineField("Komento / Comments:")}
        </div>
      </div>
    </div>`).join("");

  const summaryRows = translations.map((t, i) => {
    const r = t.result || {};
    const expected = t.group === "double" ? "—" : t.group;
    const ok = t.group === "double" || r.category === t.group;
    return `<tr><td>${i + 1}</td><td dir="auto">${esc(t.he)}</td><td>${esc(expected)}</td>
      <td class="${ok ? "" : "bad"}">${esc(r.category || "error")}</td>
      <td>${r.alternatives?.length ? esc(r.alternatives.map((a) => a.meaning).join(" · ")) : "—"}</td>
      <td class="${r.model && r.model !== PRIMARY ? "bad" : ""}">${esc(r.model || "—")}</td></tr>`;
  }).join("");

  return `<!doctype html>
<html lang="tl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>CareConnect – Pagsusuri ng Tagalog</title>
<style>
  :root { --ink:#071e27; --muted:#556; --line:#cfe6f2; --blue:#005dac; --bg:#f3faff; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Roboto, Arial, sans-serif; color: var(--ink); margin: 0; background: #fff; line-height: 1.45; }
  .page { max-width: 820px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { color: var(--blue); font-size: 26px; margin: 0 0 4px; }
  h2 { color: var(--blue); font-size: 19px; margin: 28px 0 8px; border-bottom: 2px solid var(--line); padding-bottom: 4px; }
  .sub { color: var(--muted); margin: 0 0 16px; }
  .intro { background: var(--bg); border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
  .intro p { margin: 6px 0; }
  .who .field { margin: 10px 0; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; margin-top: 8px; }
  .item { display: flex; gap: 12px; border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; margin: 10px 0; break-inside: avoid; }
  .num { flex: 0 0 28px; height: 28px; border-radius: 50%; background: var(--blue); color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .body { flex: 1; min-width: 0; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin-top: 6px; }
  .he { font-size: 19px; font-weight: 600; }
  .question { font-weight: 600; }
  .key { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .answer { font-size: 16px; background: var(--bg); border-radius: 8px; padding: 8px 10px; margin-top: 2px; }
  .answer.md p { margin: 0 0 6px; } .answer.md ul, .answer.md ol { margin: 0 0 6px; padding-left: 22px; }
  .small { font-size: 13px; margin-top: 4px; }
  .err { color: #c62828; font-weight: 600; }
  .ratings { margin-top: 10px; border-top: 1px dashed var(--line); padding-top: 8px; }
  .rate { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; margin: 6px 0; }
  .q { font-size: 13px; }
  .boxes { display: inline-flex; gap: 6px; }
  .box { width: 30px; height: 30px; border: 1.5px solid var(--ink); border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; color: var(--muted); }
  .field { display: flex; gap: 8px; align-items: flex-end; margin: 8px 0 2px; }
  .line { flex: 1; border-bottom: 1px solid var(--ink); min-height: 22px; }
  .interviewer { font-size: 13px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { border: 1px solid var(--line); padding: 4px 6px; text-align: left; vertical-align: top; }
  th { background: var(--bg); }
  td.bad { color: #c62828; font-weight: 700; }
  .pb { break-before: page; }
  @media print { .page { padding: 0; } .item { border-color: #999; } .noprint { display: none; } }
</style></head>
<body><div class="page">
  <h1>CareConnect – Pagsusuri ng Tagalog</h1>
  <p class="sub">Tagalog language test · ${esc(date)} · ${translations.length} na salin at ${legal.length} na tanong sa legal assistant</p>

  <div class="intro">
    <p><b>Salamat sa pagtulong!</b> Ito ang mga totoong sagot ng CareConnect app. Pakibasa ang bawat isa at bigyan ng marka mula 1 hanggang 5.
    Kung may mas magandang paraan ng pagsasabi nito sa Tagalog, isulat ito.</p>
    <p><i>Thank you for helping! These are real answers from the CareConnect app. Please read each one and rate it from 1 to 5.
    If there is a better way to say it in Tagalog, write it down.</i></p>
    <div class="legend"><span><b>1</b> = Mali / Wrong</span><span><b>2</b> = Mahina / Poor</span><span><b>3</b> = Puwede na / OK</span><span><b>4</b> = Mahusay / Good</span><span><b>5</b> = Napakahusay / Excellent</span></div>
  </div>

  <div class="who">
    ${lineField("Pangalan (hindi kailangan) · Name (optional):")}
    ${lineField("Ilang taon ka na sa Israel? · Years in Israel:")}
    ${lineField("Gaano ka kahusay sa Hebrew? (wala / kaunti / mahusay) · Hebrew level (none / some / good):")}
  </div>

  <h1 style="margin-top:28px">Bahagi 1 · Tagasalin (Translator)</h1>
  <p class="sub">Hebrew → Tagalog</p>
  ${trItems}

  <h1 class="pb" style="margin-top:28px">Bahagi 2 · Legal Assistant</h1>
  <p class="sub">Isang tuloy-tuloy na usapan · One conversation, in order. Ang kontrata: ${esc(contractName || "demo contract")} (halimbawa lamang / fictional).</p>
  ${legalItems}

  <div class="pb interviewer">
    <h2>Para sa interviewer · For the interviewer (not for raters)</h2>
    <p>Kind of text the app chose on its own, compared with the group the sentence was written for. Red = different.</p>
    <table><thead><tr><th>#</th><th>Input</th><th>Group</th><th>App chose</th><th>Could also mean</th><th>Model</th></tr></thead>
    <tbody>${summaryRows}</tbody></table>
    <p><b>Legal answers by model:</b> ${legal.map((m, i) => `${i + 1}: ${esc(m.model || (m.error ? "error" : "?"))}`).join(" · ")}</p>
    <p>Answers from a backup model (not ${esc(PRIMARY)}) usually happen when the free daily Gemini quota is used up;
    they can be weaker than what users normally get.</p>
    <p>Server: ${esc(BASE)} · generated ${esc(new Date().toISOString())}</p>
  </div>
</div></body></html>`;
}

// ── Run ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Language test (${test.language}) against ${BASE}`);
  const signIn = await api("/api/auth/request-code", { phone: "123" }).catch((err) => {
    throw new Error(`Could not sign in as the demo account (${err.message}). Is DEMO_LOGIN=true on that server?`);
  });
  if (!signIn.token) throw new Error("The demo login didn't return a token. Is DEMO_LOGIN=true on that server?");
  token = signIn.token;

  const date = new Date().toISOString().slice(0, 10);
  const base = path.join(OUT_DIR, `language-test-${test.language.toLowerCase()}-${date}`);
  let previous = null;
  if (RETRY_FAILED) {
    try {
      previous = JSON.parse(fs.readFileSync(`${base}.json`, "utf8"));
      console.log("Re-running only the items that failed in today's run.");
    } catch {
      console.log("No earlier run from today found: running everything.");
    }
  }
  const prevTr = (t) => previous?.translations?.find((x) => x.he === t.he && x.result && !x.error);
  const prevLegal = (q) => previous?.legal?.find((x) => x.question === q && x.answer && !x.error);

  const { contract } = await api("/api/legal/contract");
  if (!contract) console.warn("⚠ The demo account has no contract: run `npm run demo:reset` first for contract-based answers.");

  const translations = [];
  for (const [i, t] of test.translations.entries()) {
    const kept = prevTr(t);
    if (kept) { translations.push(kept); continue; }
    process.stdout.write(`Translation ${i + 1}/${test.translations.length} (${t.group}) … `);
    try {
      const result = await api("/api/translate", {
        text: t.he, targetLanguage: test.language, readerLanguage: test.readerLanguage, save: false,
      });
      translations.push({ ...t, result });
      console.log(`${result.translatedText.slice(0, 60)}${result.model && result.model !== PRIMARY ? `  [${result.model}]` : ""}`);
    } catch (err) {
      translations.push({ ...t, error: err.message });
      console.log(`FAILED: ${err.message}`);
    }
    await sleep(PAUSE_MS);
  }

  // A fresh conversation, unless we continue one: then the server still has
  // the earlier questions, so the follow-ups keep their context.
  if (!previous) await api("/api/legal/clear-history", {});
  const legal = [];
  for (const [i, question] of test.legal.entries()) {
    const kept = prevLegal(question);
    if (kept) { legal.push(kept); continue; }
    process.stdout.write(`Legal ${i + 1}/${test.legal.length} … `);
    try {
      const r = await api("/api/legal/ask", { question, language: test.language });
      legal.push({ question, answer: r.answer, sources: r.sources, model: r.model });
      console.log(`${r.answer.length} chars${r.model && r.model !== PRIMARY ? `  [${r.model}]` : ""}`);
    } catch (err) {
      legal.push({ question, error: err.message });
      console.log(`FAILED: ${err.message}`);
    }
    await sleep(PAUSE_MS);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(`${base}.json`, JSON.stringify({ server: BASE, date, translations, legal }, null, 2));
  fs.writeFileSync(`${base}.html`, buildHtml({ translations, legal, contractName: contract?.fileName, date }));

  const failed = [...translations, ...legal].filter((x) => x.error).length;
  console.log(`\nDone${failed ? ` (${failed} failed — run again with:  npm.cmd run language-test -- --retry-failed)` : ""}.`);
  console.log(`Open this file in your browser and print it:\n  ${base}.html`);
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
