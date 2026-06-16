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
    lightPurple: "#f3e8ff",
    purple: "#7c3aed",
    lightBlue: "#e8f4ff",
    red: "#c62828",
};

// ── Nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { labelKey: "navHome" as const, emoji: "🏠", screen: "Home" },
    { labelKey: "navTranslator" as const, emoji: "交", screen: "Translator" },
    { labelKey: "navAssistant" as const, emoji: "✦", screen: "Assistant" },
    { labelKey: "navCommunity" as const, emoji: "👥", screen: "Community" },
    { labelKey: "navTasks" as const, emoji: "📋", screen: "Tasks", active: true },
    { labelKey: "navJournal" as const, emoji: "♡", screen: "Journal" },
];

// ── Task type ─────────────────────────────────────────────────────────
type Task = {
    id: string;
    label: string;
    time: string;
    done: boolean;
    overdue?: boolean;
};

const INITIAL_TASKS: Task[] = [
    { id: "1", label: "Take morning medication", time: "8:00 AM", done: true },
    { id: "2", label: "Breakfast meal", time: "8:30 AM", done: true },
    { id: "3", label: "Call employer re-schedule", time: "10:00 AM", done: false, overdue: true },
    { id: "4", label: "Go for a walk", time: "2:00 PM", done: false },
    { id: "5", label: "Take afternoon medication", time: "4:00 PM", done: false },
];

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function TasksScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang } = useLang();
    const t = T[lang];
    const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);

    const pending = tasks.filter((t) => !t.done).length;

    const toggleTask = (id: string) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
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
                <Text style={s.heading}>Today's Tasks</Text>
                <Text style={s.subheading}>Tuesday, May 5 · {pending} pending</Text>

                {/* Reminder card */}
                <View style={s.reminderCard}>
                    <Text style={s.reminderIcon}>🧘</Text>
                    <Text style={s.reminderText}>
                        <Text style={s.reminderBold}>Reminder: </Text>
                        You've been working for 4 hours. Try to take a 10-minute rest or short walk if your patient is resting.
                    </Text>
                </View>

                {/* Task list */}
                <View style={s.taskList}>
                    {tasks.map((task) => (
                        <Pressable
                            key={task.id}
                            style={[
                                s.taskItem,
                                task.overdue && !task.done && s.taskItemOverdue,
                            ]}
                            onPress={() => toggleTask(task.id)}
                        >
                            <View style={[s.checkbox, task.done && s.checkboxDone]}>
                                {task.done && <Text style={s.checkmark}>✓</Text>}
                            </View>
                            <View style={s.taskContent}>
                                <Text style={[s.taskLabel, task.done && s.taskLabelDone]}>
                                    {task.label}
                                </Text>
                                <Text style={[s.taskTime, task.overdue && !task.done && s.taskTimeOverdue]}>
                                    {task.time}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </View>

                {/* Manage Tasks button */}
                <Pressable style={s.manageBtn}>
                    <Text style={s.manageBtnText}>Manage Tasks</Text>
                </Pressable>
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
    taskList: { gap: 10 },
    taskItem: {
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.linkWater,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    taskItemOverdue: { borderColor: Color.endeavour, borderWidth: 1.5 },
    checkbox: {
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
    taskTime: { fontSize: 12, color: Color.mako, marginTop: 2 },
    taskTimeOverdue: { color: Color.endeavour, fontWeight: "600" },
    manageBtn: { backgroundColor: Color.lightBlue, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
    manageBtnText: { fontSize: 15, fontWeight: "700", color: Color.endeavour },
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