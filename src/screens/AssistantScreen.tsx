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
    Modal,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import TopBar from "../components/TopBar";
import { useLang } from "../AppContext";
import { T } from "../translations";
import { uploadContract, legalAsk, translateText, LegalAskResponse } from "../api/client";

// ── Tokens ───────────────────────────────────────────────────────────
const Color = {
    aliceBlue: "#f3faff",
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    silver: "rgba(193,198,212,0.3)",
    silverSolid: "#c1c6d4",
    lightPurple: "#f0e6ff",
    purple: "#7c3aed",
    lightBlue: "#e8f4ff",
    errorBg: "#ffebee",
    errorText: "#c62828",
};

// A stable userId per session (replace with real auth later)
const SESSION_USER_ID = "user_" + Math.random().toString(36).slice(2, 9);

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
    highlight?: string;
    isError?: boolean;
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
    const [isSending, setIsSending] = React.useState(false);
    const scrollRef = React.useRef<ScrollView>(null);
    const inputRef = React.useRef<TextInput>(null);

    // ── Upload modal state ────────────────────────────────────────────
    const [uploadModalVisible, setUploadModalVisible] = React.useState(false);
    const [contractText, setContractText] = React.useState("");
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    // ── Voice recording state ─────────────────────────────────────────
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordingLoading, setRecordingLoading] = React.useState(false);
    const recordingRef = React.useRef<Audio.Recording | null>(null);
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            recordingRef.current?.stopAndUnloadAsync().catch(() => {});
        };
    }, []);

    // ── Language mapping (app lang → full name for backend) ───────────
    const LANG_NAMES: Record<string, string> = {
        en: "English",
        tl: "Tagalog",
        ml: "Malayalam",
        ru: "Russian",
    };
    const responseLang = LANG_NAMES[lang] ?? "English";

    // ── Upload contract ───────────────────────────────────────────────
    const handleUploadContract = async () => {
        const trimmed = contractText.trim();
        if (!trimmed) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            await uploadContract({ userId: SESSION_USER_ID, contractText: trimmed });
            setContractUploaded(true);
            setUploadModalVisible(false);
            setContractText("");

            // Greet the user
            const greet: Message = {
                id: Date.now().toString(),
                role: "assistant",
                text: "✅ Your contract has been uploaded. You can now ask me questions about your rights based on its content.",
            };
            setMessages((prev) => [...prev, greet]);
        } catch (err: any) {
            setUploadError(err?.message ?? "Upload failed. Is the backend running?");
        } finally {
            setIsUploading(false);
        }
    };

    // ── Send question ─────────────────────────────────────────────────
    const sendMessage = async (overrideText?: string) => {
        const trimmed = (overrideText ?? inputText).trim();
        if (!trimmed || isSending) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            text: trimmed,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText("");
        setIsSending(true);

        // Scroll to bottom
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

        try {
            const res: LegalAskResponse = await legalAsk({
                userId: SESSION_USER_ID,
                question: trimmed,
                language: responseLang,
            });

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: res.answer,
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err: any) {
            const errMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: "⚠ Could not reach the server. Please check your connection and try again.",
                isError: true,
            };
            setMessages((prev) => [...prev, errMsg]);
        } finally {
            setIsSending(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    // ── Voice recording handlers ──────────────────────────────────────
    const RECORDING_OPTIONS: Audio.RecordingOptions = {
        android: {
            extension: ".m4a",
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
        },
        ios: {
            extension: ".m4a",
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
        web: { mimeType: "audio/webm", bitsPerSecond: 128000 },
    };

    const startRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Microphone Required",
                    "Please allow microphone access in Settings so CareConnect can record your voice."
                );
                return;
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS);
            recordingRef.current = recording;
            setIsRecording(true);
        } catch (err: any) {
            Alert.alert("Recording Error", err?.message ?? "Could not start microphone.");
        }
    };

    const stopRecordingAndSend = async () => {
        if (!recordingRef.current) return;
        setIsRecording(false);
        setRecordingLoading(true);
        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            if (!uri) throw new Error("No recording URI returned.");

            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });
            const mimeType = Platform.OS === "web" ? "audio/webm" : "audio/m4a";

            // Transcribe audio via translation endpoint (returns transcribed text)
            const transcribed = await translateText({
                audioBase64: base64,
                audioMimeType: mimeType,
                targetLanguage: responseLang,
            });

            // Use the transcribed text as the message
            if (transcribed.translatedText) {
                await sendMessage(transcribed.translatedText);
            }
        } catch (err: any) {
            Alert.alert("Voice Error", err?.message ?? "Could not process the recording.");
        } finally {
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
            setRecordingLoading(false);
        }
    };

    const handleMicPress = () => {
        if (recordingLoading) return;
        if (isRecording) {
            stopRecordingAndSend();
        } else {
            startRecording();
        }
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
                    onContentSizeChange={() =>
                        scrollRef.current?.scrollToEnd({ animated: true })
                    }
                >
                    <Text style={s.heading}>{t.assistantHeading}</Text>
                    <Text style={s.subheading}>{t.assistantSub}</Text>

                    {/* Upload contract card (hidden once uploaded) */}
                    {!contractUploaded && (
                        <Pressable
                            style={s.uploadCard}
                            onPress={() => {
                                setUploadError(null);
                                setUploadModalVisible(true);
                            }}
                        >
                            <View style={s.uploadIconCircle}>
                                <Text style={s.uploadIconEmoji}>📄</Text>
                            </View>
                            <Text style={s.uploadTitle}>{t.uploadTitle}</Text>
                            <Text style={s.uploadDesc}>{t.uploadDesc}</Text>
                        </Pressable>
                    )}

                    {/* Uploaded badge */}
                    {contractUploaded && (
                        <View>
                            <View style={s.uploadedBadge}>
                                <Text style={s.uploadedText}>{t.contractUploaded}</Text>
                            </View>
                            <View style={s.contractWarning}>
                                <Text style={s.contractWarningText}>
                                    ⚠ Contract is stored in memory. If the server restarts, re-upload it so the bot can still reference it.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Empty state before any message */}
                    {messages.length === 0 && (
                        <View style={s.emptyState}>
                            <Text style={s.emptyEmoji}>⚖️</Text>
                            <Text style={s.emptyText}>
                                {contractUploaded
                                    ? "Ask me anything about your rights or your contract."
                                    : "Upload your contract above, then ask about your rights."}
                            </Text>
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
                                <View
                                    style={[
                                        msg.role === "user" ? s.userTextWrap : s.botTextWrap,
                                        msg.isError && s.errorTextWrap,
                                    ]}
                                >
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

                        {/* Typing indicator */}
                        {isSending && (
                            <View style={[s.messageBubble, s.botBubble]}>
                                <View style={s.botAvatarRow}>
                                    <View style={s.botAvatar}>
                                        <Text style={s.botAvatarIcon}>✦</Text>
                                    </View>
                                </View>
                                <View style={s.botTextWrap}>
                                    <ActivityIndicator
                                        size="small"
                                        color={Color.endeavour}
                                    />
                                </View>
                            </View>
                        )}
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
                    {/* Mic button */}
                    <Pressable
                        style={[
                            s.micBtn,
                            isRecording && s.micBtnActive,
                            recordingLoading && { opacity: 0.5 },
                        ]}
                        onPress={handleMicPress}
                        disabled={isSending || recordingLoading}
                    >
                        {recordingLoading ? (
                            <ActivityIndicator size="small" color={Color.endeavour} />
                        ) : (
                            <Text style={s.micIcon}>{isRecording ? "⏹" : "🎤"}</Text>
                        )}
                    </Pressable>

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
                        editable={!isSending && !isRecording}
                    />
                    <Pressable
                        style={[s.sendBtn, isSending && s.sendBtnDisabled]}
                        onPress={() => sendMessage()}
                        disabled={isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color={Color.white} />
                        ) : (
                            <Text style={s.sendIcon}>▶</Text>
                        )}
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

            {/* ── Upload contract modal ── */}
            <Modal
                visible={uploadModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setUploadModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={s.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={s.modalSheet}
                        >
                            <View style={s.handleBar} />

                            <Text style={s.modalTitle}>Paste Your Contract</Text>
                            <Text style={s.modalSubtitle}>
                                Copy the text from your contract and paste it below. Your data stays
                                private and is never shared.
                            </Text>

                            <TextInput
                                style={s.contractInput}
                                placeholder="Paste contract text here…"
                                placeholderTextColor={Color.silverSolid}
                                value={contractText}
                                onChangeText={setContractText}
                                multiline
                                textAlignVertical="top"
                                autoFocus
                            />

                            {uploadError && (
                                <View style={s.errorBox}>
                                    <Text style={s.errorText}>⚠ {uploadError}</Text>
                                </View>
                            )}

                            <View style={s.modalButtons}>
                                <Pressable
                                    style={s.cancelBtn}
                                    onPress={() => setUploadModalVisible(false)}
                                >
                                    <Text style={s.cancelText}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    style={[
                                        s.uploadBtn,
                                        (!contractText.trim() || isUploading) && s.uploadBtnDisabled,
                                    ]}
                                    onPress={handleUploadContract}
                                    disabled={!contractText.trim() || isUploading}
                                >
                                    {isUploading ? (
                                        <ActivityIndicator color={Color.white} size="small" />
                                    ) : (
                                        <Text style={s.uploadBtnText}>Upload Contract</Text>
                                    )}
                                </Pressable>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
    contractWarning: {
        backgroundColor: "#fff8e1",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 6,
    },
    contractWarningText: { fontSize: 12, color: "#f57f17", lineHeight: 17 },
    emptyState: { alignItems: "center", paddingVertical: 24, gap: 10 },
    emptyEmoji: { fontSize: 36 },
    emptyText: { fontSize: 14, color: Color.mako, textAlign: "center", lineHeight: 20 },
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
        minWidth: 48,
        minHeight: 36,
        justifyContent: "center",
    },
    errorTextWrap: {
        backgroundColor: "#ffebee",
        borderColor: "#ef9a9a",
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
    sendBtnDisabled: { backgroundColor: Color.silverSolid },
    sendIcon: { fontSize: 14, color: Color.white },
    micBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: Color.linkWater,
        backgroundColor: Color.aliceBlue,
        alignItems: "center",
        justifyContent: "center",
    },
    micBtnActive: {
        backgroundColor: "#ffebee",
        borderColor: "#ef9a9a",
    },
    micIcon: { fontSize: 16 },
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

    // ── Modal ────────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalSheet: {
        backgroundColor: Color.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 12,
        gap: 14,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: Color.silverSolid,
        alignSelf: "center",
        marginBottom: 4,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: Color.blackPearl },
    modalSubtitle: { fontSize: 13, color: Color.mako, lineHeight: 18, marginTop: -6 },
    contractInput: {
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: Color.blackPearl,
        minHeight: 160,
        backgroundColor: Color.aliceBlue,
    },
    errorBox: {
        backgroundColor: "#ffebee",
        borderRadius: 8,
        padding: 12,
    },
    errorText: { fontSize: 13, color: "#c62828" },
    modalButtons: { flexDirection: "row", gap: 12 },
    cancelBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    cancelText: { fontSize: 15, color: Color.mako, fontWeight: "600" },
    uploadBtn: {
        flex: 2,
        backgroundColor: Color.endeavour,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    uploadBtnDisabled: { backgroundColor: Color.silverSolid },
    uploadBtnText: { fontSize: 15, color: Color.white, fontWeight: "700" },
});