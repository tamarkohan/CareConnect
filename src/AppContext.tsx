// ── AppContext.tsx ───────────────────────────────────────────────────
// Provides language state to all screens via React Context.
import * as React from "react";
import { LangCode } from "./translations";

type AppCtx = {
    lang: LangCode;
    setLang: (l: LangCode) => void;
};

export const AppContext = React.createContext<AppCtx>({
    lang: "en",
    setLang: () => { },
});

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = React.useState<LangCode>("en");
    return (
        <AppContext.Provider value={{ lang, setLang }}>
            {children}
        </AppContext.Provider>
    );
}

export function useLang() {
    return React.useContext(AppContext);
}
