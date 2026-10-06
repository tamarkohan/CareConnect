/**
 * rag/crawler.js
 *
 * A small, polite website crawler: follows links inside a source's `include`
 * prefixes, obeys robots.txt, and turns each HTML page or PDF into clean text.
 */

const cheerio = require("cheerio");
const { extractText, getDocumentProxy } = require("unpdf");

const USER_AGENT =
  "CareConnectBot/1.0 (university project; legal-rights knowledge base)";
const FETCH_TIMEOUT_MS = 30_000;
const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MIN_TEXT_CHARS = 200;
const SKIP_EXTENSIONS =
  /\.(jpe?g|png|gif|svg|webp|ico|css|js|json|xml|zip|rar|docx?|xlsx?|pptx?|mp3|mp4|avi|mov)$/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── robots.txt ────────────────────────────────────────────────────────────────

/** Returns the Disallow prefixes that apply to us (the "*" group). */
async function loadRobots(origin) {
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const disallow = [];
    let applies = false;
    for (const raw of (await res.text()).split("\n")) {
      const line = raw.replace(/#.*/, "").trim();
      const [field, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      if (/^user-agent$/i.test(field)) applies = value === "*" || /careconnect/i.test(value);
      else if (applies && /^disallow$/i.test(field) && value) disallow.push(value);
    }
    return disallow;
  } catch {
    return [];
  }
}

function allowedByRobots(url, disallow) {
  // `url` is already decoded by normalizeUrl; also compare the encoded form,
  // since robots.txt rules may be written either way.
  const decoded = url.slice(new URL(url).origin.length);
  const u = new URL(url);
  const encoded = u.pathname + u.search;
  return !disallow.some((rule) => decoded.startsWith(rule) || encoded.startsWith(rule));
}

// ── URL helpers ───────────────────────────────────────────────────────────────

/** Absolute URL without #hash, with decoded path so the same page has one key. */
function normalizeUrl(href, base) {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    return decodeURI(u.toString());
  } catch {
    return null;
  }
}

function inScope(url, source) {
  if (!source.include.some((prefix) => url.startsWith(prefix))) return false;
  if (SKIP_EXTENSIONS.test(new URL(url).pathname)) return false;
  return !(source.exclude || []).some((re) => re.test(url));
}

// ── HTML → text ──────────────────────────────────────────────────────────────

/**
 * Extracts the title, the readable main text and the links of a page.
 * `links` = every link; `contentLinks` = only links inside the main content
 * (no menus, header or footer).
 */
function extractPage(html, url) {
  const $ = cheerio.load(html);

  const links = [];
  $("a[href]").each((_, a) => {
    const abs = normalizeUrl($(a).attr("href"), url);
    if (abs) links.push(abs);
  });

  const title = ($("h1").first().text() || $("title").text() || url).trim();

  $("script, style, noscript, iframe, svg, form, nav, header, footer, aside").remove();
  $("[role=navigation], [role=banner], [role=contentinfo], .mw-editsection, #toc, .toc").remove();

  // Prefer the page's main content area when it has one.
  let root = $("main, article, #mw-content-text, .mw-parser-output, #content, .entry-content").first();
  if (!root.length) root = $("body");

  // Keep paragraph / list / heading boundaries as line breaks.
  root.find("br").replaceWith("\n");
  root.find("p, div, li, h1, h2, h3, h4, h5, h6, tr, section, blockquote, dd, dt").each((_, el) => {
    $(el).append("\n");
  });

  const contentLinks = [];
  root.find("a[href]").each((_, a) => {
    const abs = normalizeUrl($(a).attr("href"), url);
    if (abs) contentLinks.push(abs);
  });

  const text = root
    .text()
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");

  return { title, text, links, contentLinks };
}

// ── PDF → text ───────────────────────────────────────────────────────────────

/** Extracts the title and text of a PDF (one line per text line). */
async function extractPdf(buffer, url) {
  // verbosity 0 hides harmless font warnings ("TT: undefined function").
  const pdf = await getDocumentProxy(new Uint8Array(buffer), { verbosity: 0 });
  const [{ text: pages }, meta] = await Promise.all([
    extractText(pdf, { mergePages: false }),
    pdf.getMetadata().catch(() => null),
  ]);
  const fileName = decodeURIComponent(new URL(url).pathname.split("/").pop() || url)
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ");
  const title = (meta?.info?.Title || "").trim() || fileName;
  const text = pages
    .join("\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  return { title, text };
}

function isPdf(res, url) {
  const type = res.headers.get("content-type") || "";
  return type.includes("application/pdf") || /\.pdf$/i.test(new URL(url).pathname);
}

// ── Crawl ─────────────────────────────────────────────────────────────────────

/**
 * Crawls one source, calling `onPage({ url, title, text })` for every HTML page
 * and PDF. Links are followed up to `source.maxDepth` clicks from a start URL.
 * Resolves with crawl statistics.
 *
 *   gone       URLs that answered 404/410 (really removed).
 *   failed     URLs that errored for other reasons (site down, timeout…).
 *   hitLimit   true if maxPages stopped the crawl early.
 */
async function crawlSource(source, onPage) {
  const maxPages = source.maxPages || 200;
  const delayMs = source.delayMs ?? 1000;
  const maxDepth = source.maxDepth ?? Infinity;

  const robotsByOrigin = new Map();
  const queue = source.startUrls
    .map((u) => normalizeUrl(u))
    .filter(Boolean)
    .map((url) => ({ url, depth: 0 }));
  const seen = new Set(queue.map((item) => item.url));
  const stats = { fetched: 0, gone: [], failed: [], hitLimit: false };

  while (queue.length) {
    if (stats.fetched >= maxPages) {
      stats.hitLimit = true;
      break;
    }
    const { url, depth } = queue.shift();
    const { origin } = new URL(url);

    if (!robotsByOrigin.has(origin)) robotsByOrigin.set(origin, await loadRobots(origin));
    if (!allowedByRobots(url, robotsByOrigin.get(origin))) continue;

    let res;
    try {
      res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/pdf" },
        redirect: "follow",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      stats.failed.push(url);
      console.warn(`  ! ${url} – ${err.message}`);
      await sleep(delayMs);
      continue;
    }

    stats.fetched++;
    if (res.status === 404 || res.status === 410) {
      stats.gone.push(url);
    } else if (!res.ok) {
      stats.failed.push(url);
      console.warn(`  ! ${url} – HTTP ${res.status}`);
    } else {
      // A redirect may land outside the source; ignore those pages.
      const finalUrl = normalizeUrl(res.url) || url;
      const inSource = finalUrl === url || inScope(finalUrl, source);
      const isHtml = (res.headers.get("content-type") || "").includes("text/html");

      if (inSource && isPdf(res, finalUrl)) {
        const size = Number(res.headers.get("content-length")) || 0;
        if (size > MAX_PDF_BYTES) {
          console.warn(`  ! ${finalUrl} – PDF too large (${Math.round(size / 1e6)} MB), skipped`);
        } else {
          try {
            const page = await extractPdf(await res.arrayBuffer(), finalUrl);
            if (page.text.length >= MIN_TEXT_CHARS) await onPage({ url: finalUrl, ...page });
            else console.warn(`  ! ${finalUrl} – no text in PDF (scanned image?), skipped`);
          } catch (err) {
            stats.failed.push(url);
            console.warn(`  ! ${finalUrl} – could not read PDF: ${err.message}`);
          }
        }
      } else if (inSource && isHtml) {
        const page = extractPage(await res.text(), finalUrl);
        if (page.text.length >= MIN_TEXT_CHARS) {
          await onPage({ url: finalUrl, title: page.title, text: page.text });
        } else {
          console.warn(`  ! ${finalUrl} – almost no text (page may need JavaScript), skipped`);
        }
        if (depth < maxDepth) {
          const links = source.followLinks === "content" ? page.contentLinks : page.links;
          for (const link of links) {
            if (!seen.has(link) && inScope(link, source)) {
              seen.add(link);
              queue.push({ url: link, depth: depth + 1 });
            }
          }
        }
      }
    }

    await sleep(delayMs);
  }

  return stats;
}

module.exports = { crawlSource, extractPage, normalizeUrl, inScope };
