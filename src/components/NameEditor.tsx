// ── NameEditor.tsx ───────────────────────────────────────────────────
// "Your name" box: add or change the user's first name. The server spells it
// in every app language's letters (backend/services/names.js); the greeting
// and the caregivers list show the spelling for each person's app language.
import * as React from "react";
import { View, Text, Pressable, TextInput, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { useLang } from "../AppContext";
import { LANGUAGES, T } from "../translations";
import { NAME_T, NAME_MAX, nameInput } from "../nameStrings";
import { updateMe } from "../api/client";

const C = { blue: "#005dac", ink: "#071e27", muted: "#414752", line: "#cfe6f2", bg: "#f3faff", white: "#fff", red: "#c62828" };

export default function NameEditor({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    const { lang, user, setUser } = useLang();
    const t = NAME_T[lang];
    const [name, setName] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        if (visible) {
            setName(user?.displayName ?? "");
            setError("");
        }
    }, [visible, user?.displayName]);

    const save = async () => {
        setSaving(true);
        setError("");
        try {
            setUser((await updateMe({ displayName: name.trim() })).user);
            onClose();
        } catch (err: any) {
            setError(err?.message ?? "Error");
        } finally {
            setSaving(false);
        }
    };

    // The saved name in every app language, so the user can check how others see it.
    const spellings = user?.displayNames && name.trim() === user.displayName
        ? LANGUAGES.map((l) => user.displayNames?.[l.code]).filter((v, i, all) => v && all.indexOf(v) === i)
        : [];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={s.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={s.sheet}>
                    <Text style={s.title}>{t.title}</Text>
                    <Text style={s.small}>{t.explain.replace("{community}", T[lang].navCommunity)}</Text>
                    <TextInput
                        style={s.input}
                        placeholder={t.placeholder}
                        value={name}
                        onChangeText={(v) => setName(nameInput(v))}
                        maxLength={NAME_MAX}
                        autoCorrect={false}
                        autoFocus
                        onSubmitEditing={() => name.trim() && !saving && save()}
                    />
                    <Text style={s.hint}>{t.lettersOnly}</Text>
                    {spellings.length ? (
                        <Text style={s.small}>{t.othersSee} <Text style={s.bold}>{spellings.join(" · ")}</Text></Text>
                    ) : null}
                    {error ? <Text style={[s.small, { color: C.red }]}>{error}</Text> : null}
                    <View style={s.actions}>
                        <Pressable onPress={onClose} style={s.btn} accessibilityRole="button">
                            <Text style={s.btnText}>{t.cancel}</Text>
                        </Pressable>
                        <Pressable
                            onPress={save}
                            disabled={saving || !name.trim()}
                            style={[s.btn, s.btnPrimary, (saving || !name.trim()) && { opacity: 0.5 }]}
                            accessibilityRole="button"
                        >
                            {saving ? <ActivityIndicator color={C.white} /> : <Text style={[s.btnText, { color: C.white }]}>{t.save}</Text>}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(7,30,39,0.4)", justifyContent: "center", padding: 16 },
    sheet: { backgroundColor: C.white, borderRadius: 14, padding: 16, gap: 10, maxWidth: 480, width: "100%", alignSelf: "center" },
    title: { fontSize: 17, fontWeight: "700", color: C.ink },
    small: { fontSize: 13, color: C.muted, lineHeight: 19 },
    bold: { fontWeight: "700", color: C.ink },
    hint: { fontSize: 11, color: C.muted },
    input: { borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: C.ink, backgroundColor: C.white },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
    btn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg, alignItems: "center", minWidth: 80 },
    btnPrimary: { backgroundColor: C.blue, borderColor: C.blue },
    btnText: { fontSize: 14, fontWeight: "600", color: C.blue },
});
