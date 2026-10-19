// ── PlaceInterest.tsx ────────────────────────────────────────────────
// "I want to go" on a place card (e.g. Nazareth): mark the place, see how many
// caregivers want to go, and invite one of them with the fixed "visit
// together" message. Same privacy as the caregivers list: first name and city
// only; phone numbers only after the invitation is accepted (see
// backend/services/community.js).
import * as React from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useLang } from "../AppContext";
import { COMMUNITY_T, MESSAGES, fillC } from "../communityStrings";
import { nameIn } from "../nameStrings";
import { setPlaceInterest, getPlacePeople, sendContactRequest, CommunityPerson } from "../api/client";
import { showAlert, confirmAction } from "../api/platform";

const C = { blue: "#005dac", ink: "#071e27", muted: "#414752", line: "#cfe6f2", bg: "#f3faff", white: "#fff", green: "#2e7d32" };

export default function PlaceInterest({ placeKey, placeName, count, mine, onChanged, onNeedJoin }: {
    placeKey: string;
    placeName: string;
    count: number;           // others who want to go (not me, nobody blocked with me)
    mine: boolean;
    onChanged: () => void;   // reload the counts
    onNeedJoin: () => void;  // the user isn't on the caregivers list yet
}) {
    const { lang } = useLang();
    const t = COMMUNITY_T[lang];
    const [busy, setBusy] = React.useState(false);
    // null while loading; "failed" shows an error with Try again (never a silently empty list).
    const [people, setPeople] = React.useState<CommunityPerson[] | null | "failed">(null);
    const [open, setOpen] = React.useState(false);

    const loadPeople = async () => {
        setPeople(null);
        try {
            setPeople((await getPlacePeople(placeKey)).people);
        } catch {
            setPeople("failed");
        }
    };

    const toggle = async () => {
        setBusy(true);
        try {
            await setPlaceInterest(placeKey, !mine);
            onChanged();
            if (open) loadPeople();
        } catch (err: any) {
            if (err?.code === "noProfile") {
                showAlert(t.joinFirst);
                onNeedJoin();
            } else {
                showAlert(err?.message ?? "Error");
            }
        } finally {
            setBusy(false);
        }
    };

    const invite = async (p: CommunityPerson) => {
        if (!(await confirmAction(fillC(t.inviteConfirm, { name: nameIn(p, lang), place: placeName }), t.invite, t.cancel))) return;
        try {
            await sendContactRequest(p.id, "visitTogether", placeKey);
            loadPeople();
        } catch (err: any) {
            if (err?.code === "noProfile") onNeedJoin();
            showAlert(err?.message ?? "Error");
        }
    };

    const showWho = () => {
        const next = !open;
        setOpen(next);
        if (next) loadPeople();
    };

    return (
        <View style={s.wrap}>
            <View style={s.row}>
                <Pressable style={[s.want, mine && s.wantOn, busy && { opacity: 0.6 }]} onPress={toggle} disabled={busy} accessibilityRole="button">
                    <Text style={[s.wantText, mine && { color: C.green }]}>{mine ? t.youWantToGo : t.wantToGo}</Text>
                </Pressable>
            </View>
            <View style={s.row}>
                <Text style={s.count}>{count === 1 ? t.oneWantsToGo : count > 1 ? fillC(t.peopleWantToGo, { n: String(count) }) : t.nobodyYet}</Text>
                {count > 0 ? (
                    <Pressable onPress={showWho} accessibilityRole="button">
                        <Text style={s.link}>{open ? t.hideWho : t.showWho}</Text>
                    </Pressable>
                ) : null}
            </View>
            {open ? (
                people === null ? <ActivityIndicator color={C.blue} /> : people === "failed" ? (
                    <View style={s.row}>
                        <Text style={[s.small, { flex: 1 }]}>{t.loadFailed}</Text>
                        <Pressable onPress={loadPeople} accessibilityRole="button">
                            <Text style={s.link}>{t.retry}</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={{ gap: 6 }}>
                        {people.map((p) => (
                            <View key={p.id} style={s.person}>
                                <View style={s.avatar}><Text style={s.avatarText}>{nameIn(p, lang).charAt(0).toUpperCase()}</Text></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.name}>{nameIn(p, lang)}</Text>
                                    <Text style={s.small}>{p.neighborhood ? `${p.neighborhood}, ` : ""}{p.city}</Text>
                                </View>
                                {p.status === "none" ? (
                                    <Pressable style={s.inviteBtn} onPress={() => invite(p)} accessibilityRole="button">
                                        <Text style={s.inviteText}>{t.invite}</Text>
                                    </Pressable>
                                ) : (
                                    <Text style={[s.small, { maxWidth: 110, textAlign: "right" }, p.status === "accepted" && { color: C.green }]}>
                                        {{ sent: t.statusSent, accepted: t.statusAccepted, declined: t.statusDeclined, received: t.statusReceived }[p.status]}
                                    </Text>
                                )}
                            </View>
                        ))}
                        <Text style={s.small}>
                            {fillC(t.inviteSays, { invite: t.invite })}{" "}
                            <Text style={s.quote}>“{fillC(MESSAGES.visitTogether[lang], { place: placeName })}”</Text>
                        </Text>
                    </View>
                )
            ) : null}
        </View>
    );
}

const s = StyleSheet.create({
    wrap: { gap: 6, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 },
    row: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
    want: { borderRadius: 20, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg, paddingHorizontal: 14, paddingVertical: 8 },
    wantOn: { borderColor: "#a5d6a7", backgroundColor: "#e8f5e9" },
    wantText: { fontSize: 14, fontWeight: "600", color: C.blue },
    count: { fontSize: 13, color: C.muted, flex: 1 },
    link: { fontSize: 13, color: C.blue, fontWeight: "600" },
    person: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#7c3aed", alignItems: "center", justifyContent: "center" },
    avatarText: { color: C.white, fontWeight: "700", fontSize: 13 },
    name: { fontSize: 14, fontWeight: "700", color: C.ink },
    small: { fontSize: 12, color: C.muted },
    quote: { fontStyle: "italic", color: C.ink },
    inviteBtn: { backgroundColor: C.blue, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
    inviteText: { color: C.white, fontSize: 13, fontWeight: "600" },
});
