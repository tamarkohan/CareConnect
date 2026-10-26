/**
 * scripts/language-test.js  —  `npm run language-test -- <language code>`
 *
 * Builds a printable rating sheet for caregivers: it sends the test sentences in
 * data/language-test-<code>.json to the real translator (25 translations, 5 per
 * kind of text) and has a 10-question conversation with the legal bot, all in
 * that language, then writes the answers into an HTML page with 1–5 rating boxes.
 * The wording of the sheet ("sheet") is in the same file. LANGUAGE_TEST.md says
 * how to put the caregivers' corrections back into the bots.
 *
 * It signs in as the demo account (phone "123", needs DEMO_LOGIN=true on that
 * server) and uses its contract, so run `npm run demo:reset` first for a clean
 * start. The demo chat is cleared before each language's conversation starts.
 *
 * Usage (from the backend folder):
 *   npm run language-test                    Tagalog, against the local backend (npm run dev)
 *   npm run language-test -- hi ml           Hindi and Malayalam (any codes with a data file)
 *   npm run language-test -- hi https://careconnect-il-app-id9mu.ondigitalocean.app
 *                                            against the live site
 *   npm run language-test -- hi --retry-failed
 *                                            only redo the items that failed in
 *                                            today's run (keeps the rest)
 *
 * Output: backend/reports/language-test-<language>-<date>.html  (open it, print it)
 *         backend/reports/language-test-<language>-<date>.json  (raw answers)
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const RETRY_FAILED = args.includes("--retry-failed");
const CODES = args.filter((a) => /^[a-z]{2}$/.test(a));
const BASE = (args.find((a) => !a.startsWith("--") && !CODES.includes(a)) || process.env.LANGTEST_URL || "http://localhost:3000").replace(/\/+$/, "");
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

/** Fills {name} placeholders in the sheet's wording. */
const fill = (text, vars) => String(text).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

const scale = (label) => `
  <div class="rate"><span class="q">${label}</span>
    <span class="boxes">${[1, 2, 3, 4, 5].map((n) => `<span class="box">${n}</span>`).join("")}</span>
  </div>`;
const lineField = (label) => `<div class="field"><span class="q">${label}</span><span class="line"></span></div>`;

function buildHtml({ test, translations, legal, contractName, date }) {
  const S = test.sheet;
  let n = 0;
  const trItems = Object.keys(S.groups)
    .map((g) => {
      const items = translations.filter((t) => t.group === g);
      if (!items.length) return "";
      return `<h2>${esc(S.groups[g])}</h2>` + items.map((t) => {
        n++;
        const r = t.result || {};
        return `
        <div class="item">
          <div class="num">${n}</div>
          <div class="body">
            <div class="label">${esc(S.original)}</div>
            <div class="he" dir="auto">${esc(t.he)}</div>
            <div class="key"><b>${esc(S.meaning)}</b> ${esc(t.en)}</div>
            <div class="label">${esc(S.appTranslation)}</div>
            ${t.error ? `<div class="err">Error: ${esc(t.error)}</div>` : `
            <div class="answer">${esc(r.translatedText)}</div>
            ${r.phonetic ? `<div class="small"><b>${esc(S.pronunciation)}</b> ${esc(r.phonetic)}</div>` : ""}
            ${r.note ? `<div class="small"><b>${esc(S.note)}</b> ${esc(r.note)}</div>` : ""}
            ${r.alternatives?.length ? `<div class="small"><b>${esc(S.couldAlsoMean)}</b> ${r.alternatives.map((a) => `${esc(a.meaning)}${a.language ? ` (${esc(a.language)})` : ""}`).join(" · ")}</div>` : ""}`}
            <div class="ratings">
              ${scale(esc(S.rateMeaning))}
              ${scale(esc(S.rateNatural))}
              ${g === "double" ? scale(esc(S.rateAlternatives)) : ""}
              ${lineField(esc(S.betterTranslation))}
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
        <div class="label">${esc(S.question)}</div>
        <div class="question">${esc(m.question)}</div>
        <div class="label">${esc(S.appAnswer)}</div>
        ${m.error ? `<div class="err">Error: ${esc(m.error)}</div>` : `<div class="answer md">${md(m.answer)}</div>
        ${m.sources?.length ? `<div class="small"><b>${esc(S.sources)}</b> ${m.sources.map((s) => `[${s.id}] ${esc(s.title)}`).join(" · ")}</div>` : ""}`}
        <div class="ratings">
          ${scale(esc(S.rateEasy))}
          ${scale(esc(S.rateNatural))}
          ${scale(esc(S.rateHelpful))}
          ${lineField(esc(S.betterWords))}
          ${lineField(esc(S.comments))}
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
<html lang="${esc(test.readerLanguage)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(S.title)}</title>
<style>
  :root { --ink:#071e27; --muted:#556; --line:#cfe6f2; --blue:#005dac; --bg:#f3faff; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Roboto, Arial, "Nirmala UI", "Noto Sans Devanagari", "Noto Sans Malayalam", sans-serif; color: var(--ink); margin: 0; background: #fff; line-height: 1.45; }
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
  <h1>${esc(S.title)}</h1>
  <p class="sub">${esc(fill(S.subtitle, { date, translations: translations.length, questions: legal.length }))}</p>

  <div class="intro">
    ${md(S.intro)}
    <div class="legend">${S.scale.map((label, i) => `<span><b>${i + 1}</b> = ${esc(label)}</span>`).join("")}</div>
  </div>

  <div class="who">
    ${S.who.map((label) => lineField(esc(label))).join("\n    ")}
  </div>

  <h1 style="margin-top:28px">${esc(S.part1)}</h1>
  <p class="sub">${esc(S.part1Sub)}</p>
  ${trItems}

  <h1 class="pb" style="margin-top:28px">${esc(S.part2)}</h1>
  <p class="sub">${esc(fill(S.part2Sub, { contract: contractName || "demo contract" }))}</p>
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
    <p><b>Next:</b> put the caregivers' corrections into the bots (data/translation-style.json and
    data/glossary.json) — see backend/LANGUAGE_TEST.md.</p>
  </div>
</div></body></html>`;
}

// ── Run ──────────────────────────────────────────────────────────────────────
function loadTest(code) {
  const file = path.join(__dirname, `../data/language-test-${code}.json`);
  if (!fs.existsSync(file)) {
    const have = fs.readdirSync(path.dirname(file))
      .map((f) => f.match(/^language-test-([a-z]{2})\.json$/)?.[1]).filter(Boolean);
    throw new Error(`No test for "${code}" (data/language-test-${code}.json). Available: ${have.join(", ")}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function main() {
  const tests = (CODES.length ? CODES : ["tl"]).map(loadTest);
  const signIn = await api("/api/auth/request-code", { phone: "123" }).catch((err) => {
    throw new Error(`Could not sign in as the demo account (${err.message}). Is DEMO_LOGIN=true on that server?`);
  });
  if (!signIn.token) throw new Error("The demo login didn't return a token. Is DEMO_LOGIN=true on that server?");
  token = signIn.token;

  const { contract } = await api("/api/legal/contract");
  if (!contract) console.warn("⚠ The demo account has no contract: run `npm run demo:reset` first for contract-based answers.");

  const files = [];
  let failed = 0;
  for (const test of tests) {
    const result = await runTest(test, contract);
    files.push(result.file);
    failed += result.failed;
  }

  const retry = `npm.cmd run language-test -- ${[...args.filter((a) => a !== "--retry-failed"), "--retry-failed"].join(" ")}`;
  console.log(`\nDone${failed ? ` (${failed} failed — run again with:  ${retry})` : ""}.`);
  console.log(`Open ${files.length > 1 ? "these files" : "this file"} in your browser and print:\n  ${files.join("\n  ")}`);
}

/** Runs one language's test and writes its sheet. @returns {{ file: string, failed: number }} */
async function runTest(test, contract) {
  console.log(`\nLanguage test (${test.language}) against ${BASE}`);
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
  fs.writeFileSync(`${base}.html`, buildHtml({ test, translations, legal, contractName: contract?.fileName, date }));

  return { file: `${base}.html`, failed: [...translations, ...legal].filter((x) => x.error).length };
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
