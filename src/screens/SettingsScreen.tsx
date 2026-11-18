// ── SettingsScreen.tsx ───────────────────────────────────────────────
// Menu → Settings: app language, appearance (light / dark / as the phone,
// see theme.ts), task reminders (phone app only, see
// reminders.ts), the legal pages (privacy, terms, the legal assistant's
// disclaimer – info pages in infoPages.ts) and deleting the account.
import * as React from "react";
import { View, Text, Pressable, Switch, ActivityIndicator } from "react-native";
import { useApp } from "../AppContext";
import { LANGUAGES, T } from "../translations";
import { BOT_T } from "../botStrings";
import { MENU_T } from "../menuStrings";
import { PageFrame } from "../components/InfoSections";
import { deleteAccount, getTasks } from "../api/client";
import { confirmAction, showAlert } from "../api/platform";
import { taskText } from "../tasksJournalStrings";
import {
    remindersSupported, getRemindersEnabled, setRemindersEnabled, scheduleTaskReminders,
} from "../reminders";
import { themedColors, themedStyles } from "../theme";

const C = themedColors({ blue: "#005dac", ink: "#071e27", muted: "#414752", line: "#cfe6f2", bg: "#f3faff", white: "#fff", red: "#c62828", lightRed: "#fff0f0" });

export default function SettingsScreen({ navigation }: { navigation: any }) {
    const { lang, setLang, appearance, setAppearance, user, signOut } = useApp();
    const t = T[lang];
    const m = MENU_T[lang];
    const [reminders, setReminders] = React.useState(false);
    const [reminderNote, setReminderNote] = React.useState<string | null>(null);
    const [busy, setBusy] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);

    React.useEffect(() => {
        if (user) getRemindersEnabled(user.id).then(setReminders);
    }, [user?.id]);

    if (!user) return null;

    const toggleReminders = async (on: boolean) => {
        setBusy(true);
        setReminderNote(null);
        try {
            const result = await setRemindersEnabled(user.id, on);
            setReminders(result === "on");
            if (result === "denied") setReminderNote(m.remindersDenied);
            if (result === "on") {
                // Set the reminders now, without waiting for the Tasks page to be opened.
                const { tasks } = await getTasks();
                scheduleTaskReminders(user.id, tasks, (task) => taskText(task, lang), m.remindBody, m.remindersTitle);
            }
        } catch {
            showAlert(BOT_T[lang].errNetwork);
        } finally {
            setBusy(false);
        }
    };

    const removeAccount = async () => {
        if (user.isDemo) return showAlert(m.deleteDemo);
        if (!(await confirmAction(m.deleteConfirm, m.deleteAccount, BOT_T[lang].cancel))) return;
        setDeleting(true);
        try {
            await deleteAccount();
            await signOut();   // back to the login screen
        } catch (err: any) {
            setDeleting(false);
            showAlert(err?.status ? err.message : BOT_T[lang].errNetwork);
        }
    };

    const link = (label: string, page: string) => (
        <Pressable style={s.linkRow} onPress={() => navigation.navigate("Info", { page })} accessibilityRole="link">
            <Text style={s.linkText}>{label}</Text>
            <Text style={s.chevron}>›</Text>
        </Pressable>
    );

    return (
        <PageFrame title={t.settings} navigation={navigation}>
            {/* App language */}
            <View style={s.card}>
                <Text style={s.cardTitle}>🌐 {m.languageTitle}</Text>
                <View style={s.chips}>
                    {LANGUAGES.map((l) => (
                        <Pressable
                            key={l.code}
                            style={[s.chip, l.code === lang && s.chipActive]}
                            onPress={() => setLang(l.code)}
                            accessibilityRole="radio"
                            aria-checked={l.code === lang}
                        >
                            <Text style={[s.chipText, l.code === lang && s.chipTextActive]}>{l.nativeLabel}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Appearance: light, dark, or as the phone is set */}
            <View style={s.card}>
                <Text style={s.cardTitle}>🌓 {m.appearanceTitle}</Text>
                <View style={s.chips}>
                    {([
                        ["light", `☀️ ${m.appearanceLight}`],
                        ["dark", `🌙 ${m.appearanceDark}`],
                        ["system", `📱 ${m.appearanceSystem}`],
                    ] as const).map(([value, label]) => (
                        <Pressable
                            key={value}
                            style={[s.chip, appearance === value && s.chipActive]}
                            onPress={() => setAppearance(value)}
                            accessibilityRole="radio"
                            aria-checked={appearance === value}
                        >
                            <Text style={[s.chipText, appearance === value && s.chipTextActive]}>{label}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Task reminders */}
            <View style={s.card}>
                <View style={s.switchRow}>
                    <Text style={[s.cardTitle, { flex: 1 }]}>⏰ {m.remindersTitle}</Text>
                    {busy ? (
                        <ActivityIndicator color={C.blue} />
                    ) : (
                        <Switch
                            value={reminders}
                            onValueChange={toggleReminders}
                            disabled={!remindersSupported}
                            trackColor={{ true: C.blue, false: C.line }}
                            accessibilityLabel={m.remindersTitle}
                        />
                    )}
                </View>
                <Text style={s.hint}>{m.remindersHint}</Text>
                {!remindersSupported && <Text style={s.note}>ℹ️ {m.remindersOnlyApp}</Text>}
                {reminderNote && <Text style={s.warn}>⚠ {reminderNote}</Text>}
            </View>

            {/* Legal */}
            <View style={s.card}>
                <Text style={s.cardTitle}>⚖️ {m.legalTitle}</Text>
                {link(m.privacy, "privacy")}
                {link(m.terms, "terms")}
                {link(m.disclaimer, "disclaimer")}
            </View>

            {/* Account */}
            <View style={s.card}>
                <Text style={s.cardTitle}>👤 {m.accountTitle}</Text>
                <Text style={s.hint}>{user.isDemo ? m.deleteDemo : m.deleteHint}</Text>
                {!user.isDemo && (
                    <Pressable style={[s.deleteBtn, deleting && s.disabled]} onPress={removeAccount} disabled={deleting} accessibilityRole="button">
                        {deleting ? <ActivityIndicator color={C.red} /> : <Text style={s.deleteText}>🗑️ {m.deleteAccount}</Text>}
                    </Pressable>
                )}
            </View>
        </PageFrame>
    );
}

const s = themedStyles({
    card: { backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.line, padding: 16, gap: 10 },
    cardTitle: { fontSize: 16, fontWeight: "700", color: C.ink },
    hint: { fontSize: 13, color: C.muted, lineHeight: 18 },
    note: { fontSize: 13, color: C.blue, lineHeight: 18 },
    warn: { fontSize: 13, color: C.red, lineHeight: 18 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { borderWidth: 1, borderColor: C.line, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: C.white },
    chipActive: { backgroundColor: C.blue, borderColor: C.blue },
    chipText: { fontSize: 14, color: C.ink },
    chipTextActive: { color: C.white, fontWeight: "700" },
    switchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    linkRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: C.line, paddingTop: 12, paddingBottom: 2 },
    linkText: { flex: 1, fontSize: 15, color: C.blue, fontWeight: "600" },
    chevron: { fontSize: 22, color: C.muted },
    deleteBtn: { borderWidth: 1, borderColor: C.red, backgroundColor: C.lightRed, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
    deleteText: { fontSize: 15, fontWeight: "700", color: C.red },
    disabled: { opacity: 0.6 },
});
