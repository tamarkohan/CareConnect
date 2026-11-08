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
import { T, LangCode, formatLongDate, formatEntryDateTime, formatTime } from "../translations";
import { TJ_T } from "../tasksJournalStrings";
import { fill } from "../pageStrings";
import { ApiError, Task, addTask, deleteTask, getTasks, setTaskDone } from "../api/client";
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
    lightPurple: "#f3e8ff",
    purple: "#7c3aed",
    lightBlue: "#e8f4ff",
    red: "#c62828",
};

// ── Nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { labelKey: "navHome" as const, emoji: "🏠", screen: "Home" },
    { labelKey: "navTranslator" as const, emoji: "🔤", screen: "Translator" },
    { labelKey: "navAssistant" as const, emoji: "⚖️", screen: "Assistant" },
    { labelKey: "navCommunity" as const, emoji: "👥", screen: "Community" },
    { labelKey: "navTasks" as const, emoji: "📋", screen: "Tasks", active: true },
    { labelKey: "navJournal" as const, emoji: "📓", screen: "Journal" },
];

// ── Tasks ─────────────────────────────────────────────────────────────
// Tasks are saved on the server (per account). New users get a few example
// tasks from the server, with one of these keys instead of a text.
const EXAMPLE_KEYS = ["task1", "task2", "task3", "task4", "task5"] as const;
type ExampleKey = (typeof EXAMPLE_KEYS)[number];
const isExampleKey = (k: string | null): k is ExampleKey => (EXAMPLE_KEYS as readonly (string | null)[]).includes(k);

/** "8:30", "08:30", "8.30", "8:30 pm", "8pm", "20:30" → "HH:MM"; "" → ""; anything else → null. */
function parseTime(input: string): string | null {
    const s = input.trim().toLowerCase().replace(/([ap])\.?\s*m\.?$/, "$1m").replace(".", ":");
    if (!s) return "";
    const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
    if (!m) return null;
    let hours = Number(m[1]);
    const minutes = Number(m[2] ?? 0);
    if (m[3]) {
        if (hours < 1 || hours > 12) return null;
        hours = (hours % 12) + (m[3] === "pm" ? 12 : 0);
    }
    if (hours > 23 || minutes > 59) return null;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

const minutesOf = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const showTime = (time: string, lang: LangCode) => formatTime(Number(time.slice(0, 2)), Number(time.slice(3, 5)), lang);

/** Open tasks: by time (tasks without a time last), then in the order they were added. */
const byTime = (a: Task, b: Task) =>
    (a.time ? minutesOf(a.time) : 24 * 60) - (b.time ? minutesOf(b.time) : 24 * 60) || Number(a.id) - Number(b.id);
/** Completed tasks: last done first. */
const byDoneAt = (a: Task, b: Task) => new Date(b.doneAt!).getTime() - new Date(a.doneAt!).getTime();

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function TasksScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang } = useLang();
    const t = T[lang];
    const tj = TJ_T[lang];
    const [tasks, setTasks] = React.useState<Task[] | null>(null);   // null = loading
    const [loadFailed, setLoadFailed] = React.useState(false);
    const [adding, setAdding] = React.useState(false);
    const [newLabel, setNewLabel] = React.useState("");
    const [newTime, setNewTime] = React.useState("");
    const [formError, setFormError] = React.useState<string | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [showCompleted, setShowCompleted] = React.useState(false);
    const [copiedId, setCopiedId] = React.useState<string | null>(null);
    const [now, setNow] = React.useState(() => new Date());

    const load = React.useCallback(async () => {
        setLoadFailed(false);
        try {
            setTasks((await getTasks()).tasks);
        } catch {
            setLoadFailed(true);
        }
    }, []);
    React.useEffect(() => {
        load();
    }, [load]);

    // Keeps the date and the overdue marks right while the page stays open.
    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(timer);
    }, []);

    const labelOf = (task: Task) => task.label ?? (isExampleKey(task.exampleKey) ? t[task.exampleKey] : "");
    const open = (tasks ?? []).filter((x) => !x.doneAt).sort(byTime);
    const completed = (tasks ?? []).filter((x) => x.doneAt).sort(byDoneAt);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const replace = (task: Task) => setTasks((prev) => prev && prev.map((x) => (x.id === task.id ? task : x)));

    const toggleTask = async (task: Task) => {
        const done = !task.doneAt;
        replace({ ...task, doneAt: done ? new Date().toISOString() : null });   // at once; the server confirms
        try {
            replace((await setTaskDone(task.id, done)).task);
        } catch {
            replace(task);
            showAlert(tj.saveError);
        }
    };

    const closeForm = () => {
        setAdding(false);
        setNewLabel("");
        setNewTime("");
        setFormError(null);
    };

    const saveTask = async () => {
        const label = newLabel.trim();
        const time = parseTime(newTime);
        if (!label || saving) return;
        if (time === null) {
            setFormError(tj.badTime);
            return;
        }
        setSaving(true);
        setFormError(null);
        try {
            const { task } = await addTask(label, time || null);
            setTasks((prev) => [...(prev ?? []), task]);
            closeForm();
        } catch (err) {
            setFormError(err instanceof ApiError && err.code === "tooManyTasks" ? tj.tooManyTasks : tj.saveError);
        } finally {
            setSaving(false);
        }
    };

    const removeTask = async (task: Task) => {
        if (!(await confirmAction(tj.deleteTaskConfirm, tj.delete, tj.cancel))) return;
        setTasks((prev) => prev && prev.filter((x) => x.id !== task.id));
        try {
            await deleteTask(task.id);
        } catch {
            showAlert(tj.saveError);
            load();
        }
    };

    const shareTask = async (task: Task) => {
        const text = `${task.doneAt ? "✓ " : ""}${labelOf(task)}${task.time ? ` – ${showTime(task.time, lang)}` : ""}`;
        if ((await shareText(text)) === "copied") {
            setCopiedId(task.id);
            setTimeout(() => setCopiedId((id) => (id === task.id ? null : id)), 2000);
        }
    };

    const renderTask = (task: Task) => {
        const done = !!task.doneAt;
        const overdue = !done && !!task.time && minutesOf(task.time) < nowMinutes;
        return (
            <View key={task.id} style={[s.taskItem, overdue && s.taskItemOverdue]}>
                <Pressable
                    onPress={() => toggleTask(task)}
                    hitSlop={8}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: done }}
                    accessibilityLabel={done ? tj.markNotDone : tj.markDone}
                >
                    <View style={[s.checkbox, done && s.checkboxDone]}>
                        {done && <Text style={s.checkmark}>✓</Text>}
                    </View>
                </Pressable>
                <View style={s.taskContent}>
                    <Pressable onPress={() => toggleTask(task)}>
                        <Text style={[s.taskLabel, done && s.taskLabelDone]}>{labelOf(task)}</Text>
                    </Pressable>
                    <View style={s.taskFooter}>
                        <View style={s.taskMeta}>
                            {done ? (
                                <Text style={s.taskTime}>
                                    {fill(tj.doneOn, { date: formatEntryDateTime(new Date(task.doneAt!), lang) })}
                                </Text>
                            ) : task.time ? (
                                <Text style={[s.taskTime, overdue && s.taskTimeOverdue]}>{showTime(task.time, lang)}</Text>
                            ) : null}
                            {!!task.exampleKey && <Text style={s.exampleBadge}>{tj.example}</Text>}
                        </View>
                        <View style={s.itemActions}>
                            <Pressable onPress={() => shareTask(task)} hitSlop={6} accessibilityRole="button">
                                <Text style={s.actionText}>{copiedId === task.id ? tj.copied : `📤 ${tj.share}`}</Text>
                            </Pressable>
                            <Pressable onPress={() => removeTask(task)} hitSlop={6} accessibilityRole="button">
                                <Text style={[s.actionText, s.deleteText]}>🗑️ {tj.delete}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[s.root, { paddingTop: insets.top }]}>

            {/* ── Top bar Real Conectada ── */}
            <TopBar title={t.navTasks} navigation={navigation} />

            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Heading */}
                <Text style={s.heading}>{t.tasksHeading}</Text>
                <Text style={s.subheading}>
                    {formatLongDate(now, lang)}{tasks ? ` · ${open.length} ${t.pending}` : ""}
                </Text>

                {/* Reminder card */}
                <View style={s.reminderCard}>
                    <Text style={s.reminderIcon}>🧘</Text>
                    <Text style={s.reminderText}>
                        <Text style={s.reminderBold}>{t.reminder}</Text>
                        {t.reminderBody}
                    </Text>
                </View>

                {/* Add a task */}
                {adding ? (
                    <View style={s.addCard}>
                        <TextInput
                            style={s.input}
                            placeholder={tj.newTask}
                            placeholderTextColor={Color.mako}
                            value={newLabel}
                            onChangeText={setNewLabel}
                            maxLength={200}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={saveTask}
                        />
                        <Text style={s.inputLabel}>{tj.time}</Text>
                        <TextInput
                            style={[s.input, s.timeInput]}
                            placeholder={tj.timeHint}
                            placeholderTextColor={Color.mako}
                            value={newTime}
                            onChangeText={(v) => {
                                setNewTime(v);
                                setFormError(null);
                            }}
                            maxLength={8}
                            returnKeyType="done"
                            onSubmitEditing={saveTask}
                        />
                        {formError && <Text style={s.formError}>{formError}</Text>}
                        <View style={s.formButtons}>
                            <Pressable style={s.cancelBtn} onPress={closeForm}>
                                <Text style={s.cancelBtnText}>{tj.cancel}</Text>
                            </Pressable>
                            <Pressable
                                style={[s.saveBtn, (!newLabel.trim() || saving) && s.btnDisabled]}
                                disabled={!newLabel.trim() || saving}
                                onPress={saveTask}
                            >
                                <Text style={s.saveBtnText}>{saving ? "…" : tj.save}</Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <Pressable style={s.addBtn} onPress={() => setAdding(true)} accessibilityRole="button">
                        <Text style={s.addBtnText}>{tj.addTask}</Text>
                    </Pressable>
                )}

                {/* Task list */}
                {tasks === null ? (
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
                ) : open.length ? (
                    <View style={s.taskList}>{open.map(renderTask)}</View>
                ) : (
                    <Text style={s.empty}>{tj.noTasks}</Text>
                )}

                {/* Completed tasks */}
                {tasks !== null && (
                    <Pressable style={s.completedBtn} onPress={() => setShowCompleted((v) => !v)} accessibilityRole="button">
                        <Text style={s.completedBtnText}>
                            {showCompleted ? `▲ ${tj.hideCompleted}` : `▼ ${fill(tj.completed, { n: String(completed.length) })}`}
                        </Text>
                    </Pressable>
                )}
                {tasks !== null && showCompleted && (
                    completed.length ? (
                        <View style={s.taskList}>{completed.map(renderTask)}</View>
                    ) : (
                        <Text style={s.empty}>{tj.noCompleted}</Text>
                    )
                )}
            </ScrollView>

            {/* ── Bottom navigation Corregida para Huawei ── */}
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
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 24,
        gap: 16,
    },
    heading: { fontSize: 22, fontWeight: "700", color: Color.blackPearl },
    subheading: { fontSize: 14, color: Color.mako, marginTop: -8 },
    reminderCard: {
        backgroundColor: Color.lightPurple,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    reminderIcon: { fontSize: 20, marginTop: 1 },
    reminderText: { flex: 1, fontSize: 13, color: "#4c1d95", lineHeight: 19 },
    reminderBold: { fontWeight: "700" },
    addBtn: { backgroundColor: Color.endeavour, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    addBtnText: { fontSize: 16, fontWeight: "700", color: Color.white },
    addCard: {
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Color.endeavour,
        padding: 14,
        gap: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: Color.blackPearl,
        backgroundColor: Color.aliceBlue,
    },
    inputLabel: { fontSize: 12, fontWeight: "600", color: Color.mako, marginTop: 2 },
    timeInput: { width: 180 },
    formError: { fontSize: 13, color: Color.red },
    formButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 4 },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    cancelBtnText: { fontSize: 15, fontWeight: "600", color: Color.mako },
    saveBtn: { backgroundColor: Color.endeavour, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10 },
    saveBtnText: { fontSize: 15, fontWeight: "700", color: Color.white },
    btnDisabled: { opacity: 0.5 },
    notice: { alignItems: "center", gap: 8, paddingVertical: 8 },
    noticeText: { fontSize: 14, color: Color.mako, textAlign: "center" },
    retryText: { fontSize: 15, fontWeight: "700", color: Color.endeavour },
    empty: { fontSize: 14, color: Color.mako, textAlign: "center", paddingVertical: 8 },
    taskList: { gap: 10 },
    taskItem: {
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.linkWater,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
    },
    taskItemOverdue: { borderColor: Color.endeavour, borderWidth: 1.5 },
    checkbox: {
        marginTop: 1,
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Color.linkWater,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxDone: { backgroundColor: Color.endeavour, borderColor: Color.endeavour },
    checkmark: { fontSize: 13, color: Color.white, fontWeight: "700" },
    taskContent: { flex: 1 },
    taskLabel: { fontSize: 15, fontWeight: "600", color: Color.blackPearl },
    taskLabelDone: { color: Color.mako, textDecorationLine: "line-through" },
    taskFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 4 },
    taskMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
    taskTime: { fontSize: 12, color: Color.mako },
    taskTimeOverdue: { color: Color.endeavour, fontWeight: "600" },
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
    deleteText: { color: Color.red },
    completedBtn: { backgroundColor: Color.lightBlue, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    completedBtnText: { fontSize: 15, fontWeight: "700", color: Color.endeavour },
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