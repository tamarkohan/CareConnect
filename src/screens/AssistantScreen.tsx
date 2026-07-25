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
    Keyboard,
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
    { labelKey: "navTranslator" as const, emoji: "🔤", screen: "Translator" },
    { labelKey: "navAssistant" as const, emoji: "⚖️", screen: "Assistant", active: true },
    { labelKey: "navCommunity" as const, emoji: "👥", screen: "Community" },
    { labelKey: "navTasks" as const, emoji: "📋", screen: "Tasks" },
    { labelKey: "navJournal" as const, emoji: "📓", screen: "Journal" },
];

// ── Message type ─────────────────────────────────────────────────────
type Message = {
    id: string;
    role: "user" | "assistant";
    text: string;
    highlight?: string; // red-highlighted portion
};



// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function AssistantScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang } = useLang();
    const t = T[lang];
    const [messages, setMessages] = React.useState<Message[]>([]);

    React.useEffect(() => {
        setMessages([
            { id: "1", role: "user", text: t.initUserMsg },
            { id: "2", role: "assistant", text: t.initBotText, highlight: t.initBotHighlight },
        ]);
    }, [lang]);
    const [inputText, setInputText] = React.useState("");
    const [isInputFocused, setIsInputFocused] = React.useState(false);
    const [contractUploaded, setContractUploaded] = React.useState(false);
    const scrollRef = React.useRef<ScrollView>(null);
    const inputRef = React.useRef<TextInput>(null);

    const sendMessage = (overrideText?: string) => {
        const trimmed = (overrideText ?? inputText).trim();
        if (!trimmed) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: trimmed,
        };
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            text: t.botReply,
        };

        setMessages((prev) => [...prev, userMsg, botMsg]);
        setInputText("");
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    };

    // Because the input is multiline, the keyboard's return key doesn't
    // fire onSubmitEditing — it just inserts a line break. We intercept
    // that here: if a newline shows up in the typed text, treat it as
    // "send" instead of letting it become part of the message.
    const handleChangeText = (text: string) => {
        if (text.includes("\n")) {
            const withoutNewline = text.replace(/\n/g, "");
            sendMessage(withoutNewline);
            return;
        }
        setInputText(text);
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
        inputRef.current?.blur();
    };

    return (
        // Outer View holds TopBar + KeyboardAvoidingView + BottomNav
        <View style={[s.root, { paddingTop: insets.top }]}>

            {/* TopBar is OUTSIDE KeyboardAvoidingView so it never moves */}
            <TopBar title={t.navAssistant} navigation={navigation} />

            {/* KeyboardAvoidingView only wraps chat + input */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
            >
                {/* ── Scrollable chat area ── */}
                <ScrollView
                    ref={scrollRef}
                    style={s.scroll}
                    contentContainerStyle={s.scrollContent}
                    showsVerticalScrollIndicator={false}
                    // Lets the user drag the chat down to dismiss the
                    // keyboard, same gesture as iMessage/WhatsApp —
                    // the main fix for "hard to exit the keyboard".
                    keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={s.heading}>{t.assistantHeading}</Text>
                    <Text style={s.subheading}>{t.assistantSub}</Text>

                    {/* Upload contract card */}
                    {!contractUploaded && (
                        <Pressable
                            style={s.uploadCard}
                            onPress={() => setContractUploaded(true)}
                        >
                            <View style={s.uploadIconCircle}>
                                <Text style={s.uploadIconEmoji}>📄</Text>
                            </View>
                            <Text style={s.uploadTitle}>{t.uploadTitle}</Text>
                            <Text style={s.uploadDesc}>{t.uploadDesc}</Text>
                        </Pressable>
                    )}

                    {contractUploaded && (
                        <View style={s.uploadedBadge}>
                            <Text style={s.uploadedText}>{t.contractUploaded}</Text>
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
                                            {t.initBotSuffix}
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

                {/* ── Keyboard-dismiss tab — only visible while typing ── */}
                {isInputFocused && (
                    <Pressable style={s.dismissTab} onPress={dismissKeyboard} hitSlop={8}>
                        <Text style={s.dismissTabIcon}>⌄</Text>
                    </Pressable>
                )}

                {/* ── Input bar — inside KAV so it rises with keyboard ── */}
                <View style={s.inputBar}>
                    <TextInput
                        ref={inputRef}
                        style={s.textInput}
                        placeholder={t.typeMessage}
                        placeholderTextColor={Color.mako}
                        value={inputText}
                        onChangeText={handleChangeText}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        onSubmitEditing={() => sendMessage()}
                        blurOnSubmit={false}
                        returnKeyType="send"
                        multiline
                    />
                    <Pressable style={s.sendBtn} onPress={() => sendMessage()}>
                        <Text style={s.sendIcon}>▶</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>

            {/* ── Bottom nav — OUTSIDE KAV so it never moves with keyboard ── */}
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
                        <Text
                            style={[s.navLabel, item.active && s.navLabelActive]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
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
    root: { flex: 1, backgroundColor: Color.aliceBlue },
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
    dismissTab: {
        alignSelf: "center",
        backgroundColor: Color.linkWater,
        width: 44,
        height: 22,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: -1,
    },
    dismissTabIcon: { fontSize: 16, color: Color.mako, lineHeight: 16 },
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