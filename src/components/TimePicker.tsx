// ── TimePicker.tsx ───────────────────────────────────────────────────
// Choosing a time like in Google Calendar: a field that opens a list of the
// times of the day, every 15 minutes, with "No time" first. The list opens
// scrolled to the chosen time (or to the current hour).
import * as React from "react";
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from "react-native";
import { LangCode, formatTime } from "../translations";

const Color = {
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    aliceBlue: "#f3faff",
    selected: "#dcebf7",
};

const STEP_MINUTES = 15;
const ROW_HEIGHT = 44;
const SLOTS = Array.from({ length: (24 * 60) / STEP_MINUTES }, (_, i) => {
    const m = i * STEP_MINUTES;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});

/** "14:30" → "2:30 PM" (or "14:30" in Russian). */
export const timeLabel = (time: string, lang: LangCode) =>
    formatTime(Number(time.slice(0, 2)), Number(time.slice(3, 5)), lang);

type Props = {
    value: string | null;                   // "HH:MM" (24 hours) or null
    onChange: (time: string | null) => void;
    lang: LangCode;
    noTimeLabel: string;
    title: string;
};

export default function TimePicker({ value, onChange, lang, noTimeLabel, title }: Props) {
    const [open, setOpen] = React.useState(false);
    const list = React.useRef<ScrollView>(null);
    // A time that isn't on the 15-minute list (from an older task) gets its own row.
    const options = value && !SLOTS.includes(value) ? [...SLOTS, value].sort() : SLOTS;

    const scrollToChoice = () => {
        const now = new Date();
        const target = value ?? `${String(now.getHours()).padStart(2, "0")}:00`;
        const row = options.indexOf(target) + 1;    // + the "No time" row
        list.current?.scrollTo({ y: Math.max(0, (row - 2) * ROW_HEIGHT), animated: false });
    };

    const choose = (time: string | null) => {
        onChange(time);
        setOpen(false);
    };

    const option = (key: string, label: string, selected: boolean, time: string | null) => (
        <Pressable
            key={key}
            style={[s.option, selected && s.optionSelected]}
            onPress={() => choose(time)}
            accessibilityRole="radio"
            aria-checked={selected}
        >
            <Text style={[s.optionText, selected && s.optionTextSelected]}>{label}</Text>
        </Pressable>
    );

    return (
        <>
            <Pressable style={s.field} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={title}>
                <Text style={s.fieldText}>🕒 {value ? timeLabel(value, lang) : noTimeLabel}</Text>
                <Text style={s.caret}>▾</Text>
            </Pressable>
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <View style={s.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityRole="button" />
                    <View style={s.card}>
                        <Text style={s.title}>{title}</Text>
                        <ScrollView ref={list} style={s.list} onLayout={scrollToChoice}>
                            {option("none", noTimeLabel, !value, null)}
                            {options.map((time) => option(time, timeLabel(time, lang), time === value, time))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const s = StyleSheet.create({
    field: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 10,
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: Color.aliceBlue,
    },
    fieldText: { fontSize: 15, color: Color.blackPearl },
    caret: { fontSize: 13, color: Color.mako },
    overlay: { flex: 1, backgroundColor: "rgba(7,30,39,0.35)", alignItems: "center", justifyContent: "center", padding: 24 },
    card: { backgroundColor: Color.white, borderRadius: 14, paddingVertical: 12, width: "100%", maxWidth: 320, maxHeight: "80%" },
    title: { fontSize: 16, fontWeight: "700", color: Color.blackPearl, paddingHorizontal: 18, paddingBottom: 8 },
    list: { maxHeight: ROW_HEIGHT * 7 },
    option: { height: ROW_HEIGHT, justifyContent: "center", paddingHorizontal: 18 },
    optionSelected: { backgroundColor: Color.selected },
    optionText: { fontSize: 15, color: Color.blackPearl },
    optionTextSelected: { color: Color.endeavour, fontWeight: "700" },
});
