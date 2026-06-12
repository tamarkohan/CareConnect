import * as React from "react";
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
} from "react-native";

// ── Tokens ───────────────────────────────────────────────────────────
const Color = {
    aliceBlue: "#f3faff",
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    silver: "#c1c6d4",
    error: "#ba1a1a",
    lightGray: "#f5f5f5",
};

// ── Supported languages ──────────────────────────────────────────────
const LANGUAGES = [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "tl", label: "Tagalog", nativeLabel: "Tagalog" },
    { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
    { code: "ru", label: "Russian", nativeLabel: "Русский" },
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
        phonePh: "50-123-4567",
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
        phonePh: "50-123-4567",
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
        phonePh: "50-123-4567",
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
        phonePh: "50-123-4567",
        emailPh: "account@example.com",
        hint: "Мы отправим вам код безопасности для подтверждения личности.",
        cta: "Продолжить →",
        terms: "Продолжая, вы соглашаетесь с нашими ",
        termsLink: "Условиями обслуживания",
        and: " и ",
        privLink: "Политикой конфиденциальности",
    },
};

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function LoginScreen({ navigation }: Props) {
    const [lang, setLang] = React.useState("en");
    const [tab, setTab] = React.useState<"phone" | "email">("phone");
    const [value, setValue] = React.useState("");
    const [showLangs, setShowLangs] = React.useState(false);

    const t = T[lang];
    const currentLang = LANGUAGES.find(l => l.code === lang)!;

    const handleContinue = () => {
        if (!value.trim()) return;
        // Navigate to home after login (swap with OTP screen later)
        navigation?.navigate("Home");
    };

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

                {/* Language picker pill — top right */}
                <Pressable style={s.langPill} onPress={() => setShowLangs(v => !v)}>
                    <Text style={s.langPillText}>{currentLang.nativeLabel} ▾</Text>
                </Pressable>

                {/* Language dropdown */}
                {showLangs && (
                    <View style={s.langDropdown}>
                        {LANGUAGES.map(l => (
                            <Pressable
                                key={l.code}
                                style={[s.langOption, l.code === lang && s.langOptionActive]}
                                onPress={() => { setLang(l.code); setShowLangs(false); setValue(""); }}
                            >
                                <Text style={[s.langOptionText, l.code === lang && s.langOptionTextActive]}>
                                    {l.nativeLabel}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}
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

                {/* Phone / Email tab */}
                <View style={s.tabs}>
                    <Pressable
                        style={[s.tab, tab === "phone" && s.tabActive]}
                        onPress={() => { setTab("phone"); setValue(""); }}
                    >
                        <Text style={[s.tabText, tab === "phone" && s.tabTextActive]}>
                            {t.phone}
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[s.tab, tab === "email" && s.tabActive]}
                        onPress={() => { setTab("email"); setValue(""); }}
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
                    {tab === "phone" && (
                        <View style={s.countryCode}>
                            <Text style={s.countryCodeText}>+972</Text>
                        </View>
                    )}
                    <TextInput
                        style={[s.input, tab === "phone" && s.inputWithCode]}
                        placeholder={tab === "phone" ? t.phonePh : t.emailPh}
                        placeholderTextColor={Color.silver}
                        keyboardType={tab === "phone" ? "phone-pad" : "email-address"}
                        autoCapitalize="none"
                        value={value}
                        onChangeText={setValue}
                    />
                </View>

                {/* Hint */}
                <View style={s.hintRow}>
                    <Text style={s.hintIcon}>ℹ</Text>
                    <Text style={s.hintText}>{t.hint}</Text>
                </View>

                {/* CTA button */}
                <Pressable
                    style={[s.ctaBtn, !value.trim() && s.ctaBtnDisabled]}
                    onPress={handleContinue}
                >
                    <Text style={s.ctaText}>{t.cta}</Text>
                </Pressable>

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
const s = StyleSheet.create({
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
        top: 16, right: 16,
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    langPillText: { fontSize: 13, fontWeight: "600", color: Color.blackPearl },

    // Language dropdown
    langDropdown: {
        position: "absolute",
        top: 50, right: 16,
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
        paddingTop: 32,
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
    countryCode: {
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 13,
        backgroundColor: Color.lightGray,
    },
    countryCodeText: { fontSize: 14, color: Color.blackPearl, fontWeight: "600" },
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
    inputWithCode: { flex: 1 },

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

    // Terms
    terms: {
        fontSize: 11,
        color: Color.mako,
        textAlign: "center",
        lineHeight: 17,
    },
    termsLink: { color: Color.endeavour, textDecorationLine: "underline" },
});