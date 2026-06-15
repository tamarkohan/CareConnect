import * as React from "react";
import {
    ScrollView,
    Text,
    StyleSheet,
    View,
    Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
const TOOLS = [
    { id: "1", label: "Arrival Guides", emoji: "▶" },
    { id: "2", label: "Safety & Shelters", emoji: "⚠" },
    { id: "3", label: "Migration Support", emoji: "🌐" },
    { id: "4", label: "PIBA Application", emoji: "✦" },
    { id: "5", label: "Public Transportation Use", emoji: "🚌" },
    { id: "6", label: "Remittance Applications", emoji: "💲" },
    { id: "7", label: "FAQs for Caring\nfor Elderly Clients", emoji: "📍" },
    { id: "8", label: "About US", emoji: "ℹ" },
];

// ── Bottom nav items ─────────────────────────────────────────────────
const NAV_ITEMS = [
    { label: "Home", emoji: "🏠", active: true, screen: "Home" },
    { label: "Translator", emoji: "🔤", active: false, screen: "Translator" },
    { label: "Assistant", emoji: "⚖", active: false, screen: "Assistant" },
    { label: "Community", emoji: "👥", active: false, screen: "Community" },
    { label: "Tasks", emoji: "📋", active: false, screen: "Tasks" },
    { label: "Journal", emoji: "♡", active: false, screen: "Journal" },
];

// ════════════════════════════════════════════════════════════════════
export default function HomeDashboard({ navigation }: any) {
    const insets = useSafeAreaInsets(); // <── Medimos los bordes físicos reales del teléfono

    return (
        // CAMBIO CLAVE: Cambiamos SafeAreaView por un View normal controlado manualmente.
        // insets.top evita que la barra superior choque con la cámara o el notch.
        <View style={[s.root, { paddingTop: insets.top }]}>

            {/* ── Top app bar ── */}
            <View style={s.topBar}>
                <Pressable style={s.menuBtn}>
                    <Text style={s.menuIcon}>☰</Text>
                </Pressable>
                <Text style={s.appTitle}>CareConnect Israel</Text>
                <Pressable style={s.globeBtn}>
                    <Text style={s.globeIcon}>🌐</Text>
                </Pressable>
            </View>

            {/* ── Scrollable content ── */}
            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Greeting */}
                <Text style={s.greeting}>Good morning, Rohit</Text>

                {/* Weather pill */}
                <View style={s.weatherPill}>
                    <Text style={s.weatherText}>☀  Haifa, 24°C</Text>
                </View>

                {/* Word of the Day card */}
                <View style={s.wordCard}>
                    <View style={s.wordHeader}>
                        <View style={s.wordHeaderLeft}>
                            <Text style={s.wordIcon}>🔤</Text>
                            <Text style={s.wordLabel}>WORD OF THE DAY</Text>
                        </View>
                        <Text style={s.speakerIcon}>🔊</Text>
                    </View>
                    <View style={s.wordBody}>
                        <Text style={s.hebrewWord}>תודה</Text>
                        <Text style={s.phonetic}> / Toda /</Text>
                    </View>
                    <Text style={s.translation}>Thank you</Text>
                </View>

                {/* Essential Tools heading */}
                <Text style={s.sectionTitle}>Essential Tools</Text>

                {/* My Agency – full-width CTA */}
                <Pressable style={s.agencyBtn} onPress={() => { }}>
                    <Text style={s.agencyIcon}>📞</Text>
                    <Text style={s.agencyLabel}>My Agency</Text>
                </Pressable>

                {/* 2-column tool grid */}
                <View style={s.grid}>
                    {TOOLS.map((tool, i) => (
                        <Pressable key={tool.id} style={s.toolCard} onPress={() => { }}>
                            <Text style={s.toolEmoji}>{tool.emoji}</Text>
                            <Text style={s.toolLabel}>{tool.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>

            {/* ── Bottom navigation ── */}
            {/* CAMBIO CLAVE: Si el Huawei tiene barra de botones, insets.bottom valdrá aprox. 48.
                Le sumamos tus 12 de diseño original para despegar los íconos de forma perfecta. */}
            <View style={[s.bottomNav, { paddingBottom: 12 + insets.bottom }]}>
                {NAV_ITEMS.map((item) => (
                    <Pressable
                        key={item.label}
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
                            {item.label}
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

    // Top bar
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Color.aliceBlue,
        borderBottomWidth: 1,
        borderBottomColor: Color.linkWater,
    },
    menuBtn: { padding: 4 },
    menuIcon: { fontSize: 20, color: Color.blackPearl },
    appTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Color.endeavour,
    },
    globeBtn: { padding: 4 },
    globeIcon: { fontSize: 20 },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40, // Reducido un poco para que combine mejor con el nuevo espacio dinámico inferior
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

    // Word of the Day
    wordCard: {
        backgroundColor: Color.creamBrulee,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.goldenrod,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 14,
        gap: 6,
    },
    wordHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    wordHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
    wordIcon: { fontSize: 16 },
    wordLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: Color.cinnamon,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    speakerIcon: { fontSize: 16 },
    wordBody: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
    hebrewWord: {
        fontSize: 32,
        fontWeight: "700",
        color: Color.cinnamon,
    },
    phonetic: {
        fontSize: 18,
        fontStyle: "italic",
        color: "rgba(119,88,0,0.8)",
        paddingBottom: 4,
    },
    translation: {
        fontSize: 16,
        fontWeight: "500",
        color: Color.cinnamon,
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
        fontSize: 16,
        fontWeight: "700",
        color: Color.white,
    },

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