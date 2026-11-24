import * as React from "react";
import { useApp } from "../AppContext";
import { LangCode } from "../translations";
import { BOT_T } from "../botStrings";
import { MENU_T } from "../menuStrings";
import { requestCode, verifyCode, getAuthOptions, Identifier, SignInResponse } from "../api/client";

import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal,
    BackHandler,
} from "react-native";
import EmailInput from "../components/EmailInput";
import PhoneInput, { phoneForDisplay } from "../components/PhoneInput";
import { PAGE_T } from "../pageStrings";
import { themedColors, themedStyles } from "../theme";

// ── Tokens ───────────────────────────────────────────────────────────
const Color = themedColors({
    aliceBlue: "#f3faff",
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    silver: "#c1c6d4",
    error: "#ba1a1a",
    lightGray: "#f5f5f5",
});

// ── Supported languages ──────────────────────────────────────────────
const LANGUAGES = [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "tl", label: "Tagalog", nativeLabel: "Tagalog" },
    { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
    { code: "ru", label: "Russian", nativeLabel: "Русский" },
    { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
    { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
];

// ── Translations ─────────────────────────────────────────────────────
const T: Record<string, Record<string, string>> = {
    en: {
        appName: "CareConnect Israel",
        tagline: "Your supportive companion in Israel.",
        phone: "Phone",
        email: "Email",
        phoneLabel: "Phone Number",
        emailLabel: "Email",
        emailPh: "account@example.com",
        hint: "We'll send a secure code to verify it's you. No password needed.",
        cta: "Continue →",
        terms: "By continuing, you agree to our ",
        termsLink: "Terms of Service",
        and: " and ",
        privLink: "Privacy Policy",
    },
    tl: {
        appName: "CareConnect Israel",
        tagline: "Ang iyong maaasahang katulong sa Israel.",
        phone: "Telepono",
        email: "Email",
        phoneLabel: "Numero ng Telepono",
        emailLabel: "Email",
        emailPh: "account@example.com",
        hint: "Magpapadala kami ng secure code upang kumpirmahin na ikaw ito. Hindi na kailangan ng password.",
        cta: "Magpatuloy →",
        terms: "Sa pagpapatuloy, sumasang-ayon ka sa aming ",
        termsLink: "Mga Tuntunin ng Serbisyo",
        and: " at ",
        privLink: "Patakaran sa Privacy",
    },
    ml: {
        appName: "കെയർകണക്ട് ഇസ്രായേൽ",
        tagline: "ഇസ്രായേലിൽ നിങ്ങളുടെ വിശ്വസ്ത സഹചാരി.",
        phone: "ഫോൺ",
        email: "ഇമെയിൽ",
        phoneLabel: "ഫോൺ നമ്പർ",
        emailLabel: "ഇമെയിൽ",
        emailPh: "account@example.com",
        hint: "നിങ്ങളാണെന്ന് സ്ഥിരീകരിക്കാൻ ഞങ്ങൾ ഒരു സുരക്ഷിത കോഡ് അയക്കും. പാസ്‌വേഡ് ആവശ്യമില്ല.",
        cta: "തുടരുക →",
        terms: "തുടർന്നാൽ, നിങ്ങൾ ഞങ്ങളുടെ ",
        termsLink: "സേവന നിബന്ധനകൾ",
        and: " ഉം ",
        privLink: "സ്വകാര്യതാ നയം",
    },
    ru: {
        appName: "CareConnect Израиль",
        tagline: "Ваш надёжный спутник в Израиле.",
        phone: "Телефон",
        email: "Электронная почта",
        phoneLabel: "Телефон",
        emailLabel: "Электронная почта",
        emailPh: "account@example.com",
        hint: "Мы отправим вам код безопасности для подтверждения личности.",
        cta: "Продолжить →",
        terms: "Продолжая, вы соглашаетесь с нашими ",
        termsLink: "Условиями обслуживания",
        and: " и ",
        privLink: "Политикой конфиденциальности",
    },
    hi: {
        appName: "CareConnect Israel",
        tagline: "इज़राइल में आपका सहायक साथी।",
        phone: "फ़ोन",
        email: "ईमेल",
        phoneLabel: "फ़ोन नंबर",
        emailLabel: "ईमेल",
        emailPh: "account@example.com",
        hint: "आपकी पहचान की पुष्टि के लिए हम एक सुरक्षित कोड भेजेंगे। पासवर्ड की ज़रूरत नहीं।",
        cta: "जारी रखें →",
        terms: "जारी रखकर आप हमारी ",
        termsLink: "सेवा की शर्तों",
        and: " और ",
        privLink: "गोपनीयता नीति",
    },
    ta: {
        appName: "CareConnect Israel",
        tagline: "இஸ்ரேலில் உங்கள் துணை.",
        phone: "தொலைபேசி",
        email: "மின்னஞ்சல்",
        phoneLabel: "தொலைபேசி எண்",
        emailLabel: "மின்னஞ்சல்",
        emailPh: "account@example.com",
        hint: "நீங்கள் தான் என்பதை உறுதிப்படுத்த பாதுகாப்பான குறியீட்டை அனுப்புவோம். கடவுச்சொல் தேவையில்லை.",
        cta: "தொடரவும் →",
        terms: "தொடர்வதன் மூலம், எங்கள் ",
        termsLink: "சேவை விதிமுறைகள்",
        and: " மற்றும் ",
        privLink: "தனியுரிமைக் கொள்கை",
    },
};

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function LoginScreen({ navigation }: Props) {
    const { lang: globalLang, setLang: setGlobalLang, signIn, dark, setAppearance } = useApp();
    const [lang, setLang] = React.useState<string>(globalLang);
    const [tab, setTab] = React.useState<"phone" | "email">("phone");
    // What was typed in each tab, kept when switching between Phone and Email.
    const [typed, setTyped] = React.useState({ phone: "", email: "" });
    const value = typed[tab];
    const setValue = (v: string) => setTyped((prev) => ({ ...prev, [tab]: v }));
    const [showLangs, setShowLangs] = React.useState(false);
    // "id" = enter phone/email, "code" = enter the code we sent
    const [step, setStep] = React.useState<"id" | "code">("id");
    const [code, setCode] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    // Set when the server runs in test mode (same code for everyone).
    const [testCode, setTestCode] = React.useState<string | null>(null);
    // Where a real code is sent too (then either one works).
    const [realCodes, setRealCodes] = React.useState({ phone: false, email: false });

    React.useEffect(() => {
        getAuthOptions().then((o) => {
            setTestCode(o.testCode);
            if (o.realCodes) setRealCodes(o.realCodes);
        }).catch(() => {});
    }, []);
    const t = T[lang];
    const b = BOT_T[lang as LangCode];
    const m = MENU_T[lang as LangCode];
    const currentLang = LANGUAGES.find(l => l.code === lang)!;

    const identifier = (): Identifier =>
        tab === "phone" ? { phone: value.trim() } : { email: value.trim() };

    const errorText = (err: any) => {
        const byCode: Record<string, string> = {
            invalid: step === "code" ? b.errInvalidCode : b.errInvalidId,
            expired: b.errExpired,
            locked: b.errLocked,
            wait: b.errWait,
            unavailable: b.errUnavailable,
        };
        return byCode[err?.code] ?? (err?.status ? err.message : b.errNetwork);
    };

    const finish = async (res: SignInResponse) => {
        // App.tsx shows the app screens as soon as a user is signed in.
        await signIn(res.token, res.user);
    };

    const handleContinue = async () => {
        if (!value.trim() || busy) return;
        setBusy(true);
        setError(null);
        try {
            const res = await requestCode(identifier());
            if ("token" in res) return await finish(res);   // demo number: no code needed
            setCode("");
            setStep("code");
        } catch (err: any) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    const handleVerify = async () => {
        if (code.trim().length < 6 || busy) return;
        setBusy(true);
        setError(null);
        try {
            await finish(await verifyCode(identifier(), code.trim()));
        } catch (err: any) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    const sentTo = tab === "phone" ? phoneForDisplay(value) : value.trim();

    // Back from the code to the phone / email, which stays as typed so it can be corrected.
    const backToId = () => {
        setStep("id");
        setCode("");
        setError(null);
    };
    // The phone's own back button (Android) does the same on the code step.
    React.useEffect(() => {
        if (step !== "code") return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            backToId();
            return true;
        });
        return () => sub.remove();
    }, [step]);

    return (
        <KeyboardAvoidingView
            style={s.root}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {/* ── Hero image area ── */}
            <View style={s.hero}>
                <View style={s.heroPlaceholder}>
                    <Text style={s.heroText}>🤝</Text>
                </View>

                {/* Light / dark switch — top left. Shows the look it switches to;
                    "Same as phone" is in Menu → Settings → Appearance. */}
                <Pressable
                    style={s.themePill}
                    onPress={() => setAppearance(dark ? "light" : "dark")}
                    accessibilityRole="button"
                    accessibilityLabel={`${m.appearanceTitle}: ${dark ? m.appearanceLight : m.appearanceDark}`}
                >
                    <Text style={s.langPillText}>
                        {dark ? `☀️ ${m.appearanceLight}` : `🌙 ${m.appearanceDark}`}
                    </Text>
                </Pressable>

                {/* Language picker pill — top right */}
                <Pressable style={s.langPill} onPress={() => setShowLangs(v => !v)}>
                    <Text style={s.langPillText}>{currentLang.nativeLabel} ▾</Text>
                </Pressable>

                {/* Language dropdown: in a Modal so it shows above the whole page,
                    not cut off by the banner; tapping outside closes it. */}
                <Modal visible={showLangs} transparent animationType="fade" onRequestClose={() => setShowLangs(false)}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowLangs(false)} />
                    <View style={s.langDropdown}>
                        {LANGUAGES.map(l => (
                            <Pressable
                                key={l.code}
                                style={[s.langOption, l.code === lang && s.langOptionActive]}
                                onPress={() => {
                                    setLang(l.code);
                                    setGlobalLang(l.code as LangCode);
                                    setShowLangs(false);
                                }}
                            >
                                <Text style={[s.langOptionText, l.code === lang && s.langOptionTextActive]}>
                                    {l.nativeLabel}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Modal>
            </View>

            {/* ── Card ── */}
            <ScrollView
                style={s.card}
                contentContainerStyle={s.cardContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* App name & tagline */}
                <Text style={s.appName}>{t.appName}</Text>
                <Text style={s.tagline}>{t.tagline}</Text>

                {step === "id" ? (
                    <>
                        {/* Phone / Email tab */}
                        <View style={s.tabs}>
                            <Pressable
                                style={[s.tab, tab === "phone" && s.tabActive]}
                                onPress={() => { setTab("phone"); setError(null); }}
                            >
                                <Text style={[s.tabText, tab === "phone" && s.tabTextActive]}>
                                    {t.phone}
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[s.tab, tab === "email" && s.tabActive]}
                                onPress={() => { setTab("email"); setError(null); }}
                            >
                                <Text style={[s.tabText, tab === "email" && s.tabTextActive]}>
                                    {t.email}
                                </Text>
                            </Pressable>
                        </View>

                        {/* Input label */}
                        <Text style={s.inputLabel}>
                            {tab === "phone" ? t.phoneLabel : t.emailLabel}
                        </Text>

                        {/* Input row */}
                        <View style={s.inputRow}>
                            {tab === "phone" ? (
                                // Country codes to choose from (+972, +63, +91…); any other can be typed.
                                <PhoneInput
                                    style={s.input}
                                    lang={lang as LangCode}
                                    placeholderTextColor={Color.silver}
                                    value={value}
                                    onChangeText={(v) => { setValue(v); setError(null); }}
                                    onSubmitEditing={handleContinue}
                                />
                            ) : (
                                // Offers @gmail.com, @campus.haifa.ac.il… while typing; still free text.
                                <EmailInput
                                    style={s.input}
                                    placeholder={t.emailPh}
                                    placeholderTextColor={Color.silver}
                                    value={value}
                                    onChangeText={(v) => { setValue(v); setError(null); }}
                                    onSubmitEditing={handleContinue}
                                />
                            )}
                        </View>

                        {/* Hint */}
                        <View style={s.hintRow}>
                            <Text style={s.hintIcon}>ℹ</Text>
                            <Text style={s.hintText}>{t.hint}</Text>
                        </View>
                    </>
                ) : (
                    <>
                        {/* Back to the phone / email, e.g. to fix a typing mistake */}
                        <Pressable style={s.backBtn} onPress={backToId} accessibilityRole="button">
                            <Text style={s.backBtnText}>‹ {PAGE_T[lang as LangCode].back}</Text>
                        </Pressable>
                        <Text style={s.hintText}>{b.codeSent.replace("{to}", sentTo)}</Text>
                        <Text style={s.inputLabel}>{b.codeLabel}</Text>
                        <TextInput
                            style={[s.input, s.codeInput]}
                            placeholder="••••••"
                            placeholderTextColor={Color.silver}
                            keyboardType="number-pad"
                            autoComplete="one-time-code"
                            textContentType="oneTimeCode"
                            maxLength={6}
                            value={code}
                            onChangeText={(v) => { setCode(v.replace(/\D/g, "")); setError(null); }}
                            onSubmitEditing={handleVerify}
                            autoFocus
                        />
                        {testCode && (
                            <View style={s.testBox}>
                                <Text style={s.testText}>
                                    🧪 {(realCodes[tab] ? b.testModeHintAlso : b.testModeHint).replace("{code}", testCode)}
                                </Text>
                            </View>
                        )}
                        <Pressable onPress={handleContinue} hitSlop={8} disabled={busy}>
                            <Text style={[s.linkText, { textAlign: "center" }]}>{b.resend}</Text>
                        </Pressable>
                    </>
                )}

                {/* Data is tied to the phone/email used */}
                <View style={s.noteBox}>
                    <Text style={s.noteText}>🔑 {b.sameMethodNote}</Text>
                </View>

                {error && (
                    <View style={s.errorBox}>
                        <Text style={s.errorText}>⚠ {error}</Text>
                    </View>
                )}

                {/* CTA button */}
                {step === "id" ? (
                    <Pressable
                        style={[s.ctaBtn, (!value.trim() || busy) && s.ctaBtnDisabled]}
                        onPress={handleContinue}
                        disabled={!value.trim() || busy}
                    >
                        {busy ? <ActivityIndicator color={Color.white} /> : <Text style={s.ctaText}>{t.cta}</Text>}
                    </Pressable>
                ) : (
                    <Pressable
                        style={[s.ctaBtn, (code.length < 6 || busy) && s.ctaBtnDisabled]}
                        onPress={handleVerify}
                        disabled={code.length < 6 || busy}
                    >
                        {busy ? <ActivityIndicator color={Color.white} /> : <Text style={s.ctaText}>{b.signIn}</Text>}
                    </Pressable>
                )}


                {/* Terms */}
                <Text style={s.terms}>
                    {t.terms}
                    <Text style={s.termsLink}>{t.termsLink}</Text>
                    {t.and}
                    <Text style={s.termsLink}>{t.privLink}</Text>
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ════════════════════════════════════════════════════════════════════
const s = themedStyles({
    root: { flex: 1, backgroundColor: Color.aliceBlue },

    // Hero
    hero: {
        height: 200,
        backgroundColor: "#d4a976",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    heroPlaceholder: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    heroText: { fontSize: 40 },

    // Language pill
    langPill: {
        position: "absolute",
        top: 52, right: 16,
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    langPillText: { fontSize: 13, fontWeight: "600", color: Color.blackPearl },
    themePill: {
        position: "absolute",
        top: 52, left: 16,
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },

    // Language dropdown
    langDropdown: {
        position: "absolute",
        top: 88, right: 16,
        backgroundColor: Color.white,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 150,
        zIndex: 99,
    },
    langOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: Color.linkWater,
    },
    langOptionActive: { backgroundColor: Color.aliceBlue },
    langOptionText: { fontSize: 14, color: Color.mako },
    langOptionTextActive: { color: Color.endeavour, fontWeight: "700" },

    // Card
    card: { flex: 1 },
    cardContent: {
        backgroundColor: Color.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
        paddingHorizontal: 24,
        paddingTop: 44,
        paddingBottom: 40,
        gap: 16,
    },

    // App name
    appName: {
        fontSize: 24,
        fontWeight: "700",
        color: Color.endeavour,
        textAlign: "center",
    },
    tagline: {
        fontSize: 14,
        color: Color.mako,
        textAlign: "center",
        marginBottom: 8,
    },

    // Tabs
    tabs: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderRadius: 8,
        overflow: "hidden",
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        backgroundColor: Color.lightGray,
    },
    tabActive: { backgroundColor: Color.white },
    tabText: { fontSize: 14, color: Color.mako },
    tabTextActive: { color: Color.blackPearl, fontWeight: "600" },

    // Input
    inputLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: Color.blackPearl,
        marginBottom: -8,
    },
    inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 14,
        color: Color.blackPearl,
        backgroundColor: Color.white,
    },

    // Hint
    hintRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    hintIcon: { fontSize: 14, color: Color.endeavour, marginTop: 1 },
    hintText: { flex: 1, fontSize: 12, color: Color.mako, lineHeight: 18 },

    // CTA
    ctaBtn: {
        backgroundColor: Color.endeavour,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 4,
    },
    ctaBtnDisabled: { opacity: 0.5 },
    ctaText: { fontSize: 16, fontWeight: "700", color: Color.white },

    // Code step
    // Like the "‹ Back" of the home pages: a clear, finger-sized button.
    backBtn: {
        alignSelf: "flex-start",
        backgroundColor: Color.white,
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 14,
    },
    backBtnText: { color: Color.endeavour, fontSize: 15, fontWeight: "700" },
    linkText: { fontSize: 13, color: Color.endeavour, fontWeight: "600" },
    codeInput: { flex: 0, fontSize: 22, letterSpacing: 8, textAlign: "center" },

    testBox: { backgroundColor: "#fff8e1", borderRadius: 8, padding: 10 },
    testText: { fontSize: 13, color: "#8d6e00", fontWeight: "600", textAlign: "center" },

    // Notes & errors
    noteBox: { backgroundColor: Color.aliceBlue, borderRadius: 8, padding: 12 },
    noteText: { fontSize: 12, color: Color.blackPearl, lineHeight: 18 },
    errorBox: { backgroundColor: "#ffebee", borderRadius: 8, padding: 12 },
    errorText: { fontSize: 13, color: Color.error },

    // Terms
    terms: {
        fontSize: 11,
        color: Color.mako,
        textAlign: "center",
        lineHeight: 17,
    },
    termsLink: { color: Color.endeavour, textDecorationLine: "underline" },
});