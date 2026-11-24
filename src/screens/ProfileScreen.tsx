// ── ProfileScreen.tsx ────────────────────────────────────────────────
// Menu → Profile: the name others see, and the ways to sign in. A phone number
// and an email can both be on the account (each confirmed with a one-time code),
// so the user can sign in with either one – it's the same account. A phone or
// email that another account uses can't be added (nothing is ever merged).
import * as React from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useApp } from "../AppContext";
import { T } from "../translations";
import { BOT_T } from "../botStrings";
import { MENU_T } from "../menuStrings";
import { PageFrame } from "../components/InfoSections";
import NameEditor from "../components/NameEditor";
import EmailInput from "../components/EmailInput";
import PhoneInput, { phoneForDisplay } from "../components/PhoneInput";
import { getAuthOptions, requestLinkCode, verifyLinkCode, Identifier } from "../api/client";
import { themedColors, themedStyles } from "../theme";

const C = themedColors({ blue: "#005dac", ink: "#071e27", muted: "#414752", line: "#cfe6f2", bg: "#f3faff", white: "#fff", red: "#c62828", green: "#2e7d32" });

type Kind = "phone" | "email";

export default function ProfileScreen({ navigation }: { navigation: any }) {
    const { lang, user, setUser } = useApp();
    const t = T[lang];
    const b = BOT_T[lang];
    const m = MENU_T[lang];
    const [editingName, setEditingName] = React.useState(false);
    const [adding, setAdding] = React.useState<Kind | null>(null);
    const [step, setStep] = React.useState<"id" | "code">("id");
    const [value, setValue] = React.useState("");
    const [code, setCode] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [added, setAdded] = React.useState<Kind | null>(null);
    const [testCode, setTestCode] = React.useState<string | null>(null);
    const [realCodes, setRealCodes] = React.useState({ phone: false, email: false });

    React.useEffect(() => {
        getAuthOptions().then((o) => {
            setTestCode(o.testCode);
            if (o.realCodes) setRealCodes(o.realCodes);
        }).catch(() => { });
    }, []);

    if (!user) return null;
    const identifier = (): Identifier => (adding === "phone" ? { phone: value.trim() } : { email: value.trim() });

    const errorText = (err: any) => {
        const byCode: Record<string, string> = {
            alreadyUsed: m.alreadyUsed,
            alreadyYours: m.alreadyYours,
            demo: m.demoLocked,
            invalid: step === "code" ? b.errInvalidCode : b.errInvalidId,
            expired: b.errExpired,
            locked: b.errLocked,
            wait: b.errWait,
            unavailable: b.errUnavailable,
        };
        return byCode[err?.code] ?? (err?.status ? err.message : b.errNetwork);
    };

    const start = (kind: Kind) => {
        setAdding(kind);
        setStep("id");
        setValue("");
        setCode("");
        setError(null);
        setAdded(null);
    };

    const sendCode = async () => {
        if (!value.trim() || busy) return;
        setBusy(true);
        setError(null);
        try {
            await requestLinkCode(identifier());
            setCode("");
            setStep("code");
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    const confirm = async () => {
        if (code.trim().length < 6 || busy) return;
        setBusy(true);
        setError(null);
        try {
            setUser((await verifyLinkCode(identifier(), code.trim())).user);
            setAdded(adding);
            setAdding(null);
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    const row = (kind: Kind, label: string, current: string | null) => (
        <View style={s.row}>
            <View style={s.rowTop}>
                <View style={{ flex: 1 }}>
                    <Text style={s.rowLabel}>{label}</Text>
                    <Text style={[s.rowValue, !current && s.rowEmpty]}>{current ?? m.notAdded}</Text>
                </View>
                {!user.isDemo && adding !== kind && (
                    <Pressable style={s.smallBtn} onPress={() => start(kind)} accessibilityRole="button">
                        <Text style={s.smallBtnText}>{current ? m.change : m.add}</Text>
                    </Pressable>
                )}
            </View>
            {added === kind && <Text style={s.ok}>{m.linked}</Text>}
            {adding === kind && (
                <View style={s.form}>
                    {step === "id" && kind === "email" ? (
                        // Offers @gmail.com, @campus.haifa.ac.il… while typing; still free text.
                        <EmailInput
                            style={s.input}
                            placeholder={t.emailPh}
                            placeholderTextColor={C.muted}
                            value={value}
                            onChangeText={setValue}
                            autoFocus
                            onSubmitEditing={sendCode}
                        />
                    ) : step === "id" ? (
                        // Country codes to choose from (+972, +63, +91…); any other can be typed.
                        <PhoneInput
                            style={s.input}
                            lang={lang}
                            placeholderTextColor={C.muted}
                            value={value}
                            onChangeText={setValue}
                            autoFocus
                            onSubmitEditing={sendCode}
                        />
                    ) : (
                        <>
                            <Text style={s.hint}>{m.codeSentTo.replace("{to}", adding === "phone" ? phoneForDisplay(value) : value.trim())}</Text>
                            <TextInput
                                style={[s.input, s.codeInput]}
                                placeholder="••••••"
                                placeholderTextColor={C.muted}
                                value={code}
                                onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                                keyboardType="number-pad"
                                autoFocus
                                onSubmitEditing={confirm}
                            />
                            {testCode && adding && (
                                <Text style={s.hint}>
                                    🧪 {(realCodes[adding] ? b.testModeHintAlso : b.testModeHint).replace("{code}", testCode)}
                                </Text>
                            )}
                        </>
                    )}
                    {error && <Text style={s.error}>⚠ {error}</Text>}
                    <View style={s.formButtons}>
                        <Pressable style={s.cancelBtn} onPress={() => setAdding(null)}>
                            <Text style={s.cancelText}>{b.cancel}</Text>
                        </Pressable>
                        <Pressable
                            style={[s.mainBtn, (busy || (step === "id" ? !value.trim() : code.length < 6)) && s.disabled]}
                            onPress={step === "id" ? sendCode : confirm}
                            disabled={busy}
                            accessibilityRole="button"
                        >
                            {busy ? <ActivityIndicator color={C.white} /> : <Text style={s.mainBtnText}>{step === "id" ? m.sendCode : m.confirm}</Text>}
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <PageFrame title={t.profile} navigation={navigation}>
            {/* The name others see */}
            <View style={s.card}>
                <Text style={s.cardTitle}>👤 {m.nameTitle}</Text>
                <Text style={s.hint}>{m.nameHint}</Text>
                <View style={s.rowTop}>
                    <Text style={[s.nameValue, !user.displayName && s.rowEmpty]}>
                        {user.displayNames?.[lang] ?? user.displayName ?? m.noName}
                    </Text>
                    <Pressable style={s.smallBtn} onPress={() => setEditingName(true)} accessibilityRole="button">
                        <Text style={s.smallBtnText}>{user.displayName ? m.change : m.add}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Ways to sign in */}
            <View style={s.card}>
                <Text style={s.cardTitle}>🔑 {m.signInTitle}</Text>
                <Text style={s.hint}>{user.isDemo ? m.demoLocked : m.signInHint}</Text>
                {row("phone", m.phone, user.phone)}
                {row("email", m.email, user.email)}
            </View>

            <NameEditor visible={editingName} onClose={() => setEditingName(false)} />
        </PageFrame>
    );
}

const s = themedStyles({
    card: { backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.line, padding: 16, gap: 10 },
    cardTitle: { fontSize: 16, fontWeight: "700", color: C.ink },
    hint: { fontSize: 13, color: C.muted, lineHeight: 18 },
    nameValue: { flex: 1, fontSize: 17, fontWeight: "600", color: C.ink },
    row: { borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10, gap: 8 },
    rowTop: { flexDirection: "row", alignItems: "center", gap: 10 },
    rowLabel: { fontSize: 12, color: C.muted },
    rowValue: { fontSize: 16, fontWeight: "600", color: C.ink },
    rowEmpty: { fontWeight: "400", color: C.muted, fontStyle: "italic" },
    smallBtn: { borderWidth: 1, borderColor: C.blue, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 },
    smallBtnText: { fontSize: 14, fontWeight: "600", color: C.blue },
    ok: { fontSize: 13, color: C.green, fontWeight: "600" },
    form: { gap: 8 },
    input: { borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: C.ink, backgroundColor: C.bg },
    codeInput: { letterSpacing: 6, fontSize: 20, textAlign: "center" },
    error: { fontSize: 13, color: C.red },
    formButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    cancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
    cancelText: { fontSize: 15, fontWeight: "600", color: C.muted },
    mainBtn: { backgroundColor: C.blue, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, minWidth: 110, alignItems: "center" },
    mainBtnText: { fontSize: 15, fontWeight: "700", color: C.white },
    disabled: { opacity: 0.5 },
});
