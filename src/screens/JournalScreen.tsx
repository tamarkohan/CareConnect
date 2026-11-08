import * as React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { useLang } from "../AppContext";
import { T, formatEntryDateTime } from "../translations";
import { TJ_T } from "../tasksJournalStrings";
import {
    ApiError, JournalBook, JournalEntry, addJournalEntry, deleteJournalEntry, getJournal, updateJournalEntry,
} from "../api/client";
import { confirmAction, shareText, showAlert } from "../api/platform";

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
    lightPurple: "#f3e8ff",
    purple: "#7c3aed",
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

// ── Mood emojis (the server accepts only these) ───────────────────────
const MOODS = ["😢", "😐", "🙂", "😊", "😄"];

// ── Entries ───────────────────────────────────────────────────────────
// Entries are saved on the server (per account, encrypted) in the language they
// were written in. New users get two example entries from the server, with one
// of these keys instead of a text, so they show in the current app language;
// they go away once the user has written an entry of their own.
const EXAMPLE_KEYS = ["journalEntry1", "journalEntry2"] as const;
type ExampleKey = (typeof EXAMPLE_KEYS)[number];
const isExampleKey = (k: string | null): k is ExampleKey => (EXAMPLE_KEYS as readonly (string | null)[]).includes(k);

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function JournalScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang } = useLang();
    const t = T[lang];
    const tj = TJ_T[lang];
    // No book chosen = all entries; a chosen book shows only its entries, and you write in it.
    const [activeBook, setActiveBook] = React.useState<JournalBook | null>(null);
    const [selectedMood, setSelectedMood] = React.useState<number | null>(3);
    const [entryText, setEntryText] = React.useState("");
    const [entries, setEntries] = React.useState<JournalEntry[] | null>(null);   // null = loading
    const [loadFailed, setLoadFailed] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [copiedId, setCopiedId] = React.useState<string | null>(null);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editText, setEditText] = React.useState("");
    const [editMood, setEditMood] = React.useState<string>("🙂");
    const [savingEdit, setSavingEdit] = React.useState(false);

    // Every change bumps this, so a slower load can't undo a change made meanwhile.
    const version = React.useRef(0);
    const load = React.useCallback(async () => {
        const asked = version.current;
        setLoadFailed(false);
        try {
            const { entries: list } = await getJournal();
            if (asked === version.current) setEntries(list);
        } catch {
            setLoadFailed(true);
        }
    }, []);
    React.useEffect(() => {
        load();
    }, [load]);

    const textOf = (entry: JournalEntry) => entry.text ?? (isExampleKey(entry.exampleKey) ? t[entry.exampleKey] : "");
    const bookLabel = (book: JournalBook) => (book === "burden" ? t.burdenBookLabel : t.gratitudeBookLabel);
    // Like the translator: the user's first own entry replaces the examples.
    const own = (entries ?? []).filter((e) => !e.exampleKey);
    const shown = (own.length ? own : entries ?? []).filter((e) => !activeBook || e.book === activeBook);
    const chooseBook = (book: JournalBook) => setActiveBook((current) => (current === book ? null : book));

    const saveEntry = async () => {
        const text = entryText.trim();
        if (!text || saving || !activeBook) return;
        version.current++;
        setSaving(true);
        try {
            const { entry } = await addJournalEntry(activeBook, selectedMood !== null ? MOODS[selectedMood] : undefined, text);
            setEntries((prev) => [entry, ...(prev ?? [])]);
            setEntryText("");
            setSelectedMood(null);
        } catch (err) {
            showAlert(err instanceof ApiError && err.code === "journalFull" ? tj.journalFull : tj.saveError);
        } finally {
            setSaving(false);
        }
    };

    const removeEntry = async (entry: JournalEntry) => {
        if (!(await confirmAction(tj.deleteEntryConfirm, tj.delete, tj.cancel))) return;
        version.current++;
        setEntries((prev) => prev && prev.filter((x) => x.id !== entry.id));
        try {
            await deleteJournalEntry(entry.id);
        } catch {
            showAlert(tj.saveError);
            load();
        }
    };

    const startEdit = (entry: JournalEntry) => {
        setEditingId(entry.id);
        setEditText(textOf(entry));
        setEditMood(entry.mood);
    };

    const saveEdit = async () => {
        const text = editText.trim();
        if (!editingId || !text || savingEdit) return;
        version.current++;
        setSavingEdit(true);
        try {
            const { entry } = await updateJournalEntry(editingId, editMood, text);
            setEntries((prev) => prev && prev.map((x) => (x.id === entry.id ? entry : x)));
            setEditingId(null);
        } catch {
            showAlert(tj.saveError);
        } finally {
            setSavingEdit(false);
        }
    };

    const shareEntry = async (entry: JournalEntry) => {
        const date = formatEntryDateTime(new Date(entry.createdAt), lang);
        if ((await shareText(`${entry.mood} ${bookLabel(entry.book)} · ${date}\n\n${textOf(entry)}`)) === "copied") {
            setCopiedId(entry.id);
            setTimeout(() => setCopiedId((id) => (id === entry.id ? null : id)), 2000);
        }
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
                        onPress={() => chooseBook("burden")}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: activeBook === "burden" }}
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
                        onPress={() => chooseBook("gratitude")}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: activeBook === "gratitude" }}
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

                {/* Entry card: writing needs a book */}
                {!activeBook ? (
                    <Text style={s.chooseBookHint}>{tj.chooseBook}</Text>
                ) : (
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
                        <Pressable
                            style={[s.saveBtn, (!entryText.trim() || saving) && s.btnDisabled]}
                            disabled={!entryText.trim() || saving}
                            onPress={saveEntry}
                        >
                            <Text style={s.saveBtnText}>{saving ? "…" : t.saveEntry}</Text>
                        </Pressable>
                    </View>
                )}

                {/* Entries: all of them, or the chosen book's */}
                <View style={s.sectionRow}>
                    <Text style={s.sectionTitle}>{activeBook ? bookLabel(activeBook) : t.recentEntries}</Text>
                    {activeBook && (
                        <Pressable onPress={() => setActiveBook(null)} hitSlop={6} accessibilityRole="button">
                            <Text style={s.showAllText}>{tj.showAll}</Text>
                        </Pressable>
                    )}
                </View>
                {entries === null ? (
                    loadFailed ? (
                        <View style={s.notice}>
                            <Text style={s.noticeText}>{tj.loadError}</Text>
                            <Pressable onPress={load} hitSlop={6}>
                                <Text style={s.retryText}>{tj.retry}</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <ActivityIndicator color={Color.endeavour} accessibilityLabel={tj.loading} />
                    )
                ) : !shown.length ? (
                    <Text style={s.empty}>{activeBook && entries.length ? tj.noEntriesInBook : tj.noEntries}</Text>
                ) : (
                    <View style={s.entriesList}>
                        {shown.map((entry) => (
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
                                            {bookLabel(entry.book)}
                                        </Text>
                                    </View>
                                    <Text style={s.entryDate} numberOfLines={1}>
                                        {formatEntryDateTime(new Date(entry.createdAt), lang)}
                                    </Text>
                                </View>
                                {editingId === entry.id ? (
                                    <View style={s.editBox}>
                                        <View style={s.moodRowSmall}>
                                            {MOODS.map((emoji) => (
                                                <Pressable
                                                    key={emoji}
                                                    style={[s.moodBtnSmall, editMood === emoji && s.moodBtnActive]}
                                                    onPress={() => setEditMood(emoji)}
                                                >
                                                    <Text style={s.moodEmojiSmall}>{emoji}</Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                        <TextInput
                                            style={s.entryInput}
                                            value={editText}
                                            onChangeText={setEditText}
                                            multiline
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                            autoFocus
                                        />
                                        <View style={s.editButtons}>
                                            <Pressable style={s.cancelBtn} onPress={() => setEditingId(null)}>
                                                <Text style={s.cancelBtnText}>{tj.cancel}</Text>
                                            </Pressable>
                                            <Pressable
                                                style={[s.smallSaveBtn, (!editText.trim() || savingEdit) && s.btnDisabled]}
                                                disabled={!editText.trim() || savingEdit}
                                                onPress={saveEdit}
                                            >
                                                <Text style={s.saveBtnText}>{savingEdit ? "…" : tj.save}</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : (
                                    <>
                                        <Text style={s.entryBody}>{textOf(entry)}</Text>
                                        <View style={s.entryFooter}>
                                            {!!entry.exampleKey && <Text style={s.exampleBadge}>{tj.example}</Text>}
                                            <View style={s.itemActions}>
                                                <Pressable onPress={() => startEdit(entry)} hitSlop={6} accessibilityRole="button">
                                                    <Text style={s.actionText}>✏️ {tj.edit}</Text>
                                                </Pressable>
                                                <Pressable onPress={() => shareEntry(entry)} hitSlop={6} accessibilityRole="button">
                                                    <Text style={s.actionText}>{copiedId === entry.id ? tj.copied : `📤 ${tj.share}`}</Text>
                                                </Pressable>
                                                <Pressable onPress={() => removeEntry(entry)} hitSlop={6} accessibilityRole="button">
                                                    <Text style={[s.actionText, s.deleteText]}>🗑️ {tj.delete}</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* ── Bottom navigation ── */}
            <View style={[s.bottomNav, { paddingBottom: 12 + insets.bottom }]}>
                {NAV_ITEMS.map((item) => (
                    <Pressable
                        key={item.labelKey}
                        style={[s.navItem, item.active && s.navItemActive]}
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
    btnDisabled: { opacity: 0.5 },
    notice: { alignItems: "center", gap: 8, paddingVertical: 8 },
    noticeText: { fontSize: 14, color: Color.mako, textAlign: "center" },
    retryText: { fontSize: 15, fontWeight: "700", color: Color.endeavour },
    empty: { fontSize: 14, color: Color.mako, textAlign: "center", paddingVertical: 8 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: Color.blackPearl },
    sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
    showAllText: { fontSize: 13, fontWeight: "700", color: Color.endeavour },
    chooseBookHint: {
        fontSize: 14,
        color: Color.mako,
        textAlign: "center",
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderStyle: "dashed",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    editBox: { gap: 10 },
    moodRowSmall: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    moodBtnSmall: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    moodEmojiSmall: { fontSize: 22 },
    editButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    cancelBtnText: { fontSize: 15, fontWeight: "600", color: Color.mako },
    smallSaveBtn: { backgroundColor: Color.endeavour, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10 },
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
    entryFooter: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    exampleBadge: {
        fontSize: 11,
        fontWeight: "600",
        color: Color.purple,
        backgroundColor: Color.lightPurple,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        overflow: "hidden",
    },
    itemActions: { flexDirection: "row", gap: 14, marginLeft: "auto" },
    actionText: { fontSize: 13, fontWeight: "600", color: Color.endeavour },
    deleteText: { color: Color.pinkText },
    bottomNav: {
        flexDirection: "row",
        backgroundColor: Color.aliceBlue,
        borderTopWidth: 1,
        borderTopColor: Color.linkWater,
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    navItem: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 4, marginHorizontal: 2 },
    navEmoji: { fontSize: 20 },
    // The current screen gets a shaded pill, so it's clear where you are.
    navItemActive: { backgroundColor: "#dcebf7", borderRadius: 12 },
    navEmojiActive: { color: Color.endeavour },
    navLabel: { fontSize: 10, color: Color.mako },
    navLabelActive: { color: Color.endeavour, fontWeight: "600" },
});