// ── TaskForm.tsx ─────────────────────────────────────────────────────
// Adding or editing a task: what to do, a time chosen from a list (optional),
// and whether it repeats – every day, or on the days chosen.
import * as React from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { useLang } from "../AppContext";
import { WEEKDAYS_SHORT } from "../translations";
import { TJ_T } from "../tasksJournalStrings";
import TimePicker from "./TimePicker";

const Color = {
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    aliceBlue: "#f3faff",
    red: "#c62828",
};

export const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6];
type Repeat = "none" | "daily" | "days";
export type TaskFields = { label: string; time: string | null; days: number[] | null };

type Props = {
    initial?: TaskFields;
    saving: boolean;
    error: string | null;
    onSave: (task: TaskFields) => void;
    onCancel: () => void;
};

export default function TaskForm({ initial, saving, error, onSave, onCancel }: Props) {
    const { lang } = useLang();
    const tj = TJ_T[lang];
    const [label, setLabel] = React.useState(initial?.label ?? "");
    const [time, setTime] = React.useState<string | null>(initial?.time ?? null);
    const initialDays = initial?.days ?? [];
    const [repeat, setRepeat] = React.useState<Repeat>(
        !initialDays.length ? "none" : initialDays.length === 7 ? "daily" : "days"
    );
    const [days, setDays] = React.useState<number[]>(initialDays.length < 7 ? initialDays : []);
    const [daysMissing, setDaysMissing] = React.useState(false);

    const toggleDay = (d: number) => {
        setDaysMissing(false);
        setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
    };

    const save = () => {
        if (!label.trim() || saving) return;
        if (repeat === "days" && !days.length) {
            setDaysMissing(true);
            return;
        }
        onSave({ label: label.trim(), time, days: repeat === "daily" ? EVERY_DAY : repeat === "days" ? days : null });
    };

    const repeatOption = (value: Repeat, text: string) => (
        <Pressable
            key={value}
            style={[s.pill, repeat === value && s.pillActive]}
            onPress={() => {
                setRepeat(value);
                setDaysMissing(false);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: repeat === value }}
        >
            <Text style={[s.pillText, repeat === value && s.pillTextActive]}>{text}</Text>
        </Pressable>
    );

    return (
        <View style={s.card}>
            <TextInput
                style={s.input}
                placeholder={tj.newTask}
                placeholderTextColor={Color.mako}
                value={label}
                onChangeText={setLabel}
                maxLength={200}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={save}
            />

            <Text style={s.label}>{tj.time}</Text>
            <TimePicker value={time} onChange={setTime} lang={lang} noTimeLabel={tj.noTime} title={tj.chooseTime} />

            <Text style={s.label}>🔁 {tj.repeat}</Text>
            <View style={s.row}>
                {repeatOption("none", tj.repeatNone)}
                {repeatOption("daily", tj.repeatDaily)}
                {repeatOption("days", tj.repeatSomeDays)}
            </View>
            {repeat === "days" && (
                <View style={s.row}>
                    {WEEKDAYS_SHORT[lang].map((name, d) => (
                        <Pressable
                            key={d}
                            style={[s.day, days.includes(d) && s.dayActive]}
                            onPress={() => toggleDay(d)}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: days.includes(d) }}
                        >
                            <Text style={[s.dayText, days.includes(d) && s.dayTextActive]}>{name}</Text>
                        </Pressable>
                    ))}
                </View>
            )}

            {(daysMissing || error) && <Text style={s.error}>{daysMissing ? tj.chooseDays : error}</Text>}
            <View style={s.buttons}>
                <Pressable style={s.cancelBtn} onPress={onCancel}>
                    <Text style={s.cancelBtnText}>{tj.cancel}</Text>
                </Pressable>
                <Pressable
                    style={[s.saveBtn, (!label.trim() || saving) && s.disabled]}
                    disabled={!label.trim() || saving}
                    onPress={save}
                >
                    <Text style={s.saveBtnText}>{saving ? "…" : tj.save}</Text>
                </Pressable>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: {
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
    label: { fontSize: 12, fontWeight: "600", color: Color.mako, marginTop: 4 },
    row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    pill: { borderWidth: 1, borderColor: Color.linkWater, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 },
    pillActive: { backgroundColor: Color.endeavour, borderColor: Color.endeavour },
    pillText: { fontSize: 13, color: Color.blackPearl },
    pillTextActive: { color: Color.white, fontWeight: "600" },
    day: { minWidth: 44, alignItems: "center", borderWidth: 1, borderColor: Color.linkWater, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 7 },
    dayActive: { backgroundColor: "#dcebf7", borderColor: Color.endeavour },
    dayText: { fontSize: 13, color: Color.mako },
    dayTextActive: { color: Color.endeavour, fontWeight: "700" },
    error: { fontSize: 13, color: Color.red },
    buttons: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 4 },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
    cancelBtnText: { fontSize: 15, fontWeight: "600", color: Color.mako },
    saveBtn: { backgroundColor: Color.endeavour, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10 },
    saveBtnText: { fontSize: 15, fontWeight: "700", color: Color.white },
    disabled: { opacity: 0.5 },
});
