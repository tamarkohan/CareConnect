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
import { T } from "../translations";

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
    { labelKey: "navTranslator" as const, emoji: "交", screen: "Translator" },
    { labelKey: "navAssistant" as const, emoji: "✦", screen: "Assistant" },
    { labelKey: "navCommunity" as const, emoji: "👥", screen: "Community" },
    { labelKey: "navTasks" as const, emoji: "📋", screen: "Tasks" },
    { labelKey: "navJournal" as const, emoji: "♡", screen: "Journal", active: true },
];

// ── Book tabs ─────────────────────────────────────────────────────────
type BookType = "burden" | "gratitude";

// ── Mood emojis ───────────────────────────────────────────────────────
const MOODS = ["😢", "😐", "🙂", "😊", "😄"];

// ── Past entries ──────────────────────────────────────────────────────
type Entry = {
    id: string;
    book: BookType;
    mood: string;
    date: string;
    text: string;
};

const INITIAL_ENTRIES: Entry[] = [
    {
        id: "1",
        book: "burden",
        mood: "😢",
        date: "Oct 24 · 8:30 PM",
        text: "Today was really hard. The language barrier made a simple doctor's visit incredibly stressful.",
    },
    {
        id: "2",
        book: "gratitude",
        mood: "😊",
        date: "Oct 23 · 9:00 AM",
        text: "I am grateful for a quiet morning and the successful completion of Mr. Cohen's physical therapy routine without any pain.",
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
    const [entries, setEntries] = React.useState<Entry[]>(INITIAL_ENTRIES);

    const placeholder = activeBook === "burden" ? "I want to release..." : "I am grateful for...";

    const saveEntry = () => {
        if (!entryText.trim()) return;
        const newEntry: Entry = {
            id: Date.now().toString(),
            book: activeBook,
            mood: selectedMood !== null ? MOODS[selectedMood] : "🙂",
            date: "Just now",
            text: entryText.trim(),
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
                <Text style={s.subheading}>A private space to release stress and record moments of gratitude.</Text>

                {/* Book tabs */}
                <View style={s.tabRow}>
                    <Pressable
                        style={[s.tab, activeBook === "burden" && s.tabActive]}
                        onPress={() => setActiveBook("burden")}
                    >
                        <Text style={s.tabEmoji}>🩶</Text>
                        <View>
                            <Text style={[s.tabTitle, activeBook === "burden" && s.tabTitleActive]}>
                                Burden Book
                            </Text>
                            <Text style={s.tabSub}>(Vent & release)</Text>
                        </View>
                    </Pressable>
                    <Pressable
                        style={[s.tab, activeBook === "gratitude" && s.tabActive]}
                        onPress={() => setActiveBook("gratitude")}
                    >
                        <Text style={s.tabEmoji}>💚</Text>
                        <View>
                            <Text style={[s.tabTitle, activeBook === "gratitude" && s.tabTitleActive]}>
                                Gratitude Book
                            </Text>
                            <Text style={s.tabSub}>(Positive moments)</Text>
                        </View>
                    </Pressable>
                </View>

                {/* Entry card */}
                <View style={s.entryCard}>
                    {/* Mood selector */}
                    <Text style={s.moodLabel}>HOW ARE YOU FEELING?</Text>
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
                        placeholder={placeholder}
                        placeholderTextColor={Color.mako}
                        value={entryText}
                        onChangeText={setEntryText}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    {/* Save button */}
                    <Pressable style={s.saveBtn} onPress={saveEntry}>
                        <Text style={s.saveBtnText}>Save Entry</Text>
                    </Pressable>
                </View>

                {/* Recent entries */}
                <Text style={s.sectionTitle}>Recent Entries</Text>
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
                                    <Text style={[
                                        s.entryBookText,
                                        entry.book === "burden" ? s.burdenText : s.gratitudeText,
                                    ]}>
                                        {entry.book === "burden" ? "Burden Book" : "Gratitude Book"}
                                    </Text>
                                </View>
                                <Text style={s.entryDate}>{entry.date}</Text>
                            </View>
                            <Text style={s.entryBody}>{entry.text}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* ── Bottom navigation Corregida para Huawei ── */}
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
                        <Text style={[s.navLabel, item.active && s.navLabelActive]}>{t[item.labelKey]}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

// ════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Color.aliceBlue },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Color.aliceBlue,
        borderBottomWidth: 1,
        borderBottomColor: Color.linkWater,
    },
    menuBtn: { padding: 4 },
    menuIcon: { fontSize: 20, color: Color.blackPearl },
    title: { fontSize: 18, fontWeight: "700", color: Color.endeavour },
    globeBtn: { padding: 4 },
    globeIcon: { fontSize: 20 },
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
    tab: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8 },
    tabActive: { borderWidth: 1.5, borderColor: Color.endeavour, backgroundColor: "#f0f8ff" },
    tabEmoji: { fontSize: 20 },
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
    entryHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    entryMood: { fontSize: 20 },
    entryBookBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
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