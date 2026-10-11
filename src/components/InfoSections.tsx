// ── InfoSections.tsx ─────────────────────────────────────────────────
// Building blocks of the home-screen pages: the page frame (top bar, back
// button, scrolling content) and the renderer for the sections in infoPages.ts.
import * as React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "./TopBar";
import { useLang } from "../AppContext";
import { InfoSection } from "../infoPages";
import { PAGE_T } from "../pageStrings";

export const PageColor = {
    bg: "#f3faff",
    ink: "#071e27",
    muted: "#414752",
    blue: "#005dac",
    line: "#cfe6f2",
    white: "#fff",
    red: "#c62828",
    cream: "#ffdfa0",
    gold: "#f8bd2a",
    brown: "#775800",
};

/** Top bar + "‹ Back" + scrolling content. */
export function PageFrame({ title, navigation, children }: { title: string; navigation: any; children: React.ReactNode }) {
    const insets = useSafeAreaInsets();
    const { lang } = useLang();
    return (
        <View style={[s.root, { paddingTop: insets.top }]}>
            <TopBar title={title} navigation={navigation} />
            <ScrollView contentContainerStyle={[s.content, { paddingBottom: 40 + insets.bottom }]} keyboardShouldPersistTaps="handled">
                <Pressable
                    onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home"))}
                    style={s.back}
                    accessibilityRole="button"
                >
                    <Text style={s.backText}>‹ {PAGE_T[lang].back}</Text>
                </Pressable>
                {children}
            </ScrollView>
        </View>
    );
}

const tel = (number: string) => `tel:${number.replace(/[^\d*+]/g, "")}`;

export function InfoSections({ sections }: { sections: InfoSection[] }) {
    const { lang } = useLang();
    const p = PAGE_T[lang];
    return (
        <>
            {sections.map((sec, i) => (
                <View key={i} style={s.card}>
                    <Text style={s.cardTitle}>{sec.title[lang]}</Text>
                    {sec.quote ? (
                        <View style={s.quote}>
                            <Text style={s.quoteText}>“{sec.quote.text[lang]}”</Text>
                            <Text style={s.quoteBy}>— {sec.quote.by[lang]}</Text>
                        </View>
                    ) : null}
                    {sec.body ? <Text style={s.body}>{sec.body[lang]}</Text> : null}
                    {sec.bullets?.[lang].map((b, j) => (
                        <View key={j} style={s.bulletRow}>
                            <Text style={s.bulletDot}>•</Text>
                            <Text style={s.bulletText}>{b}</Text>
                        </View>
                    ))}
                    {sec.phones?.map((ph) => (
                        <Pressable key={ph.number} style={s.phoneRow} onPress={() => Linking.openURL(tel(ph.number))} accessibilityRole="button">
                            <Text style={s.phoneNumber}>{ph.number}</Text>
                            <Text style={s.phoneLabel}>{ph.label[lang]}</Text>
                            <Text style={s.phoneCall}>📞 {p.call}</Text>
                        </Pressable>
                    ))}
                    {sec.links?.map((l) => (
                        <Pressable key={l.url} style={s.linkRow} onPress={() => Linking.openURL(l.url)} accessibilityRole="link">
                            <Text style={s.linkText}>🔗 {l.label[lang]}</Text>
                        </Pressable>
                    ))}
                </View>
            ))}
        </>
    );
}

export const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: PageColor.bg },
    content: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
    back: { alignSelf: "flex-start", paddingVertical: 6, paddingRight: 12 },
    backText: { color: PageColor.blue, fontSize: 15, fontWeight: "600" },
    pageTitle: { fontSize: 22, fontWeight: "700", color: PageColor.ink },
    intro: { fontSize: 15, color: PageColor.muted, lineHeight: 21 },
    card: {
        backgroundColor: PageColor.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: PageColor.line,
        padding: 14,
        gap: 8,
    },
    cardTitle: { fontSize: 17, fontWeight: "700", color: PageColor.ink },
    body: { fontSize: 15, color: PageColor.ink, lineHeight: 21 },
    bulletRow: { flexDirection: "row", gap: 8 },
    bulletDot: { fontSize: 15, color: PageColor.blue, lineHeight: 21 },
    bulletText: { flex: 1, fontSize: 15, color: PageColor.ink, lineHeight: 21 },
    quote: { backgroundColor: PageColor.cream, borderLeftWidth: 4, borderLeftColor: PageColor.gold, borderRadius: 8, padding: 10, gap: 4 },
    quoteText: { fontSize: 15, color: PageColor.ink, lineHeight: 21, fontStyle: "italic" },
    quoteBy: { fontSize: 13, color: PageColor.brown, fontWeight: "600" },
    phoneRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: PageColor.line,
    },
    phoneNumber: { fontSize: 18, fontWeight: "700", color: PageColor.red, minWidth: 62 },
    phoneLabel: { flex: 1, fontSize: 14, color: PageColor.ink },
    phoneCall: { fontSize: 13, color: PageColor.blue, fontWeight: "600" },
    linkRow: { paddingVertical: 6 },
    linkText: { fontSize: 15, color: PageColor.blue, fontWeight: "600" },
    button: { backgroundColor: PageColor.blue, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center" },
    buttonText: { color: PageColor.white, fontSize: 15, fontWeight: "700" },
    small: { fontSize: 12, color: PageColor.muted },
});
