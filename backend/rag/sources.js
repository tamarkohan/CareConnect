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
 *   maxPages   Safety cap per run (keeps DB size and Gemini quota in check).
 *   delayMs    Pause between requests, to be polite to the site (default 1000).
 *
 * The crawler fetches plain HTML. Sites that render their text with JavaScript
 * (for example most of gov.il) or block bots won't return content this way;
 * the sync log shows "0 pages" for those.
 *
 * ⚠️ These are starting examples — replace them with the sites your team chose.
 */

module.exports = [
  {
    id: "kolzchut-en",
    name: "Kol Zchut (All Rights) – English",
    startUrls: ["https://www.kolzchut.org.il/en/Foreign_Workers_in_the_Caregiving_Sector"],
    include: ["https://www.kolzchut.org.il/en/"],
    // MediaWiki pages that aren't articles.
    exclude: [/[?&](action|oldid|diff|printable)=/, /\/en\/(Special|File|Talk|User|Category|Template):/i],
    maxPages: 400,
  },
  {
    id: "kolzchut-he",
    name: "כל זכות – עובדים זרים בסיעוד",
    startUrls: ["https://www.kolzchut.org.il/he/עובדים_זרים_בענף_הסיעוד"],
    include: ["https://www.kolzchut.org.il/he/"],
    exclude: [/[?&](action|oldid|diff|printable)=/, /\/he\/(מיוחד|קובץ|שיחה|משתמש|קטגוריה|תבנית):/],
    maxPages: 400,
  },
  {
    id: "kavlaoved-en",
    name: "Kav LaOved (Workers' Hotline)",
    startUrls: ["https://www.kavlaoved.org.il/en/"],
    include: ["https://www.kavlaoved.org.il/en/"],
    exclude: [/\/wp-(admin|login|json)/, /\/feed\/?$/, /[?&](replytocom|share)=/],
    maxPages: 300,
  },
];
