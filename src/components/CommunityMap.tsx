// ── CommunityMap.tsx ─────────────────────────────────────────────────
// A real Google Map for the place the user chose (and the category, e.g.
// ATMs). Google allows embedding a map from a search URL for free, without an
// API key. In the browser it is shown inside the page; in the phone apps
// (no web view installed) a button opens the Google Maps app instead.
import * as React from "react";
import { View, Text, Pressable, Platform, StyleSheet, Linking } from "react-native";

export const mapsSearchUrl = (query: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
export const mapsDirectionsUrl = (destination: string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=transit`;
const embedUrl = (query: string) =>
    `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

export default function CommunityMap({ query, emptyText, openLabel }: { query: string | null; emptyText: string; openLabel: string }) {
    if (!query) {
        return (
            <View style={[s.box, s.empty]}>
                <Text style={s.emoji}>🗺</Text>
                <Text style={s.emptyText}>{emptyText}</Text>
            </View>
        );
    }
    return (
        <View>
            {Platform.OS === "web" ? (
                <View style={s.box}>
                    {React.createElement("iframe", {
                        key: query,
                        src: embedUrl(query),
                        title: query,
                        loading: "lazy",
                        referrerPolicy: "no-referrer-when-downgrade",
                        style: { border: 0, width: "100%", height: "100%" },
                    })}
                </View>
            ) : null}
            <Pressable style={s.openBtn} onPress={() => Linking.openURL(mapsSearchUrl(query))} accessibilityRole="link">
                <Text style={s.openText}>🗺  {openLabel}</Text>
            </Pressable>
        </View>
    );
}

const s = StyleSheet.create({
    box: { height: 220, backgroundColor: "#d4e8c2", overflow: "hidden" },
    empty: { alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, height: 140 },
    emoji: { fontSize: 32 },
    emptyText: { fontSize: 13, color: "#414752", textAlign: "center" },
    openBtn: { paddingVertical: 10, alignItems: "center", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#cfe6f2" },
    openText: { fontSize: 14, color: "#005dac", fontWeight: "700" },
});
