// ── JoinListModal.tsx ────────────────────────────────────────────────
// Join the caregivers list without leaving a place card: "I want to go" and
// invitations are for people on the list (a public name others can find).
// Name (the account name, see nameStrings.ts) + the city chosen in "Where
// are you now?", if any (no city = others see only the name); then the place
// card carries on with what the user tapped.
import * as React from "react";
import { View, Text, Pressable, TextInput, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { useLang } from "../AppContext";
import { COMMUNITY_T } from "../communityStrings";
import { NAME_MAX, nameInput, nameError } from "../nameStrings";
import { UserLocation, sharedCity, sharedNeighborhood } from "./LocationPicker";
import { getMe, saveCommunityProfile } from "../api/client";

const C = { blue: "#005dac", ink: "#071e27", muted: "#414752", line: "#cfe6f2", bg: "#f3faff", white: "#fff", red: "#c62828" };

export default function JoinListModal({ visible, location, onClose, onJoined, onChooseCity }: {
    visible: boolean;
    location: UserLocation | null;
    onClose: () => void;
    onJoined: () => void;       // carry on with "I want to go" / the invitation
    onChooseCity: () => void;   // go to "Where are you now?" (choosing a city is optional)
}) {
    const { lang, user, setUser } = useLang();
    const t = COMMUNITY_T[lang];
    const [name, setName] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        if (visible) {
            setName(user?.displayName ?? "");
            setError("");
        }
    }, [visible, user?.displayName]);

    const city = sharedCity(location);
    const neighborhood = sharedNeighborhood(location);
    const where = neighborhood ? `${neighborhood}, ${city}` : city;

    const join = async () => {
        setSaving(true);
        setError("");
        try {
            await saveCommunityProfile({ displayName: name.trim(), city, neighborhood, language: lang });
            // The list name is the account name too (greeting on Home).
            setUser((await getMe()).user);
            onClose();
            onJoined();
        } catch (err: any) {
            setError(nameError(err, lang));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={s.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={s.sheet}>
                    <Text style={s.title}>{t.joinTitle}</Text>
                    <Text style={s.note}>{t.joinForPlaces}</Text>
                    <TextInput
                        style={s.input}
                        placeholder={t.firstName}
                        value={name}
                        onChangeText={(v) => setName(nameInput(v))}
                        maxLength={NAME_MAX}
                        autoCorrect={false}
                    />
                    {city ? (
                        <Text style={s.small}>📍 {where}</Text>
                    ) : (
                        <View style={{ gap: 4 }}>
                            <Text style={s.small}>{t.noCityJoin}</Text>
                            <Pressable onPress={() => { onClose(); onChooseCity(); }} hitSlop={6} accessibilityRole="button">
                                <Text style={s.link}>📍 {t.chooseCity}</Text>
                            </Pressable>
                        </View>
                    )}
                    <Text style={s.small}>{t.joinBody}</Text>
                    {error ? <Text style={[s.small, { color: C.red }]}>{error}</Text> : null}
                    <View style={s.actions}>
                        <Pressable onPress={onClose} style={s.btn} accessibilityRole="button">
                            <Text style={s.btnText}>{t.cancel}</Text>
                        </Pressable>
                        <Pressable
                            onPress={join}
                            disabled={saving || !name.trim()}
                            style={[s.btn, s.btnPrimary, (saving || !name.trim()) && { opacity: 0.5 }]}
                            accessibilityRole="button"
                        >
                            {saving ? <ActivityIndicator color={C.white} /> : <Text style={[s.btnText, { color: C.white }]}>{t.join}</Text>}
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
    note: { fontSize: 14, color: C.ink, lineHeight: 20 },
    small: { fontSize: 12, color: C.muted, lineHeight: 17 },
    link: { fontSize: 13, color: C.blue, fontWeight: "600" },
    input: { borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: C.ink, backgroundColor: C.white },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
    btn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg, alignItems: "center", alignSelf: "flex-start", minWidth: 80 },
    btnPrimary: { backgroundColor: C.blue, borderColor: C.blue },
    btnText: { fontSize: 14, fontWeight: "600", color: C.blue },
});
