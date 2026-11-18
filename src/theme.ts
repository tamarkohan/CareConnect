// ── theme.ts ─────────────────────────────────────────────────────────
// Dark mode (Menu → Settings → Appearance: light, dark or the phone's setting).
//
// Every screen keeps its colours and styles as written, for the light look.
// themedColors() and themedStyles() give back the same colours and styles, but
// while the dark look is on, every colour is swapped for its dark partner: the
// DARK table below for the app's own colours, a computed one for any other.
// AppContext switches the look before the screens render, and every screen
// re-renders when it changes. Colours written straight into a screen (not in
// its colour list or style sheet) go through tc().
import { StyleSheet } from "react-native";

let darkOn = false;
/** Called by AppContext when the look changes (before the screens render). */
export const setDarkMode = (on: boolean) => {
    darkOn = on;
};
export const isDarkMode = () => darkOn;

// The app's light colours → their dark partners. Backgrounds become dark,
// text becomes light, and accent colours get lighter so they still stand out.
const DARK: Record<string, string> = {
    // Surfaces and text
    "#f3faff": "#0e171d",   // page background
    "#ffffff": "#18232b",   // cards (and text on blue buttons, which then reads dark on light blue)
    "#cfe6f2": "#2b3b46",   // borders, lines
    "#071e27": "#e3edf2",   // main text
    "#414752": "#a7b3bd",   // grey text
    "#c1c6d4": "#4a5560",
    "#f5f5f5": "#1f2a31",
    "#8a93a0": "#8a93a0",
    "#000000": "#000000",   // shadows
    // Blues
    "#005dac": "#4ea3ec",
    "#1565c0": "#64b0f5",
    "#dcebf7": "#1e3a52",   // selected tab, active menu pill
    "#e8f4ff": "#14283a",
    "#e3f2fd": "#14283a",
    "#f0f8ff": "#162a3c",
    // Reds and pinks
    "#c62828": "#ff7a7a",
    "#ba1a1a": "#ff7a7a",
    "#ef5350": "#ff7b78",
    "#ef9a9a": "#c26666",
    "#ffebee": "#3a1d22",
    "#fff0f0": "#3a1c1c",
    "#f3c4c4": "#5a2a2a",
    "#fce4ec": "#331d25",
    "#f8bbd0": "#5a2a3a",
    // Greens
    "#2e7d32": "#6fcf7a",
    "#006e1c": "#5fd17a",
    "#4caf50": "#5fc464",
    "#e8f5e9": "#15291b",
    "#c8e6c9": "#2c4a31",
    "#a5d6a7": "#3f6b43",
    "#d4e8c2": "#1f2e19",   // map placeholder
    "#c8dfc8": "#22351f",
    // Purples
    "#7c3aed": "#b794ff",
    "#6a1b9a": "#c58af0",
    "#7b1fa2": "#cf8ae8",
    "#4c1d95": "#d6c4ff",
    "#f3e8ff": "#261c3a",
    "#f0e6ff": "#271c3a",
    "#f3e5f5": "#2a1c30",
    "#e9d5ff": "#3b2c5a",
    "#e1bee7": "#4a2f52",
    // Yellows, oranges, browns
    "#fff8e1": "#2e2814",
    "#fff7e0": "#2e2814",
    "#fff3e0": "#33240f",
    "#ffdfa0": "#3d3218",
    "#f8bd2a": "#f8bd2a",
    "#ffd600": "#ffd600",
    "#e6a817": "#f0b93a",
    "#b45309": "#f0a050",
    "#775800": "#e6c46a",
    "#8d6e00": "#e0c050",
    "#d4a976": "#a88456",
    "#e65100": "#ff9a4d",
    "#f57f17": "#ffa94d",
    "#f57c00": "#ffa04d",
};

type Rgba = { r: number; g: number; b: number; a: number };

function parse(color: string): Rgba | null {
    const c = color.trim().toLowerCase();
    let m = c.match(/^#([0-9a-f]{3})$/);
    if (m) {
        const [r, g, b] = m[1].split("").map((x) => parseInt(x + x, 16));
        return { r, g, b, a: 1 };
    }
    m = c.match(/^#([0-9a-f]{6})$/);
    if (m) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
    m = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
    return null;
}

const hex = ({ r, g, b }: Rgba) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

function toHsl({ r, g, b }: Rgba) {
    const [rr, gg, bb] = [r / 255, g / 255, b / 255];
    const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
    const l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === rr ? ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6 : max === gg ? ((bb - rr) / d + 2) / 6 : ((rr - gg) / d + 4) / 6;
    return { h, s, l };
}

function fromHsl(h: number, s: number, l: number): Rgba {
    if (s === 0) return { r: l * 255, g: l * 255, b: l * 255, a: 1 };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const f = (t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return { r: f(h + 1 / 3) * 255, g: f(h) * 255, b: f(h - 1 / 3) * 255, a: 1 };
}

const cache = new Map<string, string>();

/** The dark partner of a light-look colour. */
export function darkColor(color: string): string {
    const known = cache.get(color);
    if (known) return known;
    const rgba = parse(color);
    let result = color;   // "transparent" and anything unknown stay as they are
    if (rgba) {
        const solid = hex(rgba);
        if (rgba.a <= 0.6 && rgba.r + rgba.g + rgba.b < 150) {
            result = color;   // a dark see-through layer (behind pop-ups) works on both looks
        } else if (DARK[solid]) {
            const d = parse(DARK[solid])!;
            result = rgba.a === 1 ? DARK[solid] : `rgba(${d.r}, ${d.g}, ${d.b}, ${rgba.a})`;
        } else {
            const { h, s, l } = toHsl(rgba);
            // Light backgrounds become dark ones, dark text becomes light, accents get lighter.
            const nl = l > 0.85 ? 0.13 + (1 - l) * 0.9 : l < 0.3 ? 0.88 - l * 0.4 : Math.min(l + 0.15, 0.78);
            const d = fromHsl(h, l > 0.85 ? s * 0.5 : s, nl);
            result = rgba.a === 1 ? hex(d) : `rgba(${Math.round(d.r)}, ${Math.round(d.g)}, ${Math.round(d.b)}, ${rgba.a})`;
        }
    }
    cache.set(color, result);
    return result;
}

/** One colour in the current look (for colours written straight into a screen). */
export const tc = (color: string) => (darkOn ? darkColor(color) : color);

/** A screen's colour list, giving each colour in the current look. */
export function themedColors<T extends Record<string, string>>(colors: T): T {
    return new Proxy({} as T, {
        get: (_, key) => {
            const value = colors[key as keyof T];
            return typeof value === "string" ? tc(value) : value;
        },
        has: (_, key) => key in colors,
        ownKeys: () => Reflect.ownKeys(colors),
        getOwnPropertyDescriptor: (_, key) => ({ ...Object.getOwnPropertyDescriptor(colors, key), configurable: true }),
    });
}

/** Style values that are colours: color, backgroundColor, borderTopColor, shadowColor… */
const isColorKey = (key: string) => key === "color" || key.endsWith("Color");

function darkStyle(style: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(style)) {
        out[key] = isColorKey(key) && typeof value === "string" ? darkColor(value) : value;
    }
    return out;
}

/**
 * Like StyleSheet.create, written for the light look; while the dark look is on,
 * the same names give the dark version (made once, with every colour swapped).
 * `darkOverrides` sets values for the dark look by hand, e.g. white text that
 * sits on a photo and has to stay white.
 */
export function themedStyles<T extends StyleSheet.NamedStyles<T>>(
    styles: T & StyleSheet.NamedStyles<any>,
    darkOverrides: { [K in keyof T]?: Record<string, unknown> } = {}
): T {
    const light = StyleSheet.create(styles);
    const dark = StyleSheet.create(
        Object.fromEntries(
            Object.entries(styles).map(([name, style]) => [
                name,
                { ...darkStyle(style as Record<string, unknown>), ...darkOverrides[name as keyof T] },
            ])
        ) as unknown as T
    );
    return new Proxy({} as T, {
        get: (_, key) => (darkOn ? dark : light)[key as keyof T],
        has: (_, key) => key in light,
    });
}
