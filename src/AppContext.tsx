// ── AppContext.tsx ───────────────────────────────────────────────────
// Provides the app language and the signed-in user to all screens.
//
// The language only changes the screens: it is remembered on this device and
// can be switched at any time without touching saved data. The session token
// is kept in secure storage so the user stays signed in.
import * as React from "react";
import { LangCode, LANGUAGES } from "./translations";
import { User, getMe, logout as apiLogout, setAuthToken } from "./api/client";
import { getItem, setItem, removeItem } from "./api/storage";

const LANG_KEY = "careconnect.lang";
const SESSION_KEY = "careconnect.session";

type AppCtx = {
    lang: LangCode;
    setLang: (l: LangCode) => void;
    /** The signed-in user, or null for a guest (nothing is saved on the server). */
    user: User | null;
    setUser: (u: User | null) => void;
    /** false until the saved language and session have been loaded. */
    ready: boolean;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
};

export const AppContext = React.createContext<AppCtx>({
    lang: "en",
    setLang: () => { },
    user: null,
    setUser: () => { },
    ready: false,
    signIn: async () => { },
    signOut: async () => { },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = React.useState<LangCode>("en");
    const [user, setUser] = React.useState<User | null>(null);
    const [ready, setReady] = React.useState(false);

    // Restore the language and the session saved on this device.
    React.useEffect(() => {
        (async () => {
            const savedLang = await getItem(LANG_KEY);
            if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) setLangState(savedLang as LangCode);

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

    const signIn = React.useCallback(async (token: string, u: User) => {
        setAuthToken(token);
        await setItem(SESSION_KEY, token);
        setUser(u);
    }, []);

    const signOut = React.useCallback(async () => {
        try {
            await apiLogout();
        } catch {
            // Signed out on this device anyway.
        }
        setAuthToken(null);
        await removeItem(SESSION_KEY);
        setUser(null);
    }, []);

    return (
        <AppContext.Provider value={{ lang, setLang, user, setUser, ready, signIn, signOut }}>
            {children}
        </AppContext.Provider>
    );
}

export function useLang() {
    return React.useContext(AppContext);
}

export const useApp = useLang;
