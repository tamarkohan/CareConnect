// ── reminders.ts ─────────────────────────────────────────────────────
// Task reminders (Menu → Settings): a notification on the phone at the time of
// each open task that has a time, also on its repeat days. They are local
// notifications set on the phone itself (expo-notifications), so no server is
// involved; a web page can't remind anyone once it's closed, so the web build
// has no reminders.
//
// Reminders are set for the next 7 days and set again whenever the task list
// changes (TasksScreen) or reminders are turned on (SettingsScreen). On or off
// is remembered on the device, for each account.
import { Platform } from "react-native";
import type * as NotificationsModule from "expo-notifications";
import type { Task } from "./api/client";
import { getItem, setItem } from "./api/storage";

export const remindersSupported = Platform.OS !== "web";

// Loaded only in the phone app (the web build never runs it).
const Notifications: typeof NotificationsModule | null = remindersSupported ? require("expo-notifications") : null;

const DAYS_AHEAD = 7;
const MAX_REMINDERS = 60;      // iOS keeps at most 64 scheduled notifications per app
const CHANNEL = "task-reminders";
const enabledKey = (userId: string) => `careconnect.reminders.${userId}`;

if (Notifications) {
    // Show the reminder even while the app is open.
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

export type Reminder = { taskId: string; date: Date };

/**
 * When to remind, from now: one-off open tasks once, at the next time their
 * time comes; repeating tasks on each of their days in the next 7 days (not
 * today if already ticked today). Nearest first, at most 60.
 */
export function upcomingReminders(tasks: Task[], now: Date): Reminder[] {
    const out: Reminder[] = [];
    const at = (day: Date, time: string) => {
        const d = new Date(day);
        d.setHours(Number(time.slice(0, 2)), Number(time.slice(3, 5)), 0, 0);
        return d;
    };
    const dayKey = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    for (const task of tasks) {
        if (!task.time || task.doneAt || task.fromTaskId) continue;
        for (let i = 0; i <= DAYS_AHEAD; i++) {
            const day = new Date(now);
            day.setDate(now.getDate() + i);
            const date = at(day, task.time);
            if (date <= now) continue;
            if (!task.days) {
                out.push({ taskId: task.id, date });   // one-off: only the next time
                break;
            }
            if (task.days.includes(day.getDay()) && !(i === 0 && task.lastDoneOn === dayKey(now))) {
                out.push({ taskId: task.id, date });
            }
        }
    }
    return out.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, MAX_REMINDERS);
}

export async function getRemindersEnabled(userId: string): Promise<boolean> {
    return remindersSupported && (await getItem(enabledKey(userId))) === "1";
}

/**
 * Turns reminders on (asks the phone for permission first) or off.
 * @returns "on", "off", or "denied" when notifications are blocked for the app
 */
export async function setRemindersEnabled(userId: string, on: boolean): Promise<"on" | "off" | "denied"> {
    if (!Notifications) return "off";
    if (on) {
        let { granted } = await Notifications.getPermissionsAsync();
        if (!granted) granted = (await Notifications.requestPermissionsAsync()).granted;
        if (!granted) return "denied";
        await setItem(enabledKey(userId), "1");
        return "on";
    }
    await setItem(enabledKey(userId), "0");
    await cancelTaskReminders();
    return "off";
}

// One scheduling at a time, so quick changes can't mix their reminders.
let queue: Promise<void> = Promise.resolve();

/**
 * Sets the reminders for these tasks again (if reminders are on for this user).
 * textOf: the task's text in the app language; body: the line under it.
 */
export function scheduleTaskReminders(userId: string, tasks: Task[], textOf: (task: Task) => string, body: string, channelName: string) {
    queue = queue.then(async () => {
        if (!Notifications || !(await getRemindersEnabled(userId))) return;
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync(CHANNEL, {
                name: channelName,
                importance: Notifications.AndroidImportance.HIGH,
            });
        }
        await Notifications.cancelAllScheduledNotificationsAsync();
        const byId = new Map(tasks.map((t) => [t.id, t]));
        for (const { taskId, date } of upcomingReminders(tasks, new Date())) {
            await Notifications.scheduleNotificationAsync({
                content: { title: textOf(byId.get(taskId)!), body, data: { taskId } },
                trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL },
            });
        }
    }).catch((err) => console.warn("[reminders]", err?.message ?? err));
}

/** Removes every reminder (reminders turned off, or signing out). */
export async function cancelTaskReminders() {
    if (Notifications) await Notifications.cancelAllScheduledNotificationsAsync().catch(() => { });
}
