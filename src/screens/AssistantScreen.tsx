import * as React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
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
    lightPurple: "#f0e6ff",
    purple: "#7c3aed",
    lightBlue: "#e8f4ff",
};

// ── Nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { labelKey: "navHome" as const, emoji: "🏠", screen: "Home" },
    { labelKey: "navTranslator" as const, emoji: "交", screen: "Translator" },
    { labelKey: "navAssistant" as const, emoji: "✦", screen: "Assistant", active: true },
    { labelKey: "navCommunity" as const, emoji: "👥", screen: "Community" },
    { labelKey: "navTasks" as const, emoji: "📋", screen: "Tasks" },
    { labelKey: "navJournal" as const, emoji: "♡", screen: "Journal" },
];

// ── Message type ─────────────────────────────────────────────────────
type Message = {
    id: string;
    role: "user" | "assistant";
    text: string;
    highlight?: string; // red-highlighted portion
};

const INITIAL_MESSAGES: Message[] = [
    {
        id: "1",
        role: "user",
        text: "Can my employer ask me to clean the entire family's house?",
    },
    {
        id: "2",
        role: "assistant",
        text: "Based on Israeli labor laws and your uploaded contract, you are ",
        highlight: "only required to clean for your specific patient",
    },
];

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function AssistantScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang } = useLang();
    const t = T[lang];
    const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES);
    const [inputText, setInputText] = React.useState("");
    const [contractUploaded, setContractUploaded] = React.useState(false);
    const scrollRef = React.useRef<ScrollView>(null);

    const sendMessage = () => {
        const trimmed = inputText.trim();
        if (!trimmed) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: trimmed,
        };
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            text: "I'm reviewing your question based on Israeli labor laws. Please note that I'm an AI assistant and this is not legal advice. For your specific situation, I recommend consulting a licensed labor attorney.",
        };

        setMessages((prev) => [...prev, userMsg, botMsg]);
        setInputText("");
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
        >
            <View style={[s.root, { paddingTop: insets.top }]}>

                {/* ── Top bar Real Conectada ── */}
                <TopBar title={t.navAssistant} navigation={navigation} />

                {/* ── Scrollable chat area ── */}
                <ScrollView
                    ref={scrollRef}
                    style={s.scroll}
                    contentContainerStyle={s.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Heading */}
                    <Text style={s.heading}>Legal & Contract Bot</Text>
                    <Text style={s.subheading}>Ask me anything about your rights.</Text>

                    {/* Upload contract card */}
                    {!contractUploaded && (
                        <Pressable
                            style={s.uploadCard}
                            onPress={() => setContractUploaded(true)}
                        >
                            <View style={s.uploadIconCircle}>
                                <Text style={s.uploadIconEmoji}>📄</Text>
                            </View>
                            <Text style={s.uploadTitle}>Upload or Scan Your{"\n"}Employment Contract</Text>
                            <Text style={s.uploadDesc}>
                                Privately scan your contract to ask the AI about your legal rights, weekly rest
                                days, and what your employer can or cannot demand. Your data is strictly
                                confidential.
                            </Text>
                        </Pressable>
                    )}

                    {contractUploaded && (
                        <View style={s.uploadedBadge}>
                            <Text style={s.uploadedText}>✓ Contract uploaded</Text>
                        </View>
                    )}

                    {/* Messages */}
                    <View style={s.messagesContainer}>
                        {messages.map((msg) => (
                            <View
                                key={msg.id}
                                style={[
                                    s.messageBubble,
                                    msg.role === "user" ? s.userBubble : s.botBubble,
                                ]}
                            >
                                {msg.role === "assistant" && (
                                    <View style={s.botAvatarRow}>
                                        <View style={s.botAvatar}>
                                            <Text style={s.botAvatarIcon}>✦</Text>
                                        </View>
                                    </View>
                                )}
                                <View style={msg.role === "user" ? s.userTextWrap : s.botTextWrap}>
                                    {msg.highlight ? (
                                        <Text style={s.botText}>
                                            {msg.text}
                                            <Text style={s.highlightText}>{msg.highlight}</Text>
                                            {", not the entire household."}
                                        </Text>
                                    ) : (
                                        <Text style={msg.role === "user" ? s.userText : s.botText}>
                                            {msg.text}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* ── Input bar ── */}
                <View style={s.inputBar}>
                    <TextInput
                        style={s.textInput}
                        placeholder="Type a message..."
                        placeholderTextColor={Color.mako}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={sendMessage}
                        returnKeyType="send"
                        multiline
                    />
                    <Pressable style={s.sendBtn} onPress={sendMessage}>
                        <Text style={s.sendIcon}>▶</Text>
                    </Pressable>
                </View>

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
        </KeyboardAvoidingView>
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
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
        gap: 16,
    },
    heading: { fontSize: 20, fontWeight: "700", color: Color.blackPearl },
    subheading: { fontSize: 14, color: Color.mako, marginTop: -8 },
    uploadCard: {
        borderWidth: 1.5,
        borderColor: Color.endeavour,
        borderStyle: "dashed",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        gap: 10,
        backgroundColor: Color.lightBlue,
    },
    uploadIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Color.endeavour,
        alignItems: "center",
        justifyContent: "center",
    },
    uploadIconEmoji: { fontSize: 24 },
    uploadTitle: { fontSize: 16, fontWeight: "700", color: Color.blackPearl, textAlign: "center" },
    uploadDesc: { fontSize: 13, color: Color.mako, textAlign: "center", lineHeight: 18 },
    uploadedBadge: {
        backgroundColor: "#e8f5e9",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignSelf: "flex-start",
    },
    uploadedText: { fontSize: 13, color: "#2e7d32", fontWeight: "600" },
    messagesContainer: { gap: 12 },
    messageBubble: { flexDirection: "row", gap: 8 },
    userBubble: { justifyContent: "flex-end" },
    botBubble: { justifyContent: "flex-start", alignItems: "flex-start" },
    botAvatarRow: { paddingTop: 2 },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Color.endeavour,
        alignItems: "center",
        justifyContent: "center",
    },
    botAvatarIcon: { fontSize: 14, color: Color.white },
    userTextWrap: {
        backgroundColor: Color.linkWater,
        borderRadius: 12,
        borderTopRightRadius: 2,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: "80%",
        alignSelf: "flex-end",
    },
    botTextWrap: {
        backgroundColor: Color.white,
        borderRadius: 12,
        borderTopLeftRadius: 2,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: "80%",
        borderWidth: 1,
        borderColor: Color.linkWater,
    },
    userText: { fontSize: 14, color: Color.blackPearl, lineHeight: 20 },
    botText: { fontSize: 14, color: Color.blackPearl, lineHeight: 20 },
    highlightText: { color: "#c62828", fontWeight: "700" },
    inputBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: Color.linkWater,
        backgroundColor: Color.white,
    },
    textInput: {
        flex: 1,
        backgroundColor: Color.aliceBlue,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Color.linkWater,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        color: Color.blackPearl,
        maxHeight: 100,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Color.endeavour,
        alignItems: "center",
        justifyContent: "center",
    },
    sendIcon: { fontSize: 14, color: Color.white },
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