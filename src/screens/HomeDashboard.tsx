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

// Tapping one calls the number directly. Kept in number order (100, 101, 102).
// All numbers are on the agency page.
const EMERGENCY = [
    { number: "100", emoji: "👮", label: { en: "Police", tl: "Pulis", ml: "പോലീസ്", ru: "Полиция" } },
    { number: "101", emoji: "🚑", label: { en: "Ambulance", tl: "Ambulansya", ml: "ആംബുലൻസ്", ru: "Скорая" } },
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
                {/* Top: greeting + weather (left), word of the day square (right) */}
                <View style={s.topRow}>
                    <View style={s.greetingCol}>
                        <Text style={s.greeting}>{t.goodMorning}</Text>
                        <View style={s.weatherPill}>
                            <Text style={s.weatherText}>☀  Haifa, 24°C</Text>
                        </View>
                    </View>
                    <View style={s.wordCard}>
                        <Text style={s.wordLabel} numberOfLines={2}>{t.wordOfDay}</Text>
                        <Text style={s.hebrewWord}>תודה</Text>
                        <Text style={s.phonetic}>Toda</Text>
                        <Text style={s.translation} numberOfLines={1}>{t.thankYou}</Text>
                        <Text style={s.speakerIcon}>🔊</Text>
                    </View>
                </View>

                {/* Essential Tools heading */}
                <Text style={s.sectionTitle}>{t.essentialTools}</Text>

                {/* Quick row: My Agency + one-tap emergency calls */}
                <View style={s.quickRow}>
                    <Pressable
                        style={[s.quickBtn, s.agencyBtn]}
                        onPress={() => navigation.navigate("Info", { page: "agency" })}
                        accessibilityRole="button"
                    >
                        <Text style={s.quickEmoji}>🏢</Text>
                        <Text style={s.agencyLabel} numberOfLines={2}>{t.myAgency}</Text>
                    </Pressable>
                    {EMERGENCY.map((e) => (
                        <Pressable
                            key={e.number}
                            style={[s.quickBtn, s.emergencyBtn]}
                            onPress={() => Linking.openURL(`tel:${e.number}`)}
                            accessibilityRole="button"
                            accessibilityLabel={`${e.label[lang]} ${e.number}`}
                        >
                            <Text style={s.quickEmoji}>{e.emoji}</Text>
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
                        style={[s.navItem, item.active && s.navItemActive]}
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
        // On a laptop the page stays phone-width in the middle instead of
        // stretching the buttons across the whole screen.
        width: "100%",
        maxWidth: 640,
        alignSelf: "center",
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
        gap: 16,
    },

    // Top row
    topRow: { flexDirection: "row", alignItems: "stretch", gap: 12 },
    greetingCol: { flex: 1, justifyContent: "flex-start", gap: 10 },
    greeting: {
        fontSize: 24,
        fontWeight: "700",
        color: Color.blackPearl,
        lineHeight: 28,
        marginTop: -2,   // line the top of the text up with the word-of-the-day card
    },
    weatherPill: {
        alignSelf: "flex-start",
        backgroundColor: Color.linkWater,
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    weatherText: {
        fontSize: 13,
        fontWeight: "500",
        color: Color.blackPearl,
    },

    // Word of the Day (square)
    wordCard: {
        width: 118,
        aspectRatio: 1,
        backgroundColor: Color.creamBrulee,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Color.goldenrod,
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
    },
    wordLabel: {
        fontSize: 9,
        fontWeight: "700",
        color: Color.cinnamon,
        textTransform: "uppercase",
        letterSpacing: 0.4,
        textAlign: "center",
    },
    hebrewWord: { fontSize: 26, fontWeight: "700", color: Color.cinnamon, marginTop: 2 },
    phonetic: { fontSize: 12, fontStyle: "italic", color: "rgba(119,88,0,0.8)" },
    translation: { fontSize: 13, fontWeight: "600", color: Color.cinnamon },
    speakerIcon: { position: "absolute", bottom: 6, right: 8, fontSize: 12 },

    // Section title
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Color.blackPearl,
        marginTop: 4,
    },

    // Quick row (agency + emergency numbers): 4 equal small buttons
    quickRow: { flexDirection: "row", gap: 8 },
    quickBtn: {
        flex: 1,
        height: 88,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        gap: 2,
    },
    quickEmoji: { fontSize: 20 },
    agencyBtn: { backgroundColor: Color.white, borderWidth: 1, borderColor: Color.linkWater },
    agencyLabel: { fontSize: 12, fontWeight: "700", color: Color.endeavour, textAlign: "center" },
    emergencyBtn: { backgroundColor: Color.white, borderWidth: 1, borderColor: "#f3c4c4" },
    emergencyNumber: { fontSize: 18, fontWeight: "800", color: "#c62828" },
    emergencyLabel: { fontSize: 11, fontWeight: "600", color: Color.mako },

    // Tool grid
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    toolCard: {
        // Two columns that always fill the row exactly (any screen width).
        flexBasis: "40%",
        flexGrow: 1,
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
        paddingVertical: 4,
        marginHorizontal: 2,
    },
    navEmoji: { fontSize: 20 },
    // The current screen gets a shaded pill, so it's clear where you are.
    navItemActive: { backgroundColor: "#dcebf7", borderRadius: 12 },
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