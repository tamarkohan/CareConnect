import * as React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { useLang } from "../AppContext";
import { T, LangCode, formatEntryDateTime } from "../translations";

// ── Tokens ───────────────────────────────────────────────────────────
const Color = {
    aliceBlue: "#f3faff",
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    silver: "rgba(193,198,212,0.3)",
    lightPink: "#fce4ec",
    pinkText: "#c62828",
    lightGreen: "#e8f5e9",
    greenText: "#2e7d32",
};

// ── Nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { labelKey: "navHome" as const, emoji: "🏠", screen: "Home" },
    { labelKey: "navTranslator" as const, emoji: "🔤", screen: "Translator" },
    { labelKey: "navAssistant" as const, emoji: "⚖️", screen: "Assistant" },
    { labelKey: "navCommunity" as const, emoji: "👥", screen: "Community" },
    { labelKey: "navTasks" as const, emoji: "📋", screen: "Tasks" },
    { labelKey: "navJournal" as const, emoji: "📓", screen: "Journal", active: true },
];

// ── Book tabs ─────────────────────────────────────────────────────────
type BookType = "burden" | "gratitude";

// ── Mood emojis ───────────────────────────────────────────────────────
const MOODS = ["😢", "😐", "🙂", "😊", "😄"];

// ── Entry data model ─────────────────────────────────────────────────
// ⚠️ SEED / EXAMPLE DATA ONLY.
//
// In production, entries are per-user and come from the backend or
// on-device storage, appended live via setEntries() every time the
// person saves a new entry below. Seed entries here happen to have
// text pre-translated in every language (pulled straight from T, so
// there's no duplication); real entries the user writes only exist in
// the language they typed — getEntryText() below gracefully falls
// back to whatever language is available so nothing ever renders blank.
type Entry = {
    id: string;
    book: BookType;
    mood: string;
    timestamp: number;
    text: Partial<Record<LangCode, string>>;
};

function getEntryText(entry: Entry, lang: LangCode): string {
    return entry.text[lang] ?? entry.text.en ?? Object.values(entry.text)[0] ?? "";
}

const buildSeedEntries = (): Entry[] => [
    {
        id: "1",
        book: "burden",
        mood: "😢",
        timestamp: Date.now() - 26 * 60 * 60 * 1000, // yesterday evening
        text: {
            en: T.en.journalEntry1,
            tl: T.tl.journalEntry1,
            ml: T.ml.journalEntry1,
            ru: T.ru.journalEntry1,
        },
    },
    {
        id: "2",
        book: "gratitude",
        mood: "😊",
        timestamp: Date.now() - 30 * 60 * 60 * 1000, // yesterday morning
        text: {
            en: T.en.journalEntry2,
            tl: T.tl.journalEntry2,
            ml: T.ml.journalEntry2,
            ru: T.ru.journalEntry2,
        },
    },
];

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function JournalScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang } = useLang();
    const t = T[lang];
    const [activeBook, setActiveBook] = React.useState<BookType>("gratitude");
    const [selectedMood, setSelectedMood] = React.useState<number | null>(3);
    const [entryText, setEntryText] = React.useState("");
    const [entries, setEntries] = React.useState<Entry[]>(buildSeedEntries());

    const saveEntry = () => {
        if (!entryText.trim()) return;
        const newEntry: Entry = {
            id: Date.now().toString(),
            book: activeBook,
            mood: selectedMood !== null ? MOODS[selectedMood] : "🙂",
            timestamp: Date.now(),
            // Only the language it was actually written in — see
            // getEntryText() for the display fallback.
            text: { [lang]: entryText.trim() },
        };
        setEntries((prev) => [newEntry, ...prev]);
        setEntryText("");
        setSelectedMood(null);
    };

    return (
        <View style={[s.root, { paddingTop: insets.top }]}>

            {/* ── Top bar Real Conectada ── */}
            <TopBar title={t.navJournal} navigation={navigation} />

            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={s.subheading}>{t.journalSub}</Text>

                {/* Book tabs */}
                <View style={s.tabRow}>
                    <Pressable
                        style={[s.tab, activeBook === "burden" && s.tabActive]}
                        onPress={() => setActiveBook("burden")}
                    >
                        <Text style={s.tabEmoji}>🩶</Text>
                        <View style={s.tabTextWrap}>
                            <Text
                                style={[s.tabTitle, activeBook === "burden" && s.tabTitleActive]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.8}
                            >
                                {t.burdenBook}
                            </Text>
                            <Text style={s.tabSub} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                                {t.burdenBookSub}
                            </Text>
                        </View>
                    </Pressable>
                    <Pressable
                        style={[s.tab, activeBook === "gratitude" && s.tabActive]}
                        onPress={() => setActiveBook("gratitude")}
                    >
                        <Text style={s.tabEmoji}>💚</Text>
                        <View style={s.tabTextWrap}>
                            <Text
                                style={[s.tabTitle, activeBook === "gratitude" && s.tabTitleActive]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.8}
                            >
                                {t.gratitudeBook}
                            </Text>
                            <Text style={s.tabSub} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                                {t.gratitudeBookSub}
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {/* Entry card */}
                <View style={s.entryCard}>
                    {/* Mood selector */}
                    <Text style={s.moodLabel}>{t.howFeeling}</Text>
                    <View style={s.moodRow}>
                        {MOODS.map((emoji, i) => (
                            <Pressable
                                key={i}
                                style={[s.moodBtn, selectedMood === i && s.moodBtnActive]}
                                onPress={() => setSelectedMood(i)}
                            >
                                <Text style={s.moodEmoji}>{emoji}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Text input */}
                    <TextInput
                        style={s.entryInput}
                        placeholder={activeBook === "burden" ? t.wantRelease : t.gratefulFor}
                        placeholderTextColor={Color.mako}
                        value={entryText}
                        onChangeText={setEntryText}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    {/* Save button */}
                    <Pressable style={s.saveBtn} onPress={saveEntry}>
                        <Text style={s.saveBtnText}>{t.saveEntry}</Text>
                    </Pressable>
                </View>

                {/* Recent entries */}
                <Text style={s.sectionTitle}>{t.recentEntries}</Text>
                <View style={s.entriesList}>
                    {entries.map((entry) => (
                        <View
                            key={entry.id}
                            style={[
                                s.entryItem,
                                entry.book === "burden" ? s.entryBurden : s.entryGratitude,
                            ]}
                        >
                            <View style={s.entryHeader}>
                                <Text style={s.entryMood}>{entry.mood}</Text>
                                <View style={[
                                    s.entryBookBadge,
                                    entry.book === "burden" ? s.burdenBadge : s.gratitudeBadge,
                                ]}>
                                    <Text
                                        style={[
                                            s.entryBookText,
                                            entry.book === "burden" ? s.burdenText : s.gratitudeText,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {entry.book === "burden" ? t.burdenBookLabel : t.gratitudeBookLabel}
                                    </Text>
                                </View>
                                <Text style={s.entryDate} numberOfLines={1}>
                                    {formatEntryDateTime(new Date(entry.timestamp), lang)}
                                </Text>
                            </View>
                            <Text style={s.entryBody}>{getEntryText(entry, lang)}</Text>
                        </View>
                    ))}
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
                        <Text style={[s.navEmoji, item.active && s.navEmojiActive]}>{item.emoji}</Text>
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
    scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 16 },
    subheading: { fontSize: 13, color: Color.mako, lineHeight: 18 },
    tabRow: {
        flexDirection: "row",
        gap: 12,
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.linkWater,
        padding: 8,
    },
    tab: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8, minWidth: 0 },
    tabActive: { borderWidth: 1.5, borderColor: Color.endeavour, backgroundColor: "#f0f8ff" },
    tabEmoji: { fontSize: 20 },
    tabTextWrap: { flex: 1, minWidth: 0 },
    tabTitle: { fontSize: 13, fontWeight: "600", color: Color.mako },
    tabTitleActive: { color: Color.blackPearl },
    tabSub: { fontSize: 10, color: Color.mako },
    entryCard: {
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.linkWater,
        padding: 16,
        gap: 14,
    },
    moodLabel: { fontSize: 12, fontWeight: "700", color: Color.blackPearl, textAlign: "center", letterSpacing: 0.5 },
    moodRow: { flexDirection: "row", justifyContent: "space-around" },
    moodBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
    moodBtnActive: { backgroundColor: Color.linkWater, borderWidth: 2, borderColor: Color.endeavour },
    moodEmoji: { fontSize: 28 },
    entryInput: {
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: Color.blackPearl,
        minHeight: 80,
        backgroundColor: Color.aliceBlue,
    },
    saveBtn: { backgroundColor: Color.endeavour, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
    saveBtnText: { fontSize: 15, fontWeight: "700", color: Color.white },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: Color.blackPearl },
    entriesList: { gap: 12 },
    entryItem: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, gap: 8, borderWidth: 1 },
    entryBurden: { backgroundColor: Color.lightPink, borderColor: "#f8bbd0" },
    entryGratitude: { backgroundColor: Color.lightGreen, borderColor: "#c8e6c9" },
    entryHeader: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", rowGap: 4 },
    entryMood: { fontSize: 20 },
    entryBookBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 1, maxWidth: "60%" },
    burdenBadge: { backgroundColor: "#fce4ec" },
    gratitudeBadge: { backgroundColor: "#e8f5e9" },
    entryBookText: { fontSize: 11, fontWeight: "700" },
    burdenText: { color: Color.pinkText },
    gratitudeText: { color: Color.greenText },
    entryDate: { fontSize: 11, color: Color.mako, marginLeft: "auto" },
    entryBody: { fontSize: 13, color: Color.blackPearl, lineHeight: 19 },
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