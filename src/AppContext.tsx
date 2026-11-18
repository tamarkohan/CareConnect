// ── AppContext.tsx ───────────────────────────────────────────────────
// Provides the app language, the look (light / dark) and the signed-in user to
// all screens.
//
// The language and the look only change the screens: they are remembered on
// this device and can be switched at any time without touching saved data. The
// session token is kept in secure storage so the user stays signed in.
import * as React from "react";
import { useColorScheme } from "react-native";
import { LangCode, LANGUAGES } from "./translations";
import { User, getMe, updateMe, logout as apiLogout, setAuthToken } from "./api/client";
import { getItem, setItem, removeItem } from "./api/storage";
import { cancelTaskReminders } from "./reminders";
import { setDarkMode } from "./theme";

const LANG_KEY = "careconnect.lang";
const APPEARANCE_KEY = "careconnect.appearance";
export type Appearance = "system" | "light" | "dark";
const APPEARANCES: Appearance[] = ["system", "light", "dark"];
const SESSION_KEY = "careconnect.session";

type AppCtx = {
    lang: LangCode;
    setLang: (l: LangCode) => void;
    /** Menu → Settings → Appearance; "system" follows the phone's light / dark setting. */
    appearance: Appearance;
    setAppearance: (a: Appearance) => void;
    /** The dark look is on (see theme.ts). */
    dark: boolean;
    /** The signed-in user, or null for a guest (nothing is saved on the server). */
    user: User | null;
    setUser: (u: User | null) => void;
    /** false until the saved language and session have been loaded. */
    ready: boolean;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
    /** The short welcome guide (bottom-nav buttons): opens after an account's first sign-in, and from Menu → App Guide. */
    guideOpen: boolean;
    setGuideOpen: (open: boolean) => void;
};

export const AppContext = React.createContext<AppCtx>({
    lang: "en",
    setLang: () => { },
    appearance: "system",
    setAppearance: () => { },
    dark: false,
    user: null,
    setUser: () => { },
    ready: false,
    signIn: async () => { },
    signOut: async () => { },
    guideOpen: false,
    setGuideOpen: () => { },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = React.useState<LangCode>("en");
    const [user, setUser] = React.useState<User | null>(null);
    const [ready, setReady] = React.useState(false);
    const [guideOpen, setGuideOpen] = React.useState(false);
    const [appearance, setAppearanceState] = React.useState<Appearance>("system");
    const phoneScheme = useColorScheme();
    const dark = appearance === "dark" || (appearance === "system" && phoneScheme === "dark");
    // Before the screens render, so their colours and styles come in the right look.
    setDarkMode(dark);

    // Restore the language, the look and the session saved on this device.
    React.useEffect(() => {
        (async () => {
            const savedLang = await getItem(LANG_KEY);
            if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) setLangState(savedLang as LangCode);
            const savedAppearance = await getItem(APPEARANCE_KEY);
            if (APPEARANCES.includes(savedAppearance as Appearance)) setAppearanceState(savedAppearance as Appearance);

            const token = await getItem(SESSION_KEY);
            if (token) {
                setAuthToken(token);
                try {
                    setUser((await getMe()).user);
                } catch (err: any) {
                    // Only forget the session if the server says it's no longer valid,
                    // not when the network is down.
                    if (err?.status === 401) {
                        setAuthToken(null);
                        await removeItem(SESSION_KEY);
                    }
                }
            }
            setReady(true);
        })();
    }, []);

    const setLang = React.useCallback((l: LangCode) => {
        setLangState(l);
        setItem(LANG_KEY, l);
    }, []);

    const setAppearance = React.useCallback((a: Appearance) => {
        setAppearanceState(a);
        setItem(APPEARANCE_KEY, a);
    }, []);

    const signIn = React.useCallback(async (token: string, u: User) => {
        setAuthToken(token);
        await setItem(SESSION_KEY, token);
        setUser(u);
        // The first sign-in of an account shows the short guide, once; the server
        // remembers it was seen, so later sign-ins (on any device) don't.
        if (!u.guideSeen) {
            setGuideOpen(true);
            updateMe({ guideSeen: true }).then((r) => setUser(r.user)).catch(() => { });
        }
    }, []);

    const signOut = React.useCallback(async () => {
        try {
            await apiLogout();
        } catch {
            // Signed out on this device anyway.
        }
        setAuthToken(null);
        await removeItem(SESSION_KEY);
        await cancelTaskReminders();   // they belong to the account that signed out
        setUser(null);
        setGuideOpen(false);
    }, []);

    return (
        <AppContext.Provider value={{ lang, setLang, appearance, setAppearance, dark, user, setUser, ready, signIn, signOut, guideOpen, setGuideOpen }}>
            {children}
        </AppContext.Provider>
    );
}

export function useLang() {
    return React.useContext(AppContext);
}

export const useApp = useLang;
