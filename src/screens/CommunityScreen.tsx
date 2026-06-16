import * as React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopBar from "../components/TopBar";
import { useLang } from "../AppContext";
import { T } from "../translations";

// ── Tokens ───────────────────────────────────────────────────────────
const Color = {
    aliceBlue: "#f3faff",
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    silver: "rgba(193,198,212,0.3)",
    green: "#4caf50",
    lightGreen: "#e8f5e9",
    greenText: "#2e7d32",
    yellow: "#ffd600",
    lightYellow: "#fff8e1",
};

// ── Nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { labelKey: "navHome" as const, emoji: "🏠", screen: "Home" },
    { labelKey: "navTranslator" as const, emoji: "交", screen: "Translator" },
    { labelKey: "navAssistant" as const, emoji: "✦", screen: "Assistant" },
    { labelKey: "navCommunity" as const, emoji: "👥", screen: "Community", active: true },
    { labelKey: "navTasks" as const, emoji: "📋", screen: "Tasks" },
    { labelKey: "navJournal" as const, emoji: "♡", screen: "Journal" },
];

// ── Map filter tabs ───────────────────────────────────────────────────
const MAP_FILTERS = ["Caregivers", "Clinics", "Taxis"] as const;
type MapFilter = typeof MAP_FILTERS[number];

// ── Data ─────────────────────────────────────────────────────────────
const SUPPORT_NETWORKS = [
    { id: "1", name: "Haifa Filipino\nCaregivers", type: "WhatsApp Group", emoji: "💬", bg: "#e8f5e9" },
    { id: "2", name: "St. Joseph\nParish Events", type: "Community Center", emoji: "⛪", bg: Color.lightYellow },
];

const INFLUENCERS = [
    { id: "1", title: "Hebrew Basics for\nCaregivers", author: "Shyni Babu", platform: "YouTube", emoji: "▶" },
    { id: "2", title: "Navigating Transport", author: "Maria Santos", platform: "TikTok", emoji: "▶" },
];

const MAP_RESULTS: Record<MapFilter, Array<{ id: string; name: string; distance: string; action: string; color: string }>> = {
    Caregivers: [
        { id: "1", name: "Priya", distance: "100m away", action: "Chat", color: "#7c3aed" },
        { id: "2", name: "Maria S.", distance: "500m away", action: "Chat", color: "#2e7d32" },
    ],
    Clinics: [
        { id: "1", name: "Horev Clinic", distance: "100m away", action: "Info & Directions", color: "#7c3aed" },
        { id: "2", name: "Hadar Clinic", distance: "1km away", action: "Info & Directions", color: "#2e7d32" },
    ],
    Taxis: [
        { id: "1", name: "Taxi Stop", distance: "500m away", action: "Info & Directions", color: "#f57c00" },
    ],
};

const RELIGIOUS_PLACES = [
    {
        id: "1",
        name: "Nazareth (נצרת)",
        district: "Northern District",
        tag: "Religious Site",
        tagBg: Color.lightYellow,
        tagText: "#b45309",
        desc: "A major pilgrimage center featuring the Basilica of the Annunciation. Accessible via direct buses from Haifa and Tel Aviv.",
    },
    {
        id: "2",
        name: "Stella Maris Monastery",
        district: "Haifa District",
        tag: "Religious Site",
        tagBg: Color.lightYellow,
        tagText: "#b45309",
        desc: "A 19th-century Carmelite monastery located on the slopes of Mount Carmel in Haifa, offering beautiful panoramic views of the Mediterranean Sea.",
    },
    {
        id: "3",
        name: "Church of the Holy Sepulchre",
        district: "Jerusalem District",
        tag: "Religious Site",
        tagBg: Color.lightYellow,
        tagText: "#b45309",
        desc: "Located in the Christian Quarter of the Old City of Jerusalem, it is considered one of the holiest sites in Christianity.",
    },
];

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function CommunityScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang } = useLang();
    const t = T[lang];
    const [activeFilter, setActiveFilter] = React.useState<MapFilter>("Caregivers");
    const [searchText, setSearchText] = React.useState("");

    const results = MAP_RESULTS[activeFilter];
    const actionLabel = activeFilter === "Caregivers" ? "Go to all chats" : activeFilter === "Clinics" ? "Go to all Clinics" : "Go to all transport information";

    return (
        <View style={[s.root, { paddingTop: insets.top }]}>

            {/* ── Top bar Real Conectada ── */}
            <TopBar title={t.navCommunity} navigation={navigation} />

            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={s.subheading}>Connect with others and explore essential locations.</Text>

                {/* Search */}
                <View style={s.searchRow}>
                    <TextInput
                        style={s.searchInput}
                        placeholder="Find places (Religious sites, transit)..."
                        placeholderTextColor={Color.mako}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    <Pressable style={s.searchBtn}>
                        <Text style={s.searchIcon}>🔍</Text>
                    </Pressable>
                </View>

                {/* Local Support Networks */}
                <Text style={s.sectionTitle}>Local Support Networks</Text>
                <View style={s.networkRow}>
                    {SUPPORT_NETWORKS.map((n) => (
                        <Pressable key={n.id} style={[s.networkCard, { backgroundColor: n.bg }]}>
                            <Text style={s.networkEmoji}>{n.emoji}</Text>
                            <Text style={s.networkName}>{n.name}</Text>
                            <Text style={s.networkType}>{n.type}</Text>
                        </Pressable>
                    ))}
                </View>
                <Pressable>
                    <Text style={s.seeMore}>See more...</Text>
                </Pressable>

                {/* Learn from Influencers */}
                <Text style={s.sectionTitle}>Learn from Influencers</Text>
                <View style={s.influencerRow}>
                    {INFLUENCERS.map((item) => (
                        <Pressable key={item.id} style={s.influencerCard}>
                            <View style={s.influencerThumb}>
                                <View style={s.playCircle}>
                                    <Text style={s.playIcon}>▶</Text>
                                </View>
                            </View>
                            <Text style={s.influencerTitle}>{item.title}</Text>
                            <Text style={s.influencerAuthor}>{item.author} • {item.platform}</Text>
                        </Pressable>
                    ))}
                </View>
                <Pressable>
                    <Text style={s.seeMore}>See more...</Text>
                </Pressable>

                {/* Near You map section */}
                <View style={s.nearYouHeader}>
                    <Text style={s.sectionTitle}>Near You:</Text>
                    <View style={s.filterRow}>
                        {MAP_FILTERS.map((f) => (
                            <Pressable
                                key={f}
                                style={[s.filterChip, activeFilter === f && s.filterChipActive]}
                                onPress={() => setActiveFilter(f)}
                            >
                                <Text style={[s.filterChipText, activeFilter === f && s.filterChipTextActive]}>
                                    {f}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Map placeholder */}
                <View style={s.mapContainer}>
                    <View style={s.mapPlaceholder}>
                        <Text style={s.mapEmoji}>🗺</Text>
                        <Text style={s.mapLabel}>Map View</Text>
                    </View>
                    <View style={s.locationBadge}>
                        <Text style={s.locationDot}>●</Text>
                        <Text style={s.locationText}>Location sharing enabled to see nearby caregivers, medical care, taxi stops and more.</Text>
                    </View>
                </View>

                {/* Results list */}
                <View style={s.resultsList}>
                    {results.map((r) => (
                        <View key={r.id} style={s.resultItem}>
                            <View style={[s.resultAvatar, { backgroundColor: r.color }]}>
                                <Text style={s.resultAvatarText}>{r.name.charAt(0)}</Text>
                            </View>
                            <View style={s.resultInfo}>
                                <Text style={s.resultName}>{r.name}</Text>
                                <Text style={s.resultDistance}>{r.distance}</Text>
                            </View>
                            <Pressable style={s.resultActionBtn}>
                                <Text style={s.resultActionText}>{r.action}</Text>
                            </Pressable>
                        </View>
                    ))}
                    <Pressable>
                        <Text style={s.seeMoreCenter}>{actionLabel}</Text>
                    </Pressable>
                </View>

                {/* Popular Religious Places */}
                <Text style={s.sectionTitle}>Popular Religious Places</Text>
                <View style={s.religiousList}>
                    {RELIGIOUS_PLACES.map((place) => (
                        <View key={place.id} style={s.religiousCard}>
                            {/* Image placeholder */}
                            <View style={s.religiousImage}>
                                <Text style={s.religiousImageEmoji}>🏛</Text>
                            </View>
                            <View style={s.religiousBody}>
                                <View style={s.religiousTagRow}>
                                    <View style={[s.religiousTag, { backgroundColor: place.tagBg }]}>
                                        <Text style={[s.religiousTagText, { color: place.tagText }]}>{place.tag}</Text>
                                    </View>
                                    <Text style={s.religiousDistrict}>{place.district}</Text>
                                    <Pressable style={s.bookmarkBtn}>
                                        <Text style={s.bookmarkIcon}>🔖</Text>
                                    </Pressable>
                                </View>
                                <Text style={s.religiousName}>{place.name}</Text>
                                <Text style={s.religiousDesc}>{place.desc}</Text>
                                <Pressable style={s.moovitBtn}>
                                    <Text style={s.moovitIcon}>🚌</Text>
                                    <Text style={s.moovitText}>Moovit/Google Maps</Text>
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* ── Bottom navigation Corregida para Huawei ── */}
            <View style={[s.bottomNav, { paddingBottom: 12 + insets.bottom }]}>
                {NAV_ITEMS.map((item) => (
                    <Pressable
                        key={item.labelKey}
                        style={s.navItem}
                        onPress={() => {
                            if (!item.active) navigation?.navigate(item.screen);
                        }}
                    >
                        <Text style={[s.navEmoji, item.active && s.navEmojiActive]}>{item.emoji}</Text>
                        <Text style={[s.navLabel, item.active && s.navLabelActive]}>{t[item.labelKey]}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

// ════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Color.aliceBlue },
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
    title: { fontSize: 18, fontWeight: "700", color: Color.endeavour },
    globeBtn: { padding: 4 },
    globeIcon: { fontSize: 20 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 12 },
    subheading: { fontSize: 13, color: Color.mako },
    searchRow: { flexDirection: "row", gap: 8, alignItems: "center" },
    searchInput: {
        flex: 1,
        backgroundColor: Color.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Color.linkWater,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 13,
        color: Color.blackPearl,
    },
    searchBtn: {
        width: 42,
        height: 42,
        backgroundColor: Color.endeavour,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    searchIcon: { fontSize: 18 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: Color.blackPearl, marginTop: 4 },
    networkRow: { flexDirection: "row", gap: 12 },
    networkCard: { flex: 1, borderRadius: 12, padding: 14, gap: 6, borderWidth: 1, borderColor: Color.linkWater },
    networkEmoji: { fontSize: 22 },
    networkName: { fontSize: 13, fontWeight: "700", color: Color.blackPearl, lineHeight: 18 },
    networkType: { fontSize: 11, color: Color.mako },
    seeMore: { fontSize: 13, color: Color.endeavour, fontWeight: "600", textAlign: "right" },
    seeMoreCenter: { fontSize: 13, color: Color.endeavour, fontWeight: "600", textAlign: "center", paddingVertical: 8 },
    influencerRow: { flexDirection: "row", gap: 12 },
    influencerCard: { flex: 1, gap: 6 },
    influencerThumb: { height: 90, backgroundColor: Color.linkWater, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    playCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.8)", alignItems: "center", justifyContent: "center" },
    playIcon: { fontSize: 14, color: Color.endeavour },
    influencerTitle: { fontSize: 13, fontWeight: "700", color: Color.blackPearl, lineHeight: 17 },
    influencerAuthor: { fontSize: 11, color: Color.mako },
    nearYouHeader: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    filterRow: { flexDirection: "row", gap: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Color.linkWater, backgroundColor: Color.white },
    filterChipActive: { backgroundColor: Color.endeavour, borderColor: Color.endeavour },
    filterChipText: { fontSize: 12, color: Color.mako, fontWeight: "500" },
    filterChipTextActive: { color: Color.white, fontWeight: "700" },
    mapContainer: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: Color.linkWater },
    mapPlaceholder: { height: 160, backgroundColor: "#d4e8c2", alignItems: "center", justifyContent: "center", gap: 8 },
    mapEmoji: { fontSize: 40 },
    mapLabel: { fontSize: 14, color: Color.mako },
    locationBadge: { backgroundColor: Color.lightGreen, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", gap: 6, alignItems: "flex-start" },
    locationDot: { fontSize: 10, color: Color.green, marginTop: 3 },
    locationText: { fontSize: 12, color: Color.greenText, flex: 1 },
    resultsList: { backgroundColor: Color.white, borderRadius: 12, borderWidth: 1, borderColor: Color.linkWater, overflow: "hidden" },
    resultItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Color.linkWater },
    resultAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    resultAvatarText: { fontSize: 16, color: Color.white, fontWeight: "700" },
    resultInfo: { flex: 1 },
    resultName: { fontSize: 14, fontWeight: "600", color: Color.blackPearl },
    resultDistance: { fontSize: 12, color: Color.mako },
    resultActionBtn: { backgroundColor: Color.endeavour, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
    resultActionText: { fontSize: 12, color: Color.white, fontWeight: "600" },
    religiousList: { gap: 16 },
    religiousCard: { backgroundColor: Color.white, borderRadius: 12, borderWidth: 1, borderColor: Color.linkWater, overflow: "hidden" },
    religiousImage: { height: 120, backgroundColor: "#c8dfc8", alignItems: "center", justifyContent: "center" },
    religiousImageEmoji: { fontSize: 40 },
    religiousBody: { padding: 14, gap: 8 },
    religiousTagRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    religiousTag: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    religiousTagText: { fontSize: 11, fontWeight: "600" },
    religiousDistrict: { fontSize: 11, color: Color.mako, flex: 1 },
    bookmarkBtn: { padding: 4 },
    bookmarkIcon: { fontSize: 14 },
    religiousName: { fontSize: 16, fontWeight: "700", color: Color.blackPearl },
    religiousDesc: { fontSize: 13, color: Color.mako, lineHeight: 18 },
    moovitBtn: { backgroundColor: Color.endeavour, borderRadius: 8, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    moovitIcon: { fontSize: 16 },
    moovitText: { fontSize: 14, color: Color.white, fontWeight: "600" },
    bottomNav: {
        flexDirection: "row",
        backgroundColor: Color.aliceBlue,
        borderTopWidth: 1,
        borderTopColor: Color.linkWater,
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    navItem: { flex: 1, alignItems: "center", gap: 2 },
    navEmoji: { fontSize: 20 },
    navEmojiActive: { color: Color.endeavour },
    navLabel: { fontSize: 10, color: Color.mako },
    navLabelActive: { color: Color.endeavour, fontWeight: "600" },
});