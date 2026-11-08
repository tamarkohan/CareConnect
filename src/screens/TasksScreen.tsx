import * as React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import TaskForm, { TaskFields } from "../components/TaskForm";
import { timeLabel } from "../components/TimePicker";
import { useApp } from "../AppContext";
import { T, WEEKDAYS_SHORT, formatLongDate, formatEntryDateTime } from "../translations";
import { TJ_T } from "../tasksJournalStrings";
import { fill } from "../pageStrings";
import {
    ApiError, Task, addTask, deleteTask, getTasks, setTaskDone, translateTasks, updateTask,
} from "../api/client";
import { confirmAction, shareText, showAlert } from "../api/platform";
import { getItem, setItem } from "../api/storage";

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
// tasks from the server, with one of these keys instead of a text; they go away
// once the user has a task of their own.
const EXAMPLE_KEYS = ["task1", "task2", "task3", "task4", "task5"] as const;
type ExampleKey = (typeof EXAMPLE_KEYS)[number];
const isExampleKey = (k: string | null): k is ExampleKey => (EXAMPLE_KEYS as readonly (string | null)[]).includes(k);

// Closing the reminder card is remembered on the device, for each account.
const REMINDER_CLOSED_KEY = "careconnect.tasksReminderClosed";

const minutesOf = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
/** The user's day, "YYYY-MM-DD": a repeating task is ticked for this day. */
const dayOf = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Open tasks: by time (tasks without a time last), then in the order they were added. */
const byTime = (a: Task, b: Task) =>
    (a.time ? minutesOf(a.time) : 24 * 60) - (b.time ? minutesOf(b.time) : 24 * 60) || Number(a.id) - Number(b.id);
/** Completed tasks: last done first. */
const byDoneAt = (a: Task, b: Task) => new Date(b.doneAt!).getTime() - new Date(a.doneAt!).getTime();

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function TasksScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang, user } = useApp();
    const t = T[lang];
    const tj = TJ_T[lang];
    const [tasks, setTasks] = React.useState<Task[] | null>(null);   // null = loading
    const [loadFailed, setLoadFailed] = React.useState(false);
    const [adding, setAdding] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formError, setFormError] = React.useState<string | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [showCompleted, setShowCompleted] = React.useState(false);
    const [showOtherDays, setShowOtherDays] = React.useState(false);
    const [copiedId, setCopiedId] = React.useState<string | null>(null);
    const [now, setNow] = React.useState(() => new Date());
    const [reminderOpen, setReminderOpen] = React.useState(false);
    const reminderKey = `${REMINDER_CLOSED_KEY}.${user?.id ?? "guest"}`;

    // Every change bumps this. A server answer is used only if nothing changed after
    // it was asked for, so a slower, older answer can't undo a newer change.
    const version = React.useRef(0);
    const applyIfLatest = (asked: number, list: Task[]) => {
        if (asked === version.current) setTasks(list);
    };

    const load = React.useCallback(async () => {
        const asked = version.current;
        setLoadFailed(false);
        try {
            applyIfLatest(asked, (await getTasks()).tasks);
        } catch {
            setLoadFailed(true);
        }
    }, []);
    React.useEffect(() => {
        load();
    }, [load]);

    React.useEffect(() => {
        getItem(reminderKey).then((closed) => setReminderOpen(closed !== "1"));
    }, [reminderKey]);
    const closeReminder = () => {
        setReminderOpen(false);
        setItem(reminderKey, "1");
    };

    // Keeps the date, today's repeating tasks and the overdue marks right while the page stays open.
    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(timer);
    }, []);

    // Tasks written in another language are translated into the app language
    // (the server keeps the translations, so each is translated only once).
    const triedTranslating = React.useRef(new Set<string>());
    React.useEffect(() => {
        const missing = (tasks ?? []).filter((x) => x.label && x.lang !== lang && !x.translations[lang]);
        const attempt = `${lang}:${missing.map((x) => x.id).join(",")}`;
        if (!missing.length || triedTranslating.current.has(attempt)) return;
        triedTranslating.current.add(attempt);
        const asked = version.current;
        translateTasks(lang)
            .then(({ tasks: list }) => applyIfLatest(asked, list))
            .catch(() => {});    // they stay in their own language
    }, [tasks, lang]);

    const textOf = (task: Task) => {
        if (isExampleKey(task.exampleKey)) return t[task.exampleKey];
        if (!task.label || task.lang === lang) return task.label ?? "";
        return task.translations[lang] ?? task.label;
    };
    const repeatText = (days: number[]) =>
        days.length === 7 ? tj.repeatDaily : days.map((d) => WEEKDAYS_SHORT[lang][d]).join(", ");

    const today = dayOf(now);
    const weekday = now.getDay();
    const all = tasks ?? [];
    // Today: one-off tasks, and repeating tasks that are for today and not done today.
    const open = all.filter((x) => !x.doneAt && (!x.days || x.days.includes(weekday)) && x.lastDoneOn !== today).sort(byTime);
    const otherDays = all.filter((x) => !x.doneAt && x.days && !x.days.includes(weekday)).sort(byTime);
    const completed = all.filter((x) => x.doneAt).sort(byDoneAt);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const toggleTask = async (task: Task) => {
        const done = !task.doneAt;
        const asked = ++version.current;
        // At once on the screen; the server's list then replaces it.
        setTasks((prev) => prev && prev.flatMap((x) => {
            if (x.id === task.id && task.days) return [{ ...x, lastDoneOn: today }];
            if (x.id === task.id && task.fromTaskId) return [];   // a repeating task's day, unticked
            if (x.id === task.fromTaskId && x.lastDoneOn === task.doneOn) return [{ ...x, lastDoneOn: null }];
            if (x.id === task.id) return [{ ...x, doneAt: done ? new Date().toISOString() : null }];
            return [x];
        }));
        try {
            applyIfLatest(asked, (await setTaskDone(task.id, done, today)).tasks);
        } catch {
            showAlert(tj.saveError);
            load();
        }
    };

    const closeForm = () => {
        setAdding(false);
        setEditingId(null);
        setFormError(null);
    };

    const saveTask = async (fields: TaskFields) => {
        const asked = ++version.current;
        setSaving(true);
        setFormError(null);
        try {
            const input = { ...fields, lang };
            const { tasks: list } = editingId ? await updateTask(editingId, input) : await addTask(input);
            applyIfLatest(asked, list);
            closeForm();
        } catch (err) {
            setFormError(err instanceof ApiError && err.code === "tooManyTasks" ? tj.tooManyTasks : tj.saveError);
        } finally {
            setSaving(false);
        }
    };

    const removeTask = async (task: Task) => {
        if (!(await confirmAction(tj.deleteTaskConfirm, tj.delete, tj.cancel))) return;
        const asked = ++version.current;
        setTasks((prev) => prev && prev.filter((x) => x.id !== task.id));
        try {
            applyIfLatest(asked, (await deleteTask(task.id)).tasks);
        } catch {
            showAlert(tj.saveError);
            load();
        }
    };

    const shareTask = async (task: Task) => {
        const text = `${task.doneAt ? "✓ " : ""}${textOf(task)}${task.time ? ` – ${timeLabel(task.time, lang)}` : ""}`;
        if ((await shareText(text)) === "copied") {
            setCopiedId(task.id);
            setTimeout(() => setCopiedId((id) => (id === task.id ? null : id)), 2000);
        }
    };

    const renderTask = (task: Task) => {
        if (task.id === editingId) {
            return (
                <TaskForm
                    key={task.id}
                    initial={{ label: textOf(task), time: task.time, days: task.days }}
                    saving={saving}
                    error={formError}
                    onSave={saveTask}
                    onCancel={closeForm}
                />
            );
        }
        const done = !!task.doneAt;
        const forToday = !task.days || task.days.includes(weekday);
        const overdue = !done && forToday && !!task.time && minutesOf(task.time) < nowMinutes;
        return (
            <View key={task.id} style={[s.taskItem, overdue && s.taskItemOverdue]}>
                <Pressable
                    onPress={() => toggleTask(task)}
                    hitSlop={8}
                    disabled={!done && !forToday}
                    accessibilityRole="checkbox"
                    aria-checked={done}
                    aria-disabled={!done && !forToday}
                    accessibilityLabel={done ? tj.markNotDone : tj.markDone}
                >
                    <View style={[s.checkbox, done && s.checkboxDone, !done && !forToday && s.checkboxOff]}>
                        {done && <Text style={s.checkmark}>✓</Text>}
                    </View>
                </Pressable>
                <View style={s.taskContent}>
                    <Pressable onPress={() => toggleTask(task)} disabled={!done && !forToday}>
                        <Text style={[s.taskLabel, done && s.taskLabelDone]}>{textOf(task)}</Text>
                    </Pressable>
                    <View style={s.taskFooter}>
                        <View style={s.taskMeta}>
                            {done ? (
                                <Text style={s.taskTime}>
                                    {fill(tj.doneOn, { date: formatEntryDateTime(new Date(task.doneAt!), lang) })}
                                </Text>
                            ) : task.time ? (
                                <Text style={[s.taskTime, overdue && s.taskTimeOverdue]}>{timeLabel(task.time, lang)}</Text>
                            ) : null}
                            {!!task.days && <Text style={s.taskTime}>🔁 {repeatText(task.days)}</Text>}
                            {!!task.exampleKey && <Text style={s.exampleBadge}>{tj.example}</Text>}
                        </View>
                        <View style={s.itemActions}>
                            {/* Examples can't be edited: they stay examples until the user adds their own. */}
                            {!done && !task.exampleKey && (
                                <Pressable
                                    onPress={() => {
                                        setAdding(false);
                                        setFormError(null);
                                        setEditingId(task.id);
                                    }}
                                    hitSlop={6}
                                    accessibilityRole="button"
                                >
                                    <Text style={s.actionText}>✏️ {tj.edit}</Text>
                                </Pressable>
                            )}
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

                {/* Reminder card (can be closed) */}
                {reminderOpen && (
                    <View style={s.reminderCard}>
                        <Text style={s.reminderIcon}>🧘</Text>
                        <Text style={s.reminderText}>
                            <Text style={s.reminderBold}>{t.reminder}</Text>
                            {t.reminderBody}
                        </Text>
                        <Pressable
                            onPress={closeReminder}
                            hitSlop={10}
                            style={s.reminderClose}
                            accessibilityRole="button"
                            accessibilityLabel={tj.closeReminder}
                        >
                            <Text style={s.reminderCloseText}>✕</Text>
                        </Pressable>
                    </View>
                )}

                {/* Add a task */}
                {adding ? (
                    <TaskForm saving={saving} error={formError} onSave={saveTask} onCancel={closeForm} />
                ) : (
                    <Pressable
                        style={s.addBtn}
                        onPress={() => {
                            setEditingId(null);
                            setFormError(null);
                            setAdding(true);
                        }}
                        accessibilityRole="button"
                    >
                        <Text style={s.addBtnText}>{tj.addTask}</Text>
                    </Pressable>
                )}

                {/* Today's tasks */}
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

                {/* Repeating tasks that aren't for today */}
                {otherDays.length > 0 && (
                    <Pressable style={s.sectionBtn} onPress={() => setShowOtherDays((v) => !v)} accessibilityRole="button">
                        <Text style={s.sectionBtnText}>
                            {showOtherDays ? `▲ ${tj.hideOtherDays}` : `▼ ${fill(tj.otherDays, { n: String(otherDays.length) })}`}
                        </Text>
                    </Pressable>
                )}
                {showOtherDays && otherDays.length > 0 && <View style={s.taskList}>{otherDays.map(renderTask)}</View>}

                {/* Completed tasks */}
                {tasks !== null && (
                    <Pressable style={s.sectionBtn} onPress={() => setShowCompleted((v) => !v)} accessibilityRole="button">
                        <Text style={s.sectionBtnText}>
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
    reminderClose: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#e9d5ff" },
    reminderCloseText: { fontSize: 14, fontWeight: "700", color: "#4c1d95" },
    addBtn: { backgroundColor: Color.endeavour, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    addBtnText: { fontSize: 16, fontWeight: "700", color: Color.white },
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
    // A repeating task on another day can't be ticked today.
    checkboxOff: { borderStyle: "dashed" },
    checkmark: { fontSize: 13, color: Color.white, fontWeight: "700" },
    taskContent: { flex: 1 },
    taskLabel: { fontSize: 15, fontWeight: "600", color: Color.blackPearl },
    taskLabelDone: { color: Color.mako, textDecorationLine: "line-through" },
    taskFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 4 },
    taskMeta: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, flexShrink: 1 },
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
    sectionBtn: { backgroundColor: Color.lightBlue, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    sectionBtnText: { fontSize: 15, fontWeight: "700", color: Color.endeavour },
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
