import * as React from "react";
import {
    ScrollView,
    Text,
    StyleSheet,
    View,
    Pressable,
    Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { useLang } from "../AppContext";
import { T } from "../translations";

// ── Colour & style tokens (from your GlobalStyles) ──────────────────
const Color = {
    aliceBlue: "#f3faff",
    blackPearl: "#071e27",
    cinnamon: "#775800",
    creamBrulee: "#ffdfa0",
    goldenrod: "#f8bd2a",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    silver: "rgba(193,198,212,0.3)",
};

// ── Tool card data ───────────────────────────────────────────────────
// Each card opens its page: InfoScreen shows the content in infoPages.ts.
const TOOLS = [
    { id: "1", labelKey: "arrivalGuides" as const, emoji: "▶", screen: "Info", params: { page: "arrival" } },
    { id: "2", labelKey: "safetyShelters" as const, emoji: "⚠", screen: "Info", params: { page: "safety" } },
    { id: "3", labelKey: "migrationSupport" as const, emoji: "🌐", screen: "Info", params: { page: "migration" } },
    { id: "4", labelKey: "payslips" as const, emoji: "🧾", screen: "Payslips" },
    { id: "5", labelKey: "publicTransport" as const, emoji: "🚌", screen: "Info", params: { page: "transport" } },
    { id: "6", labelKey: "remittanceApps" as const, emoji: "💲", screen: "Remittance" },
    { id: "7", labelKey: "faqElderly" as const, emoji: "📍", screen: "Info", params: { page: "faq" } },
    { id: "8", labelKey: "aboutUs" as const, emoji: "ℹ", screen: "Info", params: { page: "about" } },
];

// Tapping one calls the number directly. All numbers are on the agency page.
const EMERGENCY = [
    { number: "101", emoji: "🚑", label: { en: "Ambulance", tl: "Ambulansya", ml: "ആംബുലൻസ്", ru: "Скорая" } },
    { number: "100", emoji: "👮", label: { en: "Police", tl: "Pulis", ml: "പോലീസ്", ru: "Полиция" } },
    { number: "102", emoji: "🚒", label: { en: "Fire", tl: "Bumbero", ml: "അഗ്നിശമനം", ru: "Пожарные" } },
] as const;

// ── Bottom nav items ─────────────────────────────────────────────────
const NAV_ITEMS = [
    { labelKey: "navHome" as const, emoji: "🏠", active: true, screen: "Home" },
    { labelKey: "navTranslator" as const, emoji: "🔤", active: false, screen: "Translator" },
    { labelKey: "navAssistant" as const, emoji: "⚖️", active: false, screen: "Assistant" },
    { labelKey: "navCommunity" as const, emoji: "👥", active: false, screen: "Community" },
    { labelKey: "navTasks" as const, emoji: "📋", active: false, screen: "Tasks" },
    { labelKey: "navJournal" as const, emoji: "📓", active: false, screen: "Journal" },
];

// ════════════════════════════════════════════════════════════════════
export default function HomeDashboard({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const { lang } = useLang();
    const t = T[lang];

    return (
        <View style={[s.root, { paddingTop: insets.top }]}>

            {/* ── Top app bar (with working hamburger + language picker) ── */}
            <TopBar title={t.appTitle} navigation={navigation} />

            {/* ── Scrollable content ── */}
            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Greeting */}
                <Text style={s.greeting}>{t.goodMorning}</Text>

                {/* Weather pill */}
                <View style={s.weatherPill}>
                    <Text style={s.weatherText}>☀  Haifa, 24°C</Text>
                </View>

                {/* Word of the Day – one compact row */}
                <View style={s.wordCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={s.wordLabel}>🔤 {t.wordOfDay}</Text>
                        <Text style={s.translation}>{t.thankYou}</Text>
                    </View>
                    <View style={s.wordBody}>
                        <Text style={s.hebrewWord}>תודה</Text>
                        <Text style={s.phonetic}>Toda</Text>
                    </View>
                    <Text style={s.speakerIcon}>🔊</Text>
                </View>

                {/* Essential Tools heading */}
                <Text style={s.sectionTitle}>{t.essentialTools}</Text>

                {/* My Agency + one-tap emergency calls */}
                <Pressable style={s.agencyBtn} onPress={() => navigation.navigate("Info", { page: "agency" })}>
                    <Text style={s.agencyIcon}>🏢</Text>
                    <Text style={s.agencyLabel}>{t.myAgency}</Text>
                    <Text style={s.agencyArrow}>›</Text>
                </Pressable>
                <View style={s.emergencyRow}>
                    {EMERGENCY.map((e) => (
                        <Pressable
                            key={e.number}
                            style={s.emergencyBtn}
                            onPress={() => Linking.openURL(`tel:${e.number}`)}
                            accessibilityRole="button"
                            accessibilityLabel={`${e.label[lang]} ${e.number}`}
                        >
                            <Text style={s.emergencyEmoji}>{e.emoji}</Text>
                            <Text style={s.emergencyNumber}>{e.number}</Text>
                            <Text style={s.emergencyLabel} numberOfLines={1}>{e.label[lang]}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* 2-column tool grid */}
                <View style={s.grid}>
                    {TOOLS.map((tool) => (
                        <Pressable key={tool.id} style={s.toolCard} onPress={() => navigation.navigate(tool.screen, tool.params)}>
                            <Text style={s.toolEmoji}>{tool.emoji}</Text>
                            <Text style={s.toolLabel}>{t[tool.labelKey]}</Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>

            {/* ── Bottom navigation ── */}
            <View style={[s.bottomNav, { paddingBottom: 12 + insets.bottom }]}>
                {NAV_ITEMS.map((item) => (
                    <Pressable
                        key={item.labelKey}
                        style={s.navItem}
                        onPress={() => {
                            if (item.screen && item.screen !== "Home") {
                                navigation?.navigate(item.screen);
                            }
                        }}
                    >
                        <Text style={[s.navEmoji, item.active && s.navEmojiActive]}>
                            {item.emoji}
                        </Text>
                        <Text style={[s.navLabel, item.active && s.navLabelActive]}>
                            {t[item.labelKey]}
                        </Text>
                    </Pressable>
                ))}
            </View>

        </View>
    );
}

// ════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Color.aliceBlue,
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
        gap: 16,
    },

    // Greeting
    greeting: {
        fontSize: 24,
        fontWeight: "700",
        color: Color.blackPearl,
    },

    // Weather pill
    weatherPill: {
        alignSelf: "flex-start",
        backgroundColor: Color.linkWater,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: Color.silver,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    weatherText: {
        fontSize: 14,
        fontWeight: "500",
        color: Color.blackPearl,
    },

    // Word of the Day (compact)
    wordCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: Color.creamBrulee,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.goldenrod,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    wordLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: Color.cinnamon,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    speakerIcon: { fontSize: 16 },
    wordBody: { alignItems: "flex-end" },
    hebrewWord: {
        fontSize: 22,
        fontWeight: "700",
        color: Color.cinnamon,
    },
    phonetic: {
        fontSize: 13,
        fontStyle: "italic",
        color: "rgba(119,88,0,0.8)",
    },
    translation: {
        fontSize: 15,
        fontWeight: "600",
        color: Color.cinnamon,
        marginTop: 2,
    },

    // Section title
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Color.blackPearl,
        marginTop: 4,
    },

    // My Agency button
    agencyBtn: {
        backgroundColor: Color.endeavour,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 18,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    agencyIcon: { fontSize: 20 },
    agencyLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: "700",
        color: Color.white,
    },
    agencyArrow: { fontSize: 24, color: Color.white, fontWeight: "300" },

    // Emergency call buttons
    emergencyRow: { flexDirection: "row", gap: 10, marginTop: -4 },
    emergencyBtn: {
        flex: 1,
        alignItems: "center",
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#f3c4c4",
        paddingVertical: 10,
        gap: 2,
    },
    emergencyEmoji: { fontSize: 20 },
    emergencyNumber: { fontSize: 20, fontWeight: "800", color: "#c62828" },
    emergencyLabel: { fontSize: 12, fontWeight: "600", color: Color.mako },

    // Tool grid
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    toolCard: {
        width: "47%",
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.linkWater,
        padding: 14,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    toolEmoji: { fontSize: 24 },
    toolLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: Color.blackPearl,
        lineHeight: 18,
    },

    // Bottom nav
    bottomNav: {
        flexDirection: "row",
        backgroundColor: Color.aliceBlue,
        borderTopWidth: 1,
        borderTopColor: Color.linkWater,
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    navItem: {
        flex: 1,
        alignItems: "center",
        gap: 2,
    },
    navEmoji: { fontSize: 20 },
    navEmojiActive: { color: Color.endeavour },
    navLabel: {
        fontSize: 10,
        color: Color.mako,
    },
    navLabelActive: {
        color: Color.endeavour,
        fontWeight: "600",
    },
});