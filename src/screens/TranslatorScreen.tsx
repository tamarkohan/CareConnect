import * as React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// ── Tokens ───────────────────────────────────────────────────────────
const Color = {
    aliceBlue: "#f3faff",
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    silver: "#c1c6d4",

    // Input mode colors
    blueMic: "#005dac",
    yellowType: "#ffdfa0",
    greenScan: "#4caf50",

    // Tag colors
    medicalBg: "#e8f5e9",
    medicalText: "#2e7d32",
    slanBg: "#fff3e0",
    slanText: "#e65100",
    transitBg: "#e3f2fd",
    transitText: "#1565c0",
};

// ── Recent translation item ──────────────────────────────────────────
type TranslationItem = {
    id: string;
    tag: string;
    tagBg: string;
    tagText: string;
    time: string;
    original: string;
    translated: string;
    note?: string;
};

const RECENT_TRANSLATIONS: TranslationItem[] = [
    {
        id: "1",
        tag: "Medical Letter / Pill Box",
        tagBg: Color.medicalBg,
        tagText: Color.medicalText,
        time: "2 hrs ago",
        original: "ליקח תרופות בחום אחרי",
        translated: "Take twice a day after meals.",
        note: undefined,
    },
    {
        id: "2",
        tag: "Israeli Slang",
        tagBg: Color.slanBg,
        tagText: Color.slanText,
        time: "Yesterday",
        original: 'הוא צפוי ספור "דיוט"',
        translated: '"He is feeling unwell/cranky today."',
        note: "(Lit: He is upside down)",
    },
    {
        id: "3",
        tag: "Transit / Location",
        tagBg: Color.transitBg,
        tagText: Color.transitText,
        time: "Mon",
        original: 'תחנת מרכזית הפקון"',
        translated: '"HaMifratz Central Station"',
        note: undefined,
    },
];

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function TranslatorScreen({ navigation }: Props) {
    return (
        <SafeAreaView style={s.root}>
            {/* ── Top bar ── */}
            <View style={s.topBar}>
                <Pressable style={s.menuBtn} onPress={() => { }}>
                    <Text style={s.menuIcon}>☰</Text>
                </Pressable>
                <Text style={s.title}>Translator</Text>
                <Pressable style={s.globeBtn} onPress={() => { }}>
                    <Text style={s.globeIcon}>🌐</Text>
                </Pressable>
            </View>

            {/* ── Content ── */}
            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Heading */}
                <Text style={s.heading}>Contextual Translator</Text>
                <Text style={s.subheading}>Made especially for you.</Text>

                {/* Info card */}
                <View style={s.infoCard}>
                    <Text style={s.infoIcon}>ℹ</Text>
                    <View style={s.infoContent}>
                        <Text style={s.infoTitle}>
                            Unlike standard apps, our AI understands context. Perfect for Israeli slang, complex medical terms and reading handwritten notes.
                        </Text>
                        <Text style={s.infoHighlight}>HIGH-QUALITY AUDIO FOR MALAYALAM, HINDI & TAGALOG</Text>
                    </View>
                </View>

                {/* Input modes */}
                <View style={s.inputModes}>
                    <Pressable style={[s.mode, s.modeMic]} onPress={() => { }}>
                        <Text style={s.modeEmoji}>🎤</Text>
                        <Text style={s.modeLabel}>Speak to Translate</Text>
                    </Pressable>
                    <Pressable style={[s.mode, s.modeType]} onPress={() => { }}>
                        <Text style={s.modeEmoji}>✏</Text>
                        <Text style={s.modeLabel}>Write in any language</Text>
                    </Pressable>
                    <Pressable style={[s.mode, s.modeScan]} onPress={() => { }}>
                        <Text style={s.modeEmoji}>📷</Text>
                        <Text style={s.modeLabel}>Scan or Take Photo</Text>
                    </Pressable>
                </View>

                {/* Recent translations */}
                <Text style={s.recentTitle}>Recent Translations</Text>
                <View style={s.recentList}>
                    {RECENT_TRANSLATIONS.map((item) => (
                        <Pressable key={item.id} style={s.recentItem} onPress={() => { }}>
                            {/* Tag */}
                            <View style={[s.tag, { backgroundColor: item.tagBg }]}>
                                <Text style={[s.tagText, { color: item.tagText }]}>
                                    {item.tag}
                                </Text>
                                <Text style={s.tagTime}>{item.time}</Text>
                            </View>

                            {/* Original text */}
                            <Text style={s.originalText}>{item.original}</Text>

                            {/* Translated text with note */}
                            <View style={s.translatedRow}>
                                <Text style={s.translatedIcon}>↪</Text>
                                <View style={s.translatedContent}>
                                    <Text style={s.translatedText}>{item.translated}</Text>
                                    {item.note && (
                                        <Text style={s.translatedNote}>{item.note}</Text>
                                    )}
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>

            {/* ── Bottom navigation ── */}
            <View style={s.bottomNav}>
                {[
                    { label: "Home", emoji: "🏠", screen: "Home" },
                    { label: "Translator", emoji: "🔤", screen: "Translator", active: true },
                    { label: "Assistant", emoji: "⚖", screen: "Assistant" },
                    { label: "Community", emoji: "👥", screen: "Community" },
                    { label: "Tasks", emoji: "📋", screen: "Tasks" },
                    { label: "Journal", emoji: "♡", screen: "Journal" },
                ].map((item) => (
                    <Pressable
                        key={item.label}
                        style={s.navItem}
                        onPress={() => {
                            if (item.screen !== "Translator") {
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
        </SafeAreaView>
    );
}

// ════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Color.aliceBlue },

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
    title: {
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
        paddingTop: 16,
        paddingBottom: 100,
        gap: 16,
    },

    // Heading
    heading: {
        fontSize: 20,
        fontWeight: "700",
        color: Color.blackPearl,
    },
    subheading: {
        fontSize: 14,
        color: Color.mako,
        marginBottom: 4,
    },

    // Info card
    infoCard: {
        backgroundColor: "#f3e5f5",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e1bee7",
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        gap: 12,
    },
    infoIcon: {
        fontSize: 20,
        color: "#7b1fa2",
        marginTop: 2,
    },
    infoContent: { flex: 1, gap: 8 },
    infoTitle: {
        fontSize: 13,
        color: "#6a1b9a",
        fontWeight: "600",
        lineHeight: 18,
    },
    infoHighlight: {
        fontSize: 11,
        color: "#6a1b9a",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    // Input modes
    inputModes: {
        flexDirection: "row",
        gap: 12,
        marginVertical: 8,
    },
    mode: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    modeMic: { backgroundColor: Color.blueMic },
    modeType: { backgroundColor: Color.yellowType },
    modeScan: { backgroundColor: Color.greenScan },
    modeEmoji: { fontSize: 24 },
    modeLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: Color.white,
        textAlign: "center",
    },

    // Recent translations
    recentTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Color.blackPearl,
        marginTop: 8,
    },
    recentList: { gap: 12 },
    recentItem: {
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.linkWater,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    // Tag
    tag: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    tagText: {
        fontSize: 11,
        fontWeight: "600",
    },
    tagTime: {
        fontSize: 10,
        color: Color.mako,
    },

    // Original text
    originalText: {
        fontSize: 14,
        fontWeight: "600",
        color: Color.blackPearl,
        lineHeight: 20,
    },

    // Translated
    translatedRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "flex-start",
    },
    translatedIcon: {
        fontSize: 14,
        color: Color.endeavour,
        marginTop: 2,
    },
    translatedContent: { flex: 1, gap: 2 },
    translatedText: {
        fontSize: 13,
        color: Color.endeavour,
        fontWeight: "500",
        lineHeight: 18,
    },
    translatedNote: {
        fontSize: 11,
        color: Color.mako,
        fontStyle: "italic",
    },

    // Bottom nav
    bottomNav: {
        flexDirection: "row",
        backgroundColor: Color.aliceBlue,
        borderTopWidth: 1,
        borderTopColor: Color.linkWater,
        paddingTop: 8,
        paddingBottom: 12,
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