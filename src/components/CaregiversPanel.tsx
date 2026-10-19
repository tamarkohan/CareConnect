// ── CaregiversPanel.tsx ──────────────────────────────────────────────
// The "Caregivers" tab of the community map: join the list (first name +
// the city/neighborhood chosen above), see other caregivers in that city,
// ask to connect with a fixed message, answer requests, and – only after a
// request is accepted – share a phone number. No chat, no photos, no
// location (see backend/services/community.js).
import * as React from "react";
import { View, Text, Pressable, TextInput, Modal, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { useLang } from "../AppContext";
import { COMMUNITY_T, MESSAGES, fillC } from "../communityStrings";
import { LangCode, RELIGIOUS_PLACES } from "../translations";
import { UserLocation, sharedCity, sharedNeighborhood } from "./LocationPicker";
import NameEditor from "./NameEditor";
import { NAME_T, NAME_MAX, nameIn, nameInput, nameError } from "../nameStrings";
import {
    getMe, getCommunityMe, saveCommunityProfile, leaveCommunity, getCommunityPeople, sendContactRequest,
    respondContactRequest, shareContactPhone, CommunityProfile, CommunityPerson, ContactRequest,
} from "../api/client";
import { showAlert, confirmAction } from "../api/platform";

const C = {
    blue: "#005dac", ink: "#071e27", muted: "#414752", line: "#cfe6f2", bg: "#f3faff",
    white: "#fff", green: "#2e7d32", lightGreen: "#e8f5e9", red: "#c62828",
};
/** A request's fixed message; "visit together" names its place (e.g. Nazareth). */
const messageText = (key: string, placeId: string | null, lang: LangCode) => {
    const placeName = RELIGIOUS_PLACES.find((p) => p.key === placeId)?.name.replace(/\s*\(.*\)$/, "") ?? "";
    return fillC(MESSAGES[key]?.[lang] ?? "", { place: placeName });
};
const place = (p: { city: string; neighborhood: string }) => (p.neighborhood ? `${p.neighborhood}, ${p.city}` : p.city);
// " · Haifa" after a name; nothing for someone (places only) who chose no city.
const atPlace = (p: { city: string; neighborhood: string }) => (p.city ? ` · ${place(p)}` : "");
const digits = (phone: string) => phone.replace(/[^\d+]/g, "");
// What the phone box accepts while typing: digits only, with an optional + at
// the start for a foreign number. Israeli numbers: up to 10 digits; with +: up to 15.
const phoneInput = (text: string) => {
    const plus = text.trim().startsWith("+");
    const d = text.replace(/\D/g, "");
    return plus ? `+${d.slice(0, 15)}` : d.slice(0, 10);
};
const validPhone = (p: string) => /^0\d{8,9}$/.test(p) || /^\+?[1-9]\d{7,14}$/.test(p);
// Israeli numbers for WhatsApp links: 050-1234567 → 972501234567
const waNumber = (phone: string) => {
    const d = digits(phone).replace(/^\+/, "");
    return d.startsWith("0") ? `972${d.slice(1)}` : d;
};

export default function CaregiversPanel({ location, focus, onFocusY }: {
    location: UserLocation | null;
    focus?: { id: string } | null;      // a connection to open and show ("Open connection" on a place)
    onFocusY?: (y: number) => void;    // where it is in this panel, to scroll there
}) {
    const { lang, user, setUser } = useLang();
    const t = COMMUNITY_T[lang];
    const [profile, setProfile] = React.useState<CommunityProfile | null | undefined>(undefined);
    const [loadFailed, setLoadFailed] = React.useState(false);
    const [requests, setRequests] = React.useState<ContactRequest[]>([]);
    // "failed" shows an error with Try again, never a misleading "nobody here".
    const [people, setPeople] = React.useState<CommunityPerson[] | null | "failed">(null);
    // One name for the whole app: joining starts from the account's name (Home → "Change name").
    const [name, setName] = React.useState(user?.displayName ?? "");
    const [editingName, setEditingName] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [asking, setAsking] = React.useState<CommunityPerson | null>(null);
    // Connections are shown as one line each (name · place); tap to open the details.
    const [openIds, setOpenIds] = React.useState<string[]>([]);
    // The connection opened from a place: shown open and highlighted for a moment.
    const [highlightId, setHighlightId] = React.useState<string | null>(null);
    const cardY = React.useRef(0);
    React.useEffect(() => {
        if (!focus) return;
        setOpenIds((ids) => (ids.includes(focus.id) ? ids : [...ids, focus.id]));
        setHighlightId(focus.id);
    }, [focus]);
    React.useEffect(() => {
        if (!highlightId) return;
        const timer = setTimeout(() => setHighlightId(null), 2500);
        return () => clearTimeout(timer);
    }, [highlightId]);

    const loadMe = React.useCallback(async () => {
        try {
            const me = await getCommunityMe();
            setProfile(me.profile);
            setRequests(me.requests);
            setLoadFailed(false);
        } catch {
            // Not "join the list": the user may well be on it already.
            setLoadFailed(true);
        }
    }, []);
    React.useEffect(() => { loadMe(); }, [loadMe]);

    // The city others see: none for "All of Israel – I'd rather not say" or nothing chosen.
    const city = sharedCity(location);
    const neighborhood = sharedNeighborhood(location);
    const loadPeople = React.useCallback(async () => {
        if (!city) return setPeople(null);
        try {
            setPeople((await getCommunityPeople(city, neighborhood)).people);
        } catch {
            setPeople("failed");
        }
    }, [city, neighborhood]);
    React.useEffect(() => { if (profile?.listed) loadPeople(); }, [profile, loadPeople]);

    // Keep the profile's city in step with the place chosen above (also "All of Israel",
    // which hides it). Only once a place was chosen on this device, and only for people
    // on the list ("Near you").
    React.useEffect(() => {
        if (location && profile?.listed && (profile.city !== city || profile.neighborhood !== neighborhood)) {
            // The account name, in case it was changed on Home since the profile was loaded.
            saveCommunityProfile({ displayName: user?.displayName || profile.displayName, city, neighborhood, language: lang })
                .then((r) => setProfile(r.profile)).catch(() => {});
        }
    }, [location, profile, city, neighborhood, lang, user?.displayName]);

    const run = async (fn: () => Promise<unknown>) => {
        setBusy(true);
        try {
            await fn();
        } catch (err: any) {
            showAlert(nameError(err, lang));
        } finally {
            setBusy(false);
        }
    };

    const join = () => run(async () => {
        const r = await saveCommunityProfile({ displayName: name, city, neighborhood, language: lang });
        setProfile(r.profile);
        // The list name is also the account name now (greeting on Home).
        setUser((await getMe()).user);
    });
    const leave = async () => {
        if (!(await confirmAction(t.leaveConfirm, t.leave, t.cancel))) return;
        run(async () => { await leaveCommunity(); setProfile(null); setPeople(null); await loadMe(); });
    };
    const send = (person: CommunityPerson, key: string) => run(async () => {
        await sendContactRequest(person.id, key);
        setAsking(null);
        await Promise.all([loadPeople(), loadMe()]);
    });
    const answer = async (r: ContactRequest, action: "accept" | "decline" | "block") => {
        if (action === "block" && !(await confirmAction(t.blockConfirm, t.block, t.cancel))) return;
        run(async () => { await respondContactRequest(r.id, action); await Promise.all([loadMe(), loadPeople()]); });
    };

    if (profile === undefined) {
        return loadFailed ? (
            <View style={s.card}>
                <Text style={s.body}>{t.loadFailed}</Text>
                <Btn label={t.retry} onPress={() => { setLoadFailed(false); loadMe(); }} primary />
            </View>
        ) : <ActivityIndicator color={C.blue} style={{ marginVertical: 16 }} />;
    }

    const incoming = requests.filter((r) => r.direction === "received" && r.status === "pending");
    const connections = requests.filter((r) => r.status === "accepted");

    return (
        <View style={s.wrap}>
            {incoming.length ? (
                <View style={s.card}>
                    <Text style={s.title}>🔔 {t.requestsTitle} ({incoming.length})</Text>
                    {incoming.map((r) => (
                        <View key={r.id} style={s.item}>
                            <Text style={s.body}><Text style={s.bold}>{fillC(t.wantsToConnect, { name: nameIn(r.other, lang) })}</Text>{atPlace(r.other)}</Text>
                            <Text style={s.quote}>“{messageText(r.messageKey, r.placeId, lang)}”</Text>
                            <View style={s.actions}>
                                <Btn label={t.accept} onPress={() => answer(r, "accept")} primary disabled={busy} />
                                <Btn label={t.decline} onPress={() => answer(r, "decline")} disabled={busy} />
                                <Btn label={t.block} onPress={() => answer(r, "block")} danger disabled={busy} />
                            </View>
                        </View>
                    ))}
                </View>
            ) : null}

            {connections.length ? (
                <View style={s.card} onLayout={(e) => { cardY.current = e.nativeEvent.layout.y; }}>
                    <View style={s.titleRow}>
                        <Text style={[s.title, { flex: 1 }]}>🤝 {t.contactsTitle} ({connections.length})</Text>
                        {openIds.length ? (
                            <Pressable onPress={() => setOpenIds([])} accessibilityRole="button">
                                <Text style={s.link}>{t.closeAll}</Text>
                            </Pressable>
                        ) : null}
                    </View>
                    {connections.map((r) => (
                        <Connection
                            key={r.id}
                            request={r}
                            // With one connection it's open; with more, only the ones the user opened.
                            open={connections.length === 1 || openIds.includes(r.id)}
                            onToggle={() => setOpenIds(openIds.includes(r.id) ? openIds.filter((x) => x !== r.id) : [...openIds, r.id])}
                            onChanged={loadMe}
                            onBlock={() => answer(r, "block")}
                            highlight={highlightId === r.id}
                            // Scroll to it once it's on screen (after the card's own layout).
                            onLayoutY={focus?.id === r.id && onFocusY ? (y) => setTimeout(() => onFocusY(cardY.current + y), 50) : undefined}
                        />
                    ))}
                </View>
            ) : null}

            {!profile?.listed ? (
                <View style={s.card}>
                    <Text style={s.title}>{t.joinTitle}</Text>
                    <Text style={s.small}>{t.joinBody}</Text>
                    <TextInput style={s.input} placeholder={t.firstName} value={name} onChangeText={(v) => setName(nameInput(v))} maxLength={NAME_MAX} autoCorrect={false} />
                    {/* The city is optional: without one, others see only the name. */}
                    <Text style={s.small}>{city ? `📍 ${neighborhood ? `${neighborhood}, ` : ""}${city}` : t.noCityJoin}</Text>
                    <Btn label={t.join} onPress={join} primary disabled={busy || !name.trim()} />
                </View>
            ) : (
                <View style={s.card}>
                    <Text style={s.small}>{fillC(t.youAppearAs, { name: nameIn(user, lang) || profile.displayName, place: place(profile) || t.cityHidden })}</Text>
                    <Text style={s.small}>
                        {NAME_T[lang].othersLetters}{" "}
                        <Text style={s.link} onPress={() => setEditingName(true)} accessibilityRole="button">✎ {NAME_T[lang].changeName}</Text>
                    </Text>
                    {!city ? (
                        <Text style={s.small}>{t.noCityNote}</Text>
                    ) : people === null ? null : people === "failed" ? (
                        <View style={s.actions}>
                            <Text style={[s.small, { flex: 1 }]}>{t.loadFailed}</Text>
                            <Btn label={t.retry} onPress={loadPeople} />
                        </View>
                    ) : people.length === 0 ? (
                        <Text style={s.body}>{t.noPeople}</Text>
                    ) : (
                        people.map((p) => (
                            <View key={p.id} style={s.person}>
                                <View style={s.avatar}><Text style={s.avatarText}>{nameIn(p, lang).charAt(0).toUpperCase()}</Text></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.bold}>{nameIn(p, lang)}</Text>
                                    <Text style={s.small}>{place(p)}</Text>
                                </View>
                                {p.status === "none" ? (
                                    <Btn label={t.askToConnect} onPress={() => setAsking(p)} primary disabled={busy} />
                                ) : (
                                    <Text style={[s.status, p.status === "accepted" && { color: C.green }]}>
                                        {{ sent: t.statusSent, accepted: t.statusAccepted, declined: t.statusDeclined, received: t.statusReceived }[p.status]}
                                    </Text>
                                )}
                            </View>
                        ))
                    )}
                    <Pressable onPress={leave} style={{ alignSelf: "flex-end", paddingTop: 6 }}>
                        <Text style={{ color: C.red, fontSize: 13, fontWeight: "600" }}>{t.leave}</Text>
                    </Pressable>
                </View>
            )}

            <Text style={s.privacy}>🔒 {t.privacy}</Text>

            <NameEditor visible={editingName} onClose={() => setEditingName(false)} />

            <Modal visible={!!asking} transparent animationType="fade" onRequestClose={() => setAsking(null)}>
                <View style={s.backdrop}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setAsking(null)} />
                    <View style={s.sheet}>
                        <Text style={s.title}>{t.chooseMessage}</Text>
                        <Text style={s.small}>{nameIn(asking, lang)} · {asking ? place(asking) : ""}</Text>
                        {Object.keys(MESSAGES).filter((key) => key !== "visitTogether").map((key) => (
                            <Pressable key={key} style={s.option} onPress={() => asking && send(asking, key)} disabled={busy}>
                                <Text style={s.body}>“{MESSAGES[key][lang]}”</Text>
                            </Pressable>
                        ))}
                        <Pressable onPress={() => setAsking(null)} style={{ alignSelf: "flex-end", padding: 8 }}>
                            <Text style={{ color: C.blue, fontWeight: "600" }}>{t.cancel}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

/** One accepted connection: share my number, see theirs (call / WhatsApp), block. */
function Connection({ request: r, open, onToggle, onChanged, onBlock, highlight, onLayoutY }: {
    request: ContactRequest; open: boolean; onToggle: () => void; onChanged: () => void; onBlock: () => void;
    highlight?: boolean; onLayoutY?: (y: number) => void;
}) {
    const { lang } = useLang();
    const t = COMMUNITY_T[lang];
    const [phone, setPhone] = React.useState("");
    const [saving, setSaving] = React.useState(false);

    const share = async () => {
        setSaving(true);
        try {
            await shareContactPhone(r.id, phone);
            setPhone("");
            onChanged();
        } catch (err: any) {
            showAlert(err?.message ?? "Error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[s.item, highlight && s.highlight]} onLayout={onLayoutY && ((e) => onLayoutY(e.nativeEvent.layout.y))}>
            <Pressable style={s.connHead} onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }}>
                <Text style={[s.bold, { flex: 1 }]} numberOfLines={1}>
                    {nameIn(r.other, lang)} <Text style={s.small}>{atPlace(r.other)}</Text>
                </Text>
                {!open && r.theirPhone ? <Text style={s.small}>📞</Text> : null}
                <Text style={s.caret}>{open ? "▴" : "▾"}</Text>
            </Pressable>
            {open ? (
            <>
            {r.theirPhone ? (
                <View style={s.phoneRow}>
                    <Text style={s.body}>{fillC(t.theirPhone, { name: nameIn(r.other, lang) })} <Text style={s.bold}>{r.theirPhone}</Text></Text>
                    <View style={s.actions}>
                        <Btn label={`📞 ${t.call}`} onPress={() => Linking.openURL(`tel:${digits(r.theirPhone!)}`)} />
                        <Btn label={`💬 ${t.whatsapp}`} onPress={() => Linking.openURL(`https://wa.me/${waNumber(r.theirPhone!)}`)} />
                    </View>
                </View>
            ) : (
                <Text style={s.small}>{fillC(t.waitingForPhone, { name: nameIn(r.other, lang) })}</Text>
            )}
            {r.myPhone ? (
                <Text style={s.small}>{fillC(t.shared, { phone: r.myPhone })}</Text>
            ) : (
                <View style={{ gap: 6 }}>
                    <Text style={s.small}>{t.sharePhone} – {t.sharePhoneHint}</Text>
                    <View style={s.actions}>
                        <TextInput
                            style={[s.input, { flex: 1 }]}
                            placeholder={t.phonePlaceholder}
                            value={phone}
                            onChangeText={(v) => setPhone(phoneInput(v))}
                            keyboardType="phone-pad"
                            inputMode="tel"
                            maxLength={16}
                        />
                        <Btn label={t.send} onPress={share} primary disabled={saving || !validPhone(phone)} />
                    </View>
                </View>
            )}
            <Pressable onPress={onBlock} style={{ alignSelf: "flex-end" }}>
                <Text style={{ color: C.red, fontSize: 12 }}>{t.block}</Text>
            </Pressable>
            </>
            ) : null}
        </View>
    );
}

function Btn({ label, onPress, primary, danger, disabled }: { label: string; onPress: () => void; primary?: boolean; danger?: boolean; disabled?: boolean }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[s.btn, primary && s.btnPrimary, danger && s.btnDanger, disabled && { opacity: 0.5 }]}
            accessibilityRole="button"
        >
            <Text style={[s.btnText, primary && { color: C.white }, danger && { color: C.red }]}>{label}</Text>
        </Pressable>
    );
}

const s = StyleSheet.create({
    wrap: { gap: 10 },
    card: { backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.line, padding: 12, gap: 8 },
    title: { fontSize: 15, fontWeight: "700", color: C.ink },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    link: { fontSize: 13, color: C.blue, fontWeight: "600" },
    connHead: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 2 },
    caret: { fontSize: 14, color: C.muted, width: 16, textAlign: "center" },
    body: { fontSize: 14, color: C.ink, lineHeight: 20 },
    bold: { fontSize: 14, fontWeight: "700", color: C.ink },
    small: { fontSize: 12, color: C.muted, lineHeight: 17 },
    quote: { fontSize: 14, color: C.ink, fontStyle: "italic", backgroundColor: C.bg, borderRadius: 8, padding: 8 },
    item: { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, gap: 6 },
    highlight: { backgroundColor: "#fff8e1", borderRadius: 8, paddingHorizontal: 6, paddingBottom: 6 },
    actions: { flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" },
    person: { flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 },
    avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#7c3aed", alignItems: "center", justifyContent: "center" },
    avatarText: { color: C.white, fontWeight: "700", fontSize: 15 },
    status: { fontSize: 12, fontWeight: "600", color: C.muted, maxWidth: 110, textAlign: "right" },
    input: { borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: C.ink, backgroundColor: C.white },
    btn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.line, backgroundColor: C.bg, alignItems: "center" },
    btnPrimary: { backgroundColor: C.blue, borderColor: C.blue },
    btnDanger: { backgroundColor: C.white, borderColor: "#f3c4c4" },
    btnText: { fontSize: 13, fontWeight: "600", color: C.blue },
    phoneRow: { gap: 6 },
    privacy: { fontSize: 11, color: C.muted, lineHeight: 15 },
    backdrop: { flex: 1, backgroundColor: "rgba(7,30,39,0.4)", justifyContent: "center", padding: 16 },
    sheet: { backgroundColor: C.white, borderRadius: 14, padding: 16, gap: 8, maxWidth: 480, width: "100%", alignSelf: "center" },
    option: { borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 10, backgroundColor: C.bg },
});
