// ── PlaceInterest.tsx ────────────────────────────────────────────────
// "I want to go" on a place card (e.g. Nazareth): mark the place, see who else
// wants to go, invite them with the fixed "visit together" message, and
// accept or decline their invitations right here. Anyone can look; marking
// and inviting need the caregivers list (name + city), which can be joined
// right here (JoinListModal). Phone numbers only after an invitation is
// accepted (see backend/services/community.js).
import * as React from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useLang } from "../AppContext";
import { COMMUNITY_T, MESSAGES, fillC } from "../communityStrings";
import { nameIn } from "../nameStrings";
import JoinListModal from "./JoinListModal";
import { UserLocation } from "./LocationPicker";
import {
    setPlaceInterest, getPlacePeople, sendContactRequest, respondContactRequest, CommunityPerson,
} from "../api/client";
import { showAlert, confirmAction } from "../api/platform";

const C = { blue: "#005dac", ink: "#071e27", muted: "#414752", line: "#cfe6f2", bg: "#f3faff", white: "#fff", green: "#2e7d32" };

export default function PlaceInterest({ placeKey, placeName, count, mine, location, onChanged, onRequestsChanged, onOpenConnection, onChooseCity }: {
    placeKey: string;
    placeName: string;
    count: number;                   // others who want to go (not me, nobody blocked with me)
    mine: boolean;
    location: UserLocation | null;   // "Where are you now?": the city for joining the list
    onChanged: () => void;           // reload the counts
    onRequestsChanged: () => void;   // an invitation was sent or answered, or the user joined
    onOpenConnection: (requestId: string) => void;   // phone numbers etc. are under Near you → Caregivers
    onChooseCity: () => void;        // go to "Where are you now?"
}) {
    const { lang } = useLang();
    const t = COMMUNITY_T[lang];
    const [busy, setBusy] = React.useState(false);
    // null while loading; "failed" shows an error with Try again (never a silently empty list).
    const [people, setPeople] = React.useState<CommunityPerson[] | null | "failed">(null);
    const [open, setOpen] = React.useState(false);
    // Not on the caregivers list yet: join it here, then carry on with what the user tapped.
    const [afterJoin, setAfterJoin] = React.useState<(() => void) | null>(null);

    const loadPeople = async () => {
        setPeople(null);
        try {
            setPeople((await getPlacePeople(placeKey)).people);
        } catch {
            setPeople("failed");
        }
    };

    const run = async (fn: () => Promise<unknown>, retry: () => void) => {
        setBusy(true);
        try {
            await fn();
        } catch (err: any) {
            if (err?.code === "noProfile") setAfterJoin(() => retry);
            else showAlert(err?.message ?? "Error");
        } finally {
            setBusy(false);
        }
    };

    const toggle = () => run(async () => {
        await setPlaceInterest(placeKey, !mine);
        onChanged();
        if (open) loadPeople();
    }, toggle);

    const invite = async (p: CommunityPerson) => {
        if (!(await confirmAction(fillC(t.inviteConfirm, { name: nameIn(p, lang), place: placeName }), t.invite, t.cancel))) return;
        const send = () => run(async () => {
            await sendContactRequest(p.id, "visitTogether", placeKey);
            loadPeople();
            onRequestsChanged();
        }, send);
        send();
    };

    const answer = (p: CommunityPerson, action: "accept" | "decline") => run(async () => {
        if (p.requestId) await respondContactRequest(p.requestId, action);
        loadPeople();
        onRequestsChanged();
    }, () => {});

    const showWho = () => {
        const next = !open;
        setOpen(next);
        if (next) loadPeople();
    };

    const list = Array.isArray(people) ? people : [];

    return (
        <View style={s.wrap}>
            <View style={s.row}>
                <Pressable style={[s.want, mine && s.wantOn, busy && { opacity: 0.6 }]} onPress={toggle} disabled={busy} accessibilityRole="button">
                    <Text style={[s.wantText, mine && { color: C.green }]}>{mine ? t.youWantToGo : t.wantToGo}</Text>
                </Pressable>
            </View>
            {!mine ? <Text style={s.small}>{t.placeVisible}</Text> : null}
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
                    <View style={{ gap: 8 }}>
                        {list.map((p) => (
                            <View key={p.id} style={s.person}>
                                <View style={s.avatar}><Text style={s.avatarText}>{nameIn(p, lang).charAt(0).toUpperCase()}</Text></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.name}>{nameIn(p, lang)}</Text>
                                    {p.city ? <Text style={s.small}>{p.neighborhood ? `${p.neighborhood}, ` : ""}{p.city}</Text> : null}
                                </View>
                                {p.status === "none" ? (
                                    <Btn label={t.invite} onPress={() => invite(p)} primary disabled={busy} />
                                ) : p.status === "received" ? (
                                    <View style={s.side}>
                                        <Text style={s.small}>{t.statusReceived}</Text>
                                        <View style={s.row}>
                                            <Btn label={t.accept} onPress={() => answer(p, "accept")} primary disabled={busy} />
                                            <Btn label={t.decline} onPress={() => answer(p, "decline")} disabled={busy} />
                                        </View>
                                    </View>
                                ) : p.status === "accepted" ? (
                                    <View style={s.side}>
                                        <Text style={[s.small, { color: C.green }]}>{t.statusAccepted}</Text>
                                        <Pressable onPress={() => p.requestId && onOpenConnection(p.requestId)} hitSlop={8} accessibilityRole="button">
                                            <Text style={s.link}>{t.openConnection}</Text>
                                        </Pressable>
                                    </View>
                                ) : (
                                    <Text style={[s.small, { maxWidth: 110, textAlign: "right" }]}>
                                        {p.status === "sent" ? t.statusSent : t.statusDeclined}
                                    </Text>
                                )}
                            </View>
                        ))}
                        {/* What Invite sends – only when someone here can be invited. */}
                        {list.some((p) => p.status === "none") ? (
                            <Text style={s.small}>
                                {fillC(t.inviteSays, { invite: t.invite })}{" "}
                                <Text style={s.quote}>“{fillC(MESSAGES.visitTogether[lang], { place: placeName })}”</Text>
                            </Text>
                        ) : null}
                    </View>
                )
            ) : null}
            <JoinListModal
                visible={!!afterJoin}
                location={location}
                onClose={() => setAfterJoin(null)}
                onJoined={() => { onRequestsChanged(); afterJoin?.(); }}
                onChooseCity={onChooseCity}
            />
        </View>
    );
}

function Btn({ label, onPress, primary, disabled }: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[s.btn, primary && s.btnPrimary, disabled && { opacity: 0.5 }]}
            accessibilityRole="button"
        >
            <Text style={[s.btnText, primary && { color: C.white }]}>{label}</Text>
        </Pressable>
    );
}

const s = StyleSheet.create({
    wrap: { gap: 6, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 },
    row: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    want: { borderRadius: 20, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg, paddingHorizontal: 14, paddingVertical: 8 },
    wantOn: { borderColor: "#a5d6a7", backgroundColor: "#e8f5e9" },
    wantText: { fontSize: 14, fontWeight: "600", color: C.blue },
    count: { fontSize: 13, color: C.muted, flex: 1 },
    link: { fontSize: 13, color: C.blue, fontWeight: "600" },
    person: { flexDirection: "row", alignItems: "center", gap: 10 },
    side: { alignItems: "flex-end", gap: 4 },
    avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#7c3aed", alignItems: "center", justifyContent: "center" },
    avatarText: { color: C.white, fontWeight: "700", fontSize: 13 },
    name: { fontSize: 14, fontWeight: "700", color: C.ink },
    small: { fontSize: 12, color: C.muted },
    quote: { fontStyle: "italic", color: C.ink },
    btn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg },
    btnPrimary: { backgroundColor: C.blue, borderColor: C.blue },
    btnText: { fontSize: 13, fontWeight: "600", color: C.blue },
});
