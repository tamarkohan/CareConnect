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
    Keyboard,
    Linking,
    Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import { showAlert, uriToBase64, confirmAction } from "../api/platform";
import TopBar from "../components/TopBar";
import MarkdownText from "../components/MarkdownText";
import { useApp } from "../AppContext";
import { T } from "../translations";
import { BOT_T } from "../botStrings";
import {
    uploadContract,
    uploadContractFile,
    getContract,
    legalAsk,
    getLegalHistory,
    clearLegalHistory,
    deleteContract,
    translateText,
    translateMessages,
    updateMe,
    ContractInfo,
    ContractFile,
    LegalAskResponse,
    LegalSource,
    SUMMARY_FIELDS,
} from "../api/client";
import { loadContractToken, saveContractToken, clearContractToken } from "../api/contractToken";
import { getItem, setItem } from "../api/storage";

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

// Bump when the disclaimer text changes, so everyone sees it again once.
const DISCLAIMER_VERSION = 1;
const GUEST_DISCLAIMER_KEY = "careconnect.disclaimerVersion";

// Base64 makes files about a third bigger; the server accepts 8 MB of file.
const MAX_UPLOAD_BYTES = 7 * 1024 * 1024;
const MAX_PHOTOS = 5;
const FILE_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/*",
];

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
    isError?: boolean;
    sources?: LegalSource[];
    /** Language it was written in ("English"…); null/undefined = unknown. */
    lang?: string | null;
    /** App notices ("contract saved"…) are shown from botStrings in the current language. */
    noticeKey?: "contractReady" | "contractDeleted";
};

/**
 * Chat text for sending. WhatsApp shows *one star* as bold; anywhere else
 * (copy, other apps) the stars are removed.
 */
function toPlainText(text: string, whatsapp: boolean) {
    return text
        .replace(/\*\*(.+?)\*\*/g, whatsapp ? "*$1*" : "$1")
        .replace(/__(.+?)__/g, whatsapp ? "*$1*" : "$1")
        .replace(/^\s*[-*•]\s+/gm, "• ")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^([-*_]\s*){3,}$/gm, "")
        .trim();
}

// ── Language mapping (app lang → full name for backend) ───────────────
const LANG_NAMES: Record<string, string> = {
    en: "English",
    tl: "Tagalog",
    ml: "Malayalam",
    ru: "Russian",
};

// Chat messages already sent for translation, `${id}|${language}`. Kept outside
// the component so a re-mount (or React's development double-run) never asks twice.
const requestedTranslations = new Set<string>();
// Finished translations, so leaving and re-opening the screen doesn't ask again.
const translationCache: Record<string, string> = {};

const approxBytes = (base64: string) => Math.floor((base64.length * 3) / 4);

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function AssistantScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang, user, setUser } = useApp();
    const t = T[lang];
    const b = BOT_T[lang];
    const responseLang = LANG_NAMES[lang] ?? "English";

    // Messages are kept as written: switching the app language never resets them.
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [loadingHistory, setLoadingHistory] = React.useState(false);

    const [inputText, setInputText] = React.useState("");
    const [isInputFocused, setIsInputFocused] = React.useState(false);
    // Signed-in users: the contract linked to their account.
    // Guests: only a secret token on this device (no summary).
    const [contract, setContract] = React.useState<ContractInfo | null>(null);
    const [guestToken, setGuestToken] = React.useState<string | null>(null);
    const contractUploaded = contract !== null || guestToken !== null;
    const [showSummary, setShowSummary] = React.useState(false);
    const [isSending, setIsSending] = React.useState(false);
    const scrollRef = React.useRef<ScrollView>(null);
    const inputRef = React.useRef<TextInput>(null);

    // ── Upload state ──────────────────────────────────────────────────
    const [uploadMenuVisible, setUploadMenuVisible] = React.useState(false);
    const [pasteVisible, setPasteVisible] = React.useState(false);
    const [contractText, setContractText] = React.useState("");
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    // ── Disclaimer (shown once, then a small line under the input) ────
    const [disclaimerVisible, setDisclaimerVisible] = React.useState(false);

    // ── Voice recording state ─────────────────────────────────────────
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordingLoading, setRecordingLoading] = React.useState(false);
    const recordingRef = React.useRef<Audio.Recording | null>(null);
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Earlier messages shown in the current app language ────────────
    // key `${id}|${language}` → translated text. Kept in memory only.
    const [translations, setTranslations] = React.useState<Record<string, string>>(() => ({ ...translationCache }));
    const [showOriginal, setShowOriginal] = React.useState<Set<string>>(new Set());
    const [translatingChat, setTranslatingChat] = React.useState(false);

    // ── Export / share ────────────────────────────────────────────────
    // The messages being exported (whole chat, or one question + answer).
    const [exportList, setExportList] = React.useState<Message[] | null>(null);
    const [copied, setCopied] = React.useState(false);
    const [copiedId, setCopiedId] = React.useState<string | null>(null);

    const scrollToEnd = (delay = 80) =>
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), delay);
    const addBotMessage = (text: string, isError = false) =>
        setMessages((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, role: "assistant", text, isError }]);
    const addNotice = (noticeKey: Message["noticeKey"]) =>
        setMessages((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, role: "assistant", text: "", noticeKey }]);

    // Load the saved contract and chat (signed in) or the guest's contract token.
    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            if (user) {
                setLoadingHistory(true);
                try {
                    const [c, h] = await Promise.all([getContract(), getLegalHistory()]);
                    if (cancelled) return;
                    setContract(c.contract);
                    setMessages(
                        h.messages.map((m) => ({ id: m.id, role: m.role, text: m.text, sources: m.sources, lang: m.language }))
                    );
                    scrollToEnd(150);
                } catch (err: any) {
                    if (!cancelled) addBotMessage(`⚠ ${err?.status ? err.message : b.errAsk}`, true);
                } finally {
                    if (!cancelled) setLoadingHistory(false);
                }
            } else {
                const token = await loadContractToken();
                if (!cancelled && token) setGuestToken(token);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    // Show the disclaimer the first time ever (or when its text changes).
    React.useEffect(() => {
        (async () => {
            const accepted = user
                ? user.disclaimerVersion ?? 0
                : Number(await getItem(GUEST_DISCLAIMER_KEY)) || 0;
            if (accepted < DISCLAIMER_VERSION) setDisclaimerVisible(true);
        })();
    }, [user?.id]);

    // When the app language changes (or the chat loads), translate earlier
    // messages written in another language. Small batches, newest first, so the
    // messages on screen change quickly and long chats never hit size limits.
    const mountedRef = React.useRef(true);
    React.useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    React.useEffect(() => {
        const lang = responseLang;
        const todo = messages
            .filter((m) => !m.noticeKey && !m.isError && m.text && m.lang !== lang)
            .filter((m) => {
                const key = `${m.id}|${lang}`;
                return translations[key] === undefined && !requestedTranslations.has(key);
            })
            .slice(-40)
            .reverse();
        if (!todo.length) return;
        todo.forEach((m) => requestedTranslations.add(`${m.id}|${lang}`));

        const batches: Message[][] = [];
        let batch: Message[] = [];
        let chars = 0;
        for (const m of todo) {
            if (batch.length && (batch.length >= 6 || chars + m.text.length > 8000)) {
                batches.push(batch);
                batch = [];
                chars = 0;
            }
            batch.push(m);
            chars += m.text.length;
        }
        if (batch.length) batches.push(batch);

        (async () => {
            setTranslatingChat(true);
            for (const part of batches) {
                try {
                    const { translations: got } = await translateMessages(
                        lang,
                        part.map((m) => ({ id: m.id, text: m.text.slice(0, 8000) }))
                    );
                    for (const m of part) translationCache[`${m.id}|${lang}`] = got[m.id] ?? m.text;
                    if (mountedRef.current) setTranslations({ ...translationCache });
                } catch {
                    // Leave these in the original language; try again on the next language change.
                    part.forEach((m) => requestedTranslations.delete(`${m.id}|${lang}`));
                }
            }
            if (mountedRef.current) setTranslatingChat(false);
        })();
    }, [responseLang, messages]);

    /** The text to show for a message in the current language. */
    const displayText = (m: Message) => {
        if (m.noticeKey) return b[m.noticeKey];
        if (showOriginal.has(m.id)) return m.text;
        return translations[`${m.id}|${responseLang}`] ?? m.text;
    };
    const isTranslated = (m: Message) =>
        !m.noticeKey && translations[`${m.id}|${responseLang}`] !== undefined &&
        translations[`${m.id}|${responseLang}`] !== m.text;

    const toggleOriginal = (id: string) =>
        setShowOriginal((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    // ── Export ────────────────────────────────────────────────────────
    /**
     * whatsapp: *bold* for WhatsApp · plain: no formatting marks ·
     * markdown: for the preview on screen (shown with real bold).
     */
    const buildExport = (list: Message[], style: "whatsapp" | "plain" | "markdown") => {
        const bold = (t: string) => (style === "whatsapp" ? `*${t}*` : style === "markdown" ? `**${t}**` : t);
        const body = (t: string) => (style === "markdown" ? t : toPlainText(t, style === "whatsapp"));
        const lines = [`⚖️ ${b.exportHeader}`, new Date().toLocaleDateString(), ""];
        for (const m of list) {
            if (m.isError) continue;
            lines.push(bold(`${m.role === "user" ? b.exportYou : b.exportBot}:`));
            lines.push(body(displayText(m)));
            if (m.sources?.length) {
                lines.push(`${b.exportSources}:`);
                m.sources.forEach((src) => lines.push(`[${src.id}] ${src.title} – ${src.url}`));
            }
            lines.push("");
        }
        lines.push(b.disclaimerFooter);
        return lines.join("\n");
    };

    const openExport = (list: Message[]) => {
        setCopied(false);
        setExportList(list);
    };

    /** The question before an answer + the answer itself. */
    const pairFor = (msg: Message) => {
        const i = messages.findIndex((m) => m.id === msg.id);
        const q = [...messages.slice(0, i)].reverse().find((m) => m.role === "user");
        return q ? [q, msg] : [msg];
    };

    const shareWhatsApp = () => {
        if (!exportList) return;
        Linking.openURL(`https://wa.me/?text=${encodeURIComponent(buildExport(exportList, "whatsapp"))}`);
        setExportList(null);
    };

    const copyText = async (text: string) => {
        try {
            await Clipboard.setStringAsync(text);
            return true;
        } catch {
            showAlert(b.copyText, text);
            return false;
        }
    };

    const copyExport = async () => {
        if (exportList && (await copyText(buildExport(exportList, "plain")))) setCopied(true);
    };

    const shareOther = async () => {
        if (!exportList) return;
        // Browsers without a share menu (most computers): copy instead.
        if (Platform.OS === "web" && !(navigator as any).share) {
            await copyExport();
            return;
        }
        try {
            await Share.share({ message: buildExport(exportList, "plain") });
            setExportList(null);
        } catch {
            // closed the share sheet
        }
    };

    /** Copies one answer (with its sources) from the chat. */
    const copyAnswer = async (msg: Message) => {
        const lines = [toPlainText(displayText(msg), false)];
        if (msg.sources?.length) {
            lines.push("", `${b.exportSources}:`);
            msg.sources.forEach((src) => lines.push(`[${src.id}] ${src.title} – ${src.url}`));
        }
        if (await copyText(lines.join("\n"))) {
            setCopiedId(msg.id);
            setTimeout(() => setCopiedId((id) => (id === msg.id ? null : id)), 2000);
        }
    };

    const acceptDisclaimer = async () => {
        setDisclaimerVisible(false);
        if (user) {
            try {
                setUser((await updateMe({ disclaimerVersion: DISCLAIMER_VERSION })).user);
            } catch {
                // Shown again next time; not worth bothering the user now.
            }
        } else {
            await setItem(GUEST_DISCLAIMER_KEY, String(DISCLAIMER_VERSION));
        }
    };

    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            recordingRef.current?.stopAndUnloadAsync().catch(() => {});
        };
    }, []);

    // ── Upload contract ───────────────────────────────────────────────
    const onUploaded = async (res: { contractToken: string | null; contract: ContractInfo }) => {
        if (user) {
            setContract(res.contract);
        } else if (res.contractToken) {
            await saveContractToken(res.contractToken);
            setGuestToken(res.contractToken);
            setContract(res.contract);
        }
        setShowSummary(true);
        addNotice("contractReady");
        scrollToEnd();
    };

    const uploadErrorText = (err: any) => {
        if (err?.code === "tooLarge" || err?.status === 413) return b.errTooLarge;
        return err?.status ? err.message : b.errUpload;
    };

    const sendFiles = async (files: ContractFile[]) => {
        if (files.reduce((n, f) => n + approxBytes(f.base64), 0) > MAX_UPLOAD_BYTES) {
            showAlert(b.errTooLarge);
            return;
        }
        setIsUploading(true);
        scrollToEnd();
        try {
            await onUploaded(await uploadContractFile(files, guestToken ?? undefined));
        } catch (err: any) {
            addBotMessage(`⚠ ${uploadErrorText(err)}`, true);
        } finally {
            setIsUploading(false);
        }
    };

    const assetsToFiles = async (
        assets: { uri: string; base64?: string | null; mimeType?: string | null; fileName?: string | null; name?: string }[]
    ): Promise<ContractFile[]> =>
        Promise.all(
            assets.map(async (a) => ({
                base64: a.base64 || (await uriToBase64(a.uri)),
                mimeType: a.mimeType ?? undefined,
                name: a.fileName ?? a.name ?? undefined,
            }))
        );

    const handleTakePhoto = async () => {
        setUploadMenuVisible(false);
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                showAlert("Camera", "Please allow camera access in Settings so CareConnect can photograph your contract.");
                return;
            }
            const result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
            if (result.canceled || !result.assets?.length) return;
            await sendFiles(await assetsToFiles(result.assets));
        } catch (err: any) {
            showAlert("Camera", err?.message ?? b.errUpload);
        }
    };

    const handleChoosePhotos = async () => {
        setUploadMenuVisible(false);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsMultipleSelection: true,
                selectionLimit: MAX_PHOTOS,
                orderedSelection: true,
                quality: 0.5,
                base64: true,
            });
            if (result.canceled || !result.assets?.length) return;
            if (result.assets.length > MAX_PHOTOS) {
                showAlert(b.errTooManyPhotos);
                return;
            }
            await sendFiles(await assetsToFiles(result.assets));
        } catch (err: any) {
            showAlert("Photos", err?.message ?? b.errUpload);
        }
    };

    // Opens the phone's file chooser, which also lists Google Drive / iCloud
    // when those apps are installed.
    const handleChooseFile = async () => {
        setUploadMenuVisible(false);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: FILE_TYPES,
                multiple: false,
                copyToCacheDirectory: true,
            });
            if (result.canceled || !result.assets?.length) return;
            const asset = result.assets[0];
            if (asset.size && asset.size > MAX_UPLOAD_BYTES) {
                showAlert(b.errTooLarge);
                return;
            }
            await sendFiles(await assetsToFiles([asset]));
        } catch (err: any) {
            showAlert("Files", err?.message ?? b.errUpload);
        }
    };

    const handleUploadText = async () => {
        const trimmed = contractText.trim();
        if (!trimmed) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const res = await uploadContract({
                contractText: trimmed,
                contractToken: guestToken ?? undefined,
            });
            setPasteVisible(false);
            setContractText("");
            await onUploaded(res);
        } catch (err: any) {
            setUploadError(uploadErrorText(err));
        } finally {
            setIsUploading(false);
        }
    };

    // ── Remove contract ───────────────────────────────────────────────
    const handleRemoveContract = async () => {
        if (!contractUploaded) return;
        if (!(await confirmAction(`${t.removeContract}?`, t.removeContract, b.cancel))) return;
        try {
            await deleteContract(user ? undefined : guestToken ?? undefined);
        } catch (err: any) {
            showAlert("Error", err?.message ?? "Could not remove the contract. Please try again.");
            return;
        }
        await clearContractToken();
        setGuestToken(null);
        setContract(null);
        addNotice("contractDeleted");
    };

    // ── Clear chat ────────────────────────────────────────────────────
    const handleClearChat = async () => {
        if (!(await confirmAction(b.clearChatConfirm, b.clearChat, b.cancel))) return;
        try {
            if (user) await clearLegalHistory();
            setMessages([]);
        } catch (err: any) {
            showAlert("Error", err?.message ?? b.errAsk);
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
            lang: responseLang,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText("");
        setIsSending(true);

        // Scroll to bottom
        scrollToEnd();

        try {
            const res: LegalAskResponse = await legalAsk({
                question: trimmed,
                language: responseLang,
                contractToken: user ? undefined : guestToken ?? undefined,
            });

            // The server no longer has the contract (expired or deleted).
            if (contractUploaded && !res.contractAvailable) {
                await clearContractToken();
                setGuestToken(null);
                setContract(null);
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                text: res.answer,
                sources: res.sources,
                lang: res.language,
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err: any) {
            addBotMessage(`⚠ ${err?.status ? err.message : b.errAsk}`, true);
        } finally {
            setIsSending(false);
            scrollToEnd(100);
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
                showAlert(
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
            showAlert("Recording Error", err?.message ?? "Could not start microphone.");
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

            const base64 = await uriToBase64(uri);
            const mimeType = Platform.OS === "web" ? "audio/webm" : "audio/m4a";

            // Transcribe audio via translation endpoint (returns transcribed text).
            // Not saved to the translator's history.
            const transcribed = await translateText({
                audioBase64: base64,
                audioMimeType: mimeType,
                targetLanguage: responseLang,
                save: false,
            });

            // Use the transcribed text as the message
            if (transcribed.translatedText) {
                await sendMessage(transcribed.translatedText);
            }
        } catch (err: any) {
            showAlert("Voice Error", err?.message ?? "Could not process the recording.");
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

    const openCitation = (sources: LegalSource[] | undefined, id: number) => {
        const src = sources?.find((x) => x.id === id);
        if (src) Linking.openURL(src.url);
    };

    const summary = contract?.summary?.[lang] ?? null;
    const summaryRows = summary ? SUMMARY_FIELDS.filter((f) => summary[f]) : [];

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
                    <View style={s.headingRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.heading}>{t.assistantHeading}</Text>
                            <Text style={[s.subheading, { marginTop: 2 }]}>{t.assistantSub}</Text>
                        </View>
                        {messages.length > 0 && (
                            <View style={s.headerActions}>
                                <Pressable onPress={() => openExport(messages)} hitSlop={8} style={s.clearChatBtn}>
                                    <Text style={s.clearChatText}>📤 {b.exportChat}</Text>
                                </Pressable>
                                <Pressable onPress={handleClearChat} hitSlop={8} style={s.clearChatBtn}>
                                    <Text style={s.clearChatText}>🗑 {b.clearChat}</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {!user && <Text style={s.guestNote}>{b.guestChatNote}</Text>}

                    {/* Upload contract card (hidden once uploaded) */}
                    {!contractUploaded && (
                        <Pressable
                            style={s.uploadCard}
                            onPress={() => {
                                setUploadError(null);
                                setUploadMenuVisible(true);
                            }}
                            disabled={isUploading}
                        >
                            <View style={s.uploadIconCircle}>
                                <Text style={s.uploadIconEmoji}>📄</Text>
                            </View>
                            <Text style={s.uploadTitle}>{t.uploadTitle}</Text>
                            <Text style={s.uploadDesc}>{t.uploadDesc}</Text>
                        </Pressable>
                    )}

                    {/* Uploaded badge + summary */}
                    {contractUploaded && (
                        <View style={s.contractCard}>
                            <View style={s.contractCardHeader}>
                                <View style={s.uploadedBadge}>
                                    <Text style={s.uploadedText}>
                                        {t.contractUploaded}
                                        {contract?.fileName ? ` · ${contract.fileName}` : ""}
                                    </Text>
                                </View>
                                <Pressable onPress={() => setUploadMenuVisible(true)} hitSlop={8} disabled={isUploading}>
                                    <Text style={s.linkText}>{b.replaceContract}</Text>
                                </Pressable>
                            </View>

                            {contract && (
                                <Pressable onPress={() => setShowSummary((v) => !v)} hitSlop={6}>
                                    <Text style={s.linkText}>
                                        {showSummary ? `▾ ${b.hideSummary}` : `▸ ${b.summaryTitle}`}
                                    </Text>
                                </Pressable>
                            )}

                            {contract && showSummary && (
                                <View style={s.summaryBox}>
                                    {summary ? (
                                        <>
                                            <Text style={s.summaryTitle}>{b.summaryTitle}</Text>
                                            {summaryRows.map((f) => (
                                                <View key={f} style={s.summaryRow}>
                                                    <Text style={s.summaryLabel}>{b.fields[f]}</Text>
                                                    <Text style={s.summaryValue}>{summary[f]}</Text>
                                                </View>
                                            ))}
                                            {summary.concerns.length > 0 && (
                                                <View style={s.concernsBox}>
                                                    <Text style={s.concernsTitle}>⚠️ {b.concernsTitle}</Text>
                                                    {summary.concerns.map((c, i) => (
                                                        <Text key={i} style={s.concernText}>• {c}</Text>
                                                    ))}
                                                </View>
                                            )}
                                        </>
                                    ) : (
                                        <Text style={s.summaryValue}>{b.summaryUnavailable}</Text>
                                    )}
                                </View>
                            )}

                            <View style={s.contractWarning}>
                                <Text style={s.contractWarningText}>{t.contractStoredNote}</Text>
                                <Pressable onPress={handleRemoveContract} hitSlop={8}>
                                    <Text style={s.removeContractText}>{t.removeContract}</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {loadingHistory && <ActivityIndicator color={Color.endeavour} />}
                    {translatingChat && (
                        <View style={s.translatingRow}>
                            <ActivityIndicator size="small" color={Color.endeavour} />
                            <Text style={s.translatingText}>{b.translatingChat}</Text>
                        </View>
                    )}

                    {/* Empty state before any message */}
                    {messages.length === 0 && !loadingHistory && (
                        <View style={s.emptyState}>
                            <Text style={s.emptyEmoji}>⚖️</Text>
                            <Text style={s.emptyText}>
                                {contractUploaded ? b.emptyWithContract : b.emptyNoContract}
                            </Text>
                            <View style={s.suggestions}>
                                {b.suggestions.map((q) => (
                                    <Pressable key={q} style={s.suggestionChip} onPress={() => sendMessage(q)}>
                                        <Text style={s.suggestionText}>{q}</Text>
                                    </Pressable>
                                ))}
                            </View>
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
                                    {msg.role === "assistant" ? (
                                        <MarkdownText
                                            style={s.botText}
                                            citationStyle={s.citation}
                                            onCitation={
                                                msg.sources?.length
                                                    ? (id) => openCitation(msg.sources, id)
                                                    : undefined
                                            }
                                        >
                                            {displayText(msg)}
                                        </MarkdownText>
                                    ) : (
                                        <Text style={s.userText}>{displayText(msg)}</Text>
                                    )}
                                    {!!msg.sources?.length && (
                                        <View style={s.sourcesBox}>
                                            <Text style={s.sourcesLabel}>{t.sourcesLabel}</Text>
                                            {msg.sources.map((src) => (
                                                <Text
                                                    key={src.id}
                                                    style={s.sourceLink}
                                                    onPress={() => Linking.openURL(src.url)}
                                                >
                                                    [{src.id}] {src.title}
                                                </Text>
                                            ))}
                                        </View>
                                    )}
                                    {(isTranslated(msg) || (msg.role === "assistant" && !msg.isError && !msg.noticeKey)) && (
                                        <View style={s.msgActions}>
                                            {isTranslated(msg) && (
                                                <Pressable onPress={() => toggleOriginal(msg.id)} hitSlop={6}>
                                                    <Text style={s.msgActionText}>
                                                        🌐 {showOriginal.has(msg.id) ? b.showTranslation : b.showOriginal}
                                                    </Text>
                                                </Pressable>
                                            )}
                                            {msg.role === "assistant" && !msg.isError && !msg.noticeKey && (
                                                <>
                                                    <Pressable onPress={() => openExport(pairFor(msg))} hitSlop={6}>
                                                        <Text style={s.msgActionText}>↗ {b.shareAnswer}</Text>
                                                    </Pressable>
                                                    <Pressable onPress={() => copyAnswer(msg)} hitSlop={6}>
                                                        <Text style={s.msgActionText}>
                                                            📋 {copiedId === msg.id ? b.copied : b.copyShort}
                                                        </Text>
                                                    </Pressable>
                                                </>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}

                        {/* Typing / reading indicator */}
                        {(isSending || isUploading) && (
                            <View style={[s.messageBubble, s.botBubble]}>
                                <View style={s.botAvatarRow}>
                                    <View style={s.botAvatar}>
                                        <Text style={s.botAvatarIcon}>✦</Text>
                                    </View>
                                </View>
                                <View style={[s.botTextWrap, s.typingRow]}>
                                    <ActivityIndicator
                                        size="small"
                                        color={Color.endeavour}
                                    />
                                    {isUploading && <Text style={s.botText}>{b.readingContract}</Text>}
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
                <View style={s.inputArea}>
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
                    {/* Permanent, short disclaimer instead of one in every answer */}
                    <Pressable onPress={() => setDisclaimerVisible(true)} hitSlop={4}>
                        <Text style={s.disclaimerFooter}>{b.disclaimerFooter}</Text>
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

            {/* ── "Where is your contract?" menu ── */}
            <Modal
                visible={uploadMenuVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setUploadMenuVisible(false)}
            >
                <View style={s.modalOverlay}>
                    {/* Tapping the dark area closes the menu */}
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setUploadMenuVisible(false)} />
                    <View style={s.modalSheet}>
                        <View style={s.handleBar} />
                        <Text style={s.modalTitle}>{b.uploadMenuTitle}</Text>
                        {[
                            { icon: "📷", label: b.takePhoto, onPress: handleTakePhoto },
                            { icon: "🖼", label: b.choosePhotos, onPress: handleChoosePhotos },
                            { icon: "📁", label: b.chooseFile, onPress: handleChooseFile },
                            {
                                icon: "✍️",
                                label: b.pasteText,
                                onPress: () => {
                                    setUploadMenuVisible(false);
                                    setUploadError(null);
                                    setPasteVisible(true);
                                },
                            },
                        ].map((o) => (
                            <Pressable key={o.label} style={s.menuOption} onPress={o.onPress}>
                                <Text style={s.menuOptionIcon}>{o.icon}</Text>
                                <Text style={s.menuOptionText}>{o.label}</Text>
                            </Pressable>
                        ))}
                        <Pressable style={s.cancelBtn} onPress={() => setUploadMenuVisible(false)}>
                            <Text style={s.cancelText}>{b.cancel}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* ── Paste contract modal ── */}
            <Modal
                visible={pasteVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setPasteVisible(false)}
            >
                {/* No full-screen touch handler here: on the web it took the focus
                    away from the text box, so nothing could be typed or pasted. */}
                <View style={s.modalOverlay}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss}
                    />
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={s.modalSheet}
                    >
                        <View style={s.handleBar} />

                        <Text style={s.modalTitle}>{b.pasteTitle}</Text>
                        <Text style={s.modalSubtitle}>{b.pasteSub}</Text>

                        <TextInput
                            style={s.contractInput}
                            placeholder={b.pastePh}
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
                                onPress={() => setPasteVisible(false)}
                            >
                                <Text style={s.cancelText}>{b.cancel}</Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    s.uploadBtn,
                                    (!contractText.trim() || isUploading) && s.uploadBtnDisabled,
                                ]}
                                onPress={handleUploadText}
                                disabled={!contractText.trim() || isUploading}
                            >
                                {isUploading ? (
                                    <ActivityIndicator color={Color.white} size="small" />
                                ) : (
                                    <Text style={s.uploadBtnText}>{b.uploadBtn}</Text>
                                )}
                            </Pressable>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            {/* ── Export / share chat ── */}
            <Modal
                visible={exportList !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setExportList(null)}
            >
                <View style={s.modalOverlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setExportList(null)} />
                    <View style={s.modalSheet}>
                        <View style={s.handleBar} />
                        <Text style={s.modalTitle}>{b.exportTitle}</Text>
                        <ScrollView style={s.exportPreview}>
                            {exportList && (
                                <MarkdownText style={s.exportPreviewText}>
                                    {buildExport(exportList, "markdown")}
                                </MarkdownText>
                            )}
                        </ScrollView>
                        <Pressable style={s.menuOption} onPress={shareWhatsApp}>
                            <Text style={s.menuOptionIcon}>💬</Text>
                            <Text style={s.menuOptionText}>{b.shareWhatsApp}</Text>
                        </Pressable>
                        <Pressable style={s.menuOption} onPress={shareOther}>
                            <Text style={s.menuOptionIcon}>📤</Text>
                            <Text style={s.menuOptionText}>{b.shareOther}</Text>
                        </Pressable>
                        <Pressable style={s.menuOption} onPress={copyExport}>
                            <Text style={s.menuOptionIcon}>📋</Text>
                            <Text style={s.menuOptionText}>{copied ? b.copied : b.copyText}</Text>
                        </Pressable>
                        <Pressable style={s.cancelBtn} onPress={() => setExportList(null)}>
                            <Text style={s.cancelText}>{b.cancel}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* ── Disclaimer (first visit, or after its text changed) ── */}
            <Modal visible={disclaimerVisible} transparent animationType="fade" onRequestClose={acceptDisclaimer}>
                <View style={s.centerOverlay}>
                    <View style={s.dialog}>
                        <Text style={s.dialogIcon}>⚖️</Text>
                        <Text style={s.modalTitle}>{b.disclaimerTitle}</Text>
                        <Text style={s.dialogBody}>{b.disclaimerBody}</Text>
                        <Pressable style={s.dialogBtn} onPress={acceptDisclaimer}>
                            <Text style={s.uploadBtnText}>{b.disclaimerAccept}</Text>
                        </Pressable>
                    </View>
                </View>
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
    sourcesBox: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: Color.silver,
        gap: 4,
    },
    sourcesLabel: { fontSize: 12, fontWeight: "700", color: Color.mako },
    sourceLink: { fontSize: 12, color: Color.endeavour, textDecorationLine: "underline" },
    removeContractText: {
        marginTop: 6,
        fontSize: 12,
        fontWeight: "700",
        color: Color.errorText,
        textDecorationLine: "underline",
    },
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

    // ── Contract card & summary ──────────────────────────────────────
    headingRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    clearChatBtn: { paddingVertical: 4 },
    clearChatText: { fontSize: 12, color: Color.mako, fontWeight: "600" },
    guestNote: { fontSize: 12, color: Color.mako, fontStyle: "italic", marginTop: -8 },
    contractCard: { gap: 8 },
    contractCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
    linkText: { fontSize: 13, color: Color.endeavour, fontWeight: "600" },
    summaryBox: {
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.linkWater,
        padding: 14,
        gap: 8,
    },
    summaryTitle: { fontSize: 15, fontWeight: "700", color: Color.blackPearl },
    summaryRow: { flexDirection: "row", gap: 10 },
    summaryLabel: { width: 110, fontSize: 13, color: Color.mako },
    summaryValue: { flex: 1, fontSize: 13, color: Color.blackPearl, fontWeight: "600", lineHeight: 18 },
    concernsBox: { backgroundColor: "#fff8e1", borderRadius: 8, padding: 10, gap: 4, marginTop: 4 },
    concernsTitle: { fontSize: 13, fontWeight: "700", color: "#e65100" },
    concernText: { fontSize: 13, color: Color.blackPearl, lineHeight: 18 },
    suggestions: { gap: 8, alignSelf: "stretch", marginTop: 4 },
    suggestionChip: {
        borderWidth: 1,
        borderColor: Color.linkWater,
        backgroundColor: Color.white,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    suggestionText: { fontSize: 13, color: Color.endeavour },
    citation: { color: Color.endeavour, fontWeight: "700", textDecorationLine: "underline" },
    typingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    inputArea: { backgroundColor: Color.white, borderTopWidth: 1, borderTopColor: Color.linkWater, paddingBottom: 6 },
    disclaimerFooter: { fontSize: 11, color: Color.mako, textAlign: "center", paddingHorizontal: 16 },

    headerActions: { flexDirection: "row", gap: 12 },
    translatingRow: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center" },
    translatingText: { fontSize: 12, color: Color.mako },
    msgActions: { flexDirection: "row", gap: 14, marginTop: 8, flexWrap: "wrap" },
    msgActionText: { fontSize: 12, color: Color.endeavour, fontWeight: "600" },
    exportPreview: {
        maxHeight: 180,
        backgroundColor: Color.aliceBlue,
        borderRadius: 12,
        padding: 12,
    },
    exportPreviewText: { fontSize: 12, color: Color.blackPearl, lineHeight: 17 },

    // ── Upload menu ──────────────────────────────────────────────────
    menuOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: Color.aliceBlue,
    },
    menuOptionIcon: { fontSize: 22 },
    menuOptionText: { flex: 1, fontSize: 15, color: Color.blackPearl, fontWeight: "600" },

    // ── Disclaimer dialog ────────────────────────────────────────────
    centerOverlay: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.45)",
        padding: 24,
    },
    dialog: {
        backgroundColor: Color.white,
        borderRadius: 20,
        padding: 24,
        gap: 14,
        maxWidth: 420,
        width: "100%",
        alignItems: "center",
    },
    dialogIcon: { fontSize: 36 },
    dialogBody: { fontSize: 14, color: Color.blackPearl, lineHeight: 21, textAlign: "center" },
    dialogBtn: {
        alignSelf: "stretch",
        backgroundColor: Color.endeavour,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
});
