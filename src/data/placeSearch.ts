// ── placeSearch.ts ───────────────────────────────────────────────────
// Search for "Where are you now?": our cities (israelPlaces.ts), every other
// locality (israelLocalities.ts) and areas. Forgiving about spelling, since
// Hebrew names are written in English many ways: kibutz = kibbutz,
// Kfar = Kefar, Kiryat = Qiryat, Tzfat = Zefat, Beit = Bet… Hebrew works too.
// Words like "kibbutz" or "moshav" are ignored (the list doesn't say which
// places are kibbutzim), so "kibutz yagur" finds Yagur.
import { ISRAEL_PLACES, ISRAEL_AREAS } from "./israelPlaces";
import { CITY_NAMES, LOCALITIES } from "./israelLocalities";

/** also: another spelling to search by (the official one, e.g. "Be'er Sheva" for Beersheba). */
export type PlaceOption = { label: string; hebrew: string; also?: string; kind: "city" | "area" | "locality" };

// Same rules as scripts/build-localities.js.
const RULES: [RegExp, string][] = [[/tz|ts/g, "z"], [/ch|kh/g, "h"], [/ph/g, "f"], [/th/g, "t"], [/q|c/g, "k"], [/w|v/g, "b"]];
function normWord(w: string) {
    // Also drops Hebrew points and the geresh / gershayim.
    let x = w.toLowerCase().normalize("NFD").replace(/[̀-֑ͯ-ׇ]/g, "").replace(/[^\p{L}]/gu, "");
    for (const [re, to] of RULES) x = x.replace(re, to);
    return x.replace(/(.)\1+/g, "$1");
}
const words = (s: string) => s.split(/[\s\-–()/,.]+/).filter(Boolean);
const norm = (s: string) => words(s).map(normWord).join("");
// Without vowels (after the first letter): Ein = En, Kfar = Kefar, Haifa = Hefa.
const skeleton = (n: string) => n.charAt(0) + n.slice(1).replace(/[aeiouy]/g, "");
// Kinds of place people type but the names don't contain.
const IGNORED = new Set(["kibbutz", "kibutz", "kibbutzim", "kibutzim", "moshav", "moshava", "moshavim", "village"].map(normWord));

const OPTIONS: PlaceOption[] = [
    ...ISRAEL_PLACES.map((p) => ({ label: p.city, also: CITY_NAMES[p.city]?.[0], hebrew: CITY_NAMES[p.city]?.[1] ?? "", kind: "city" as const })),
    ...ISRAEL_AREAS.map(([label, hebrew]) => ({ label, hebrew, kind: "area" as const })),
    ...LOCALITIES.map(([label, hebrew]) => ({ label, hebrew, kind: "locality" as const })),
];
const INDEX = OPTIONS.map((o) => {
    const names = [o.label, o.also ?? "", o.hebrew];
    const ws = names.flatMap(words).map(normWord);
    return { o, all: names.map(norm).join(" "), ws, skels: ws.map(skeleton) };
});

export const ALL_PLACES = OPTIONS;
export const AREAS = OPTIONS.filter((o) => o.kind === "area");

/**
 * Best matches first: words that start with what was typed, then the typed
 * letters anywhere in the name, then the same without vowels (Ein = En).
 */
export function searchPlaces(query: string): PlaceOption[] {
    const tokens = words(query).map(normWord).filter((w) => w && !IGNORED.has(w));
    if (!tokens.length) return OPTIONS;
    const tiers: PlaceOption[][] = [[], [], []];
    for (const { o, all, ws, skels } of INDEX) {
        if (tokens.every((t) => ws.some((w) => w.startsWith(t)))) tiers[0].push(o);
        else if (tokens.every((t) => all.includes(t))) tiers[1].push(o);
        else if (tokens.every((t) => t.length >= 3 && skels.some((w) => w.startsWith(skeleton(t))))) tiers[2].push(o);
    }
    return tiers.flat();
}
