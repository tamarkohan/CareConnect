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
    // gov.il blocks crawlers on its web pages (HTTP 403) but serves its
    // documents, so we list the official PDFs directly.
    // To add one: open the document on gov.il, copy its PDF link
    // (https://www.gov.il/BlobFolder/...) and add it below.
    id: "govil-foreign-workers",
    name: "Gov.il – Employment of foreign workers",
    startUrls: [
      // Population and Immigration Authority – Foreign Workers' Rights booklet (2026).
      "https://www.gov.il/BlobFolder/policy/bileteral-forms-foreign-workers/he/foreign_workers_rights_booklets_en2026.pdf",
      // Special limitations for foreign caregivers who want to change employer.
      "https://www.gov.il/BlobFolder/policy/special_restrictions_for_nursing_workers_wishing_to_replace_their_employer/he/special_limitations_siud_en_1118_short.pdf",
      // Standard Employment Contract for live-in caregivers – version A (employer is the person with disability), 2026.
      "https://www.gov.il/BlobFolder/policy/bileteral-forms-nursing/he/SEC_version_A_English2026.pdf",
      // Standard Employment Contract for live-in caregivers – version B, 2026.
      "https://www.gov.il/BlobFolder/policy/bileteral-forms-nursing/he/sec-b-ph-nursing2026.pdf",
    ],
    include: ["https://www.gov.il/BlobFolder/"],
    maxDepth: 0,
    maxPages: 50,
    delayMs: 1500,
  },
];
