// ── WelcomeGuide.tsx ─────────────────────────────────────────────────
// A short guide shown right after signing in: one card that explains each
// button of the bottom navigation bar. It opens again from Menu → App Guide.
// Open/closed state lives in AppContext (guideOpen), so it is rendered once in App.tsx.
import * as React from "react";
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useApp } from "../AppContext";
import { T } from "../translations";
import { GUIDE_T } from "../guideStrings";

const Color = {
    aliceBlue: "#f3faff",
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
};

// Same order and emojis as the bottom navigation bar on the screens.
const ITEMS = [
    { emoji: "🏠", nameKey: "navHome", textKey: "home" },
    { emoji: "🔤", nameKey: "navTranslator", textKey: "translator" },
    { emoji: "⚖️", nameKey: "navAssistant", textKey: "assistant" },
    { emoji: "👥", nameKey: "navCommunity", textKey: "community" },
    { emoji: "📋", nameKey: "navTasks", textKey: "tasks" },
    { emoji: "📓", nameKey: "navJournal", textKey: "journal" },
] as const;

export default function WelcomeGuide() {
    const { lang, user, guideOpen, setGuideOpen } = useApp();
    const t = T[lang];
    const g = GUIDE_T[lang];
    const close = () => setGuideOpen(false);

    return (
        <Modal visible={!!user && guideOpen} transparent animationType="fade" onRequestClose={close}>
            <View style={s.overlay}>
                <View style={s.card}>
                    <Text style={s.title}>{g.title}</Text>
                    <Text style={s.intro}>{g.intro}</Text>

                    <ScrollView style={s.list} contentContainerStyle={s.listContent}>
                        {ITEMS.map((item) => (
                            <View key={item.nameKey} style={s.row}>
                                <View style={s.emojiBox}>
                                    <Text style={s.emoji}>{item.emoji}</Text>
                                </View>
                                <View style={s.rowText}>
                                    <Text style={s.name}>{t[item.nameKey]}</Text>
                                    <Text style={s.desc}>{g[item.textKey]}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <Pressable style={s.btn} onPress={close} accessibilityRole="button">
                        <Text style={s.btnText}>{g.gotIt}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(7,30,39,0.45)",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    card: {
        width: "100%",
        maxWidth: 440,
        maxHeight: "90%",
        backgroundColor: Color.white,
        borderRadius: 16,
        padding: 20,
        gap: 8,
    },
    title: { fontSize: 20, fontWeight: "700", color: Color.blackPearl, textAlign: "center" },
    intro: { fontSize: 14, color: Color.mako, textAlign: "center", marginBottom: 4 },
    list: { flexGrow: 0 },
    listContent: { gap: 10, paddingVertical: 4 },
    row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    emojiBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Color.aliceBlue,
        borderWidth: 1,
        borderColor: Color.linkWater,
        alignItems: "center",
        justifyContent: "center",
    },
    emoji: { fontSize: 20 },
    rowText: { flex: 1, gap: 2 },
    name: { fontSize: 15, fontWeight: "700", color: Color.endeavour },
    desc: { fontSize: 13, lineHeight: 18, color: Color.mako },
    btn: {
        marginTop: 8,
        backgroundColor: Color.endeavour,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    btnText: { color: Color.white, fontSize: 16, fontWeight: "700" },
});
