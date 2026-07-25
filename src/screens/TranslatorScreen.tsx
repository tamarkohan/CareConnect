import * as React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { useLang } from "../AppContext";
import { T, LangCode, formatRelativeTime } from "../translations";

// ── Tokens ───────────────────────────────────────────────────────────
const Color = {
    aliceBlue: "#f3faff",
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    silver: "#c1c6d4",

    // Input mode colors
    blueMic: "#005dac",
    yellowType: "#e6a817",
    greenScan: "#4caf50",

    // Tag colors
    medicalBg: "#e8f5e9",
    medicalText: "#2e7d32",
    slanBg: "#fff3e0",
    slanText: "#e65100",
    transitBg: "#e3f2fd",
    transitText: "#1565c0",
};

// ── Nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { labelKey: "navHome" as const, emoji: "🏠", screen: "Home" },
    { labelKey: "navTranslator" as const, emoji: "🔤", screen: "Translator", active: true },
    { labelKey: "navAssistant" as const, emoji: "⚖", screen: "Assistant" },
    { labelKey: "navCommunity" as const, emoji: "👥", screen: "Community" },
    { labelKey: "navTasks" as const, emoji: "📋", screen: "Tasks" },
    { labelKey: "navJournal" as const, emoji: "📓", screen: "Journal" },
];

// ── Translation history data model ────────────────────────────────────
// A category is a label id — the display string is looked up from `T`
// so it renders in whichever language is currently selected.
type TranslationCategory = "medical" | "slang" | "transit";

const CATEGORY_STYLE: Record<TranslationCategory, { bg: string; text: string }> = {
    medical: { bg: Color.medicalBg, text: Color.medicalText },
    slang: { bg: Color.slanBg, text: Color.slanText },
    transit: { bg: Color.transitBg, text: Color.transitText },
};

const CATEGORY_LABEL_KEY: Record<TranslationCategory, "catMedical" | "catSlang" | "catTransit"> = {
    medical: "catMedical",
    slang: "catSlang",
    transit: "catTransit",
};

type TranslationEntry = {
    id: string;
    category: TranslationCategory;
    // Real timestamp (ms) so the displayed time is computed live and
    // always matches the currently selected language.
    timestamp: number;
    // The original Hebrew text — this never changes language, it's a
    // direct transcription/scan of what was actually said or written.
    hebrewText: string;
    // How to *read* the Hebrew out loud, spelled out per language
    // (e.g. "Tachana Merkazit" under "תחנה מרכזית").
    phonetic: Record<LangCode, string>;
    // The actual meaning of the phrase, in each language.
    translated: Record<LangCode, string>;
    // Optional literal-translation aside (e.g. "(Lit: he is wrung out)")
    note?: Partial<Record<LangCode, string>>;
};

// ─────────────────────────────────────────────────────────────────────
// ⚠️ SEED / EXAMPLE DATA ONLY.
//
// In production this list is per-user and would come from the backend
// or local device storage (e.g. a `useUserTranslations()` hook backed
// by an API call or AsyncStorage), populated every time the person
// uses the mic / write / camera flows below. The shape of each object
// (category, hebrewText, phonetic, translated) is exactly what any
// future translation-result payload should be normalized into before
// being appended here via `setRecentTranslations(prev => [entry, ...prev])`.
// ─────────────────────────────────────────────────────────────────────
const SEED_TRANSLATIONS: TranslationEntry[] = [
    {
        id: "1",
        category: "medical",
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        hebrewText: "לקחת פעמיים ביום אחרי האוכל",
        phonetic: {
            en: "Lakachat pa'amayim bayom acharei ha'ochel",
            tl: "Lakachat pa'amayim bayom acharei ha'ochel",
            ml: "ലകാഹത് പഅമായിം ബയോം അഹറേയ് ഹാഓഹെൽ",
            ru: "Лакахат паамаим баём ахарей аохель",
        },
        translated: {
            en: "Take twice a day after meals.",
            tl: "Inumin nang dalawang beses sa isang araw pagkatapos kumain.",
            ml: "ഭക്ഷണത്തിന് ശേഷം ദിവസത്തിൽ രണ്ടു തവണ കഴിക്കുക.",
            ru: "Принимайте два раза в день после еды.",
        },
    },
    {
        id: "2",
        category: "slang",
        timestamp: Date.now() - 26 * 60 * 60 * 1000, // yesterday
        hebrewText: "הוא היום קצת סחוט",
        phonetic: {
            en: "Hu hayom ktzat sachut",
            tl: "Hu hayom ktzat sachut",
            ml: "ഹു ഹയോം ക്റ്റാറ്റ് സഹൂത്",
            ru: "Ху хайом ктцат сахут",
        },
        translated: {
            en: "He's a bit exhausted today.",
            tl: "Medyo pagod siya ngayon.",
            ml: "അവന് ഇന്ന് അല്പം ക്ഷീണിതനാണ്.",
            ru: "Он сегодня немного вымотан.",
        },
        note: {
            en: "(Lit: he is wrung out)",
            tl: "(Literal: siya ay pinigain)",
            ml: "(അക്ഷരാർത്ഥത്തിൽ: അവൻ പിഴിഞ്ഞെടുത്തു)",
            ru: "(Букв.: он выжат)",
        },
    },
    {
        id: "3",
        category: "transit",
        timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // a few days ago
        hebrewText: "תחנה מרכזית",
        phonetic: {
            en: "Tachana Merkazit",
            tl: "Tachana Merkazit",
            ml: "തഹാന മെർകസീത്",
            ru: "Тахана Мерказит",
        },
        translated: {
            en: "Central Station",
            tl: "Sentral na Istasyon",
            ml: "സെൻട്രൽ സ്റ്റേഷൻ",
            ru: "Центральная станция",
        },
    },
];

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function TranslatorScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang } = useLang();
    const t = T[lang];

    // Seeded with example data for now — see SEED_TRANSLATIONS comment
    // above for how this plugs into real per-user data later.
    const [recentTranslations, setRecentTranslations] = React.useState<TranslationEntry[]>(SEED_TRANSLATIONS);

    return (
        <View style={[s.root, { paddingTop: insets.top }]}>
            {/* ── Top bar Real Conectada ── */}
            <TopBar title={t.navTranslator} navigation={navigation} />

            {/* ── Content ── */}
            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Heading */}
                <Text style={s.heading}>{t.translatorHeading}</Text>
                <Text style={s.subheading}>{t.translatorSub}</Text>

                {/* Info card */}
                <View style={s.infoCard}>
                    <Text style={s.infoIcon}>ℹ</Text>
                    <View style={s.infoContent}>
                        <Text style={s.infoTitle}>{t.infoCardText}</Text>
                        <Text style={s.infoHighlight}>{t.infoCardHighlight}</Text>
                    </View>
                </View>

                {/* Input modes */}
                <View style={s.inputModes}>
                    <Pressable style={[s.mode, s.modeMic]} onPress={() => { }}>
                        <Text style={s.modeEmoji}>🎤</Text>
                        <Text
                            style={s.modeLabel}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            {t.speakTranslate}
                        </Text>
                    </Pressable>
                    <Pressable style={[s.mode, s.modeType]} onPress={() => { }}>
                        <Text style={s.modeEmoji}>✏</Text>
                        <Text
                            style={s.modeLabel}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            {t.writeAny}
                        </Text>
                    </Pressable>
                    <Pressable style={[s.mode, s.modeScan]} onPress={() => { }}>
                        <Text style={s.modeEmoji}>📷</Text>
                        <Text
                            style={s.modeLabel}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            {t.scanPhoto}
                        </Text>
                    </Pressable>
                </View>

                {/* Recent translations */}
                <Text style={s.recentTitle}>{t.recentTranslations}</Text>
                <View style={s.recentList}>
                    {recentTranslations.map((item) => {
                        const cat = CATEGORY_STYLE[item.category];
                        const note = item.note?.[lang];
                        return (
                            <Pressable key={item.id} style={s.recentItem} onPress={() => { }}>
                                {/* Tag */}
                                <View style={[s.tag, { backgroundColor: cat.bg }]}>
                                    <Text style={[s.tagText, { color: cat.text }]}>
                                        {t[CATEGORY_LABEL_KEY[item.category]]}
                                    </Text>
                                    <Text style={s.tagTime}>
                                        {formatRelativeTime(new Date(item.timestamp), lang)}
                                    </Text>
                                </View>

                                {/* Original Hebrew — always stays in Hebrew */}
                                <Text style={s.originalText}>{item.hebrewText}</Text>

                                {/* Phonetic reading, in the current language */}
                                <Text style={s.phoneticText}>{item.phonetic[lang]}</Text>

                                {/* Translated meaning with optional note */}
                                <View style={s.translatedRow}>
                                    <Text style={s.translatedIcon}>↪</Text>
                                    <View style={s.translatedContent}>
                                        <Text style={s.translatedText}>{item.translated[lang]}</Text>
                                        {note ? (
                                            <Text style={s.translatedNote}>{note}</Text>
                                        ) : null}
                                    </View>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            {/* ── Bottom navigation ── */}
            <View style={[s.bottomNav, { paddingBottom: 12 + insets.bottom }]}>
                {NAV_ITEMS.map((item) => (
                    <Pressable
                        key={item.labelKey}
                        style={s.navItem}
                        onPress={() => {
                            if (!item.active) navigation?.navigate(item.screen);
                        }}
                    >
                        <Text style={[s.navEmoji, item.active && s.navEmojiActive]}>
                            {item.emoji}
                        </Text>
                        <Text
                            style={[s.navLabel, item.active && s.navLabelActive]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            {t[item.labelKey]}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

// ════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Color.aliceBlue },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
        gap: 16,
    },
    heading: { fontSize: 20, fontWeight: "700", color: Color.blackPearl },
    subheading: { fontSize: 14, color: Color.mako, marginBottom: 4 },
    infoCard: {
        backgroundColor: "#f3e5f5",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e1bee7",
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        gap: 12,
    },
    infoIcon: { fontSize: 20, color: "#7b1fa2", marginTop: 2 },
    infoContent: { flex: 1, gap: 8 },
    infoTitle: { fontSize: 13, color: "#6a1b9a", fontWeight: "600", lineHeight: 18 },
    infoHighlight: { fontSize: 11, color: "#6a1b9a", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    inputModes: { flexDirection: "row", gap: 10, marginVertical: 8 },
    mode: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 4,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 84,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    modeMic: { backgroundColor: Color.blueMic },
    modeType: { backgroundColor: Color.yellowType },
    modeScan: { backgroundColor: Color.greenScan },
    modeEmoji: { fontSize: 22 },
    modeLabel: { fontSize: 12, lineHeight: 15, fontWeight: "600", color: Color.white, textAlign: "center" },
    recentTitle: { fontSize: 16, fontWeight: "700", color: Color.blackPearl, marginTop: 8 },
    recentList: { gap: 12 },
    recentItem: {
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.linkWater,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", rowGap: 2 },
    tagText: { fontSize: 11, fontWeight: "600" },
    tagTime: { fontSize: 10, color: Color.mako },
    originalText: { fontSize: 14, fontWeight: "600", color: Color.blackPearl, lineHeight: 20 },
    phoneticText: { fontSize: 12, color: Color.mako, fontStyle: "italic", lineHeight: 16, marginTop: -2 },
    translatedRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    translatedIcon: { fontSize: 14, color: Color.endeavour, marginTop: 2 },
    translatedContent: { flex: 1, gap: 2 },
    translatedText: { fontSize: 13, color: Color.endeavour, fontWeight: "500", lineHeight: 18 },
    translatedNote: { fontSize: 11, color: Color.mako, fontStyle: "italic" },
    bottomNav: {
        flexDirection: "row",
        backgroundColor: Color.aliceBlue,
        borderTopWidth: 1,
        borderTopColor: Color.linkWater,
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    navItem: { flex: 1, alignItems: "center", gap: 2 },
    navEmoji: { fontSize: 20 },
    navEmojiActive: { color: Color.endeavour },
    navLabel: { fontSize: 10, color: Color.mako },
    navLabelActive: { color: Color.endeavour, fontWeight: "600" },
});
