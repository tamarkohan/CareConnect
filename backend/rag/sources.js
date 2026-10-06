/**
 * rag/sources.js
 *
 * The websites the legal bot learns from. `npm run sync` crawls each one,
 * stores new/changed pages and removes pages that disappeared from the site.
 * The GitHub Action in .github/workflows/sync-knowledge.yml runs it every day.
 *
 * Fields:
 *   id         Short stable id. Changing it re-crawls the site from scratch.
 *   name       Shown to the model as the source name.
 *   startUrls  Where the crawl starts.
 *   include    Only URLs starting with one of these prefixes are crawled.
 *              Use the site root (e.g. "https://example.org/") for a whole site.
 *   exclude    Optional regexes; matching URLs are skipped.
 *   maxDepth   Optional: how many links away from a start URL to follow
 *              (0 = only the start URLs, 1 = plus the pages they link to, …).
 *   followLinks  Optional: "content" = only follow links in the page's main
 *              text, not menus/header/footer. Default: all links.
 *   maxPages   Safety cap per run (keeps DB size and Gemini quota in check).
 *   delayMs    Pause between requests, to be polite to the site (default 1000).
 *
 * Both HTML pages and PDFs are read. Pages that build their text with
 * JavaScript, or sites that block bots, can't be read this way — the sync log
 * marks them with "almost no text" or "HTTP 403".
 */

module.exports = [
  {
    id: "govil-foreign-workers",
    name: "Gov.il – Employment of foreign workers",
    startUrls: [
      "https://www.gov.il/en/departments/topics/foreign_workers_employment",
      // Population and Immigration Authority – Foreign Workers' Rights booklet (2026).
      "https://www.gov.il/BlobFolder/policy/bileteral-forms-foreign-workers/he/foreign_workers_rights_booklets_en2026.pdf",
    ],
    // gov.il is huge: stay in English pages and gov.il documents (PDFs), and
    // only follow links in the page content, at most two links deep.
    include: ["https://www.gov.il/en/", "https://www.gov.il/BlobFolder/"],
    exclude: [/\/en\/(search|Search)/, /[?&](skip|limit|page)=/],
    followLinks: "content",
    maxDepth: 2,
    maxPages: 300,
    delayMs: 1500,
  },
];
