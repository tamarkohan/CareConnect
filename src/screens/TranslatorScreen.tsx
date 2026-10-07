import * as React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    TextInput,
    Modal,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { showAlert, uriToBase64, mimeFromDataUri, confirmAction } from "../api/platform";
import TopBar from "../components/TopBar";
import { useApp } from "../AppContext";
import { T, LangCode, formatRelativeTime } from "../translations";
import { BOT_T } from "../botStrings";
import {
    translateText,
    TranslateResponse,
    SavedTranslation,
    getTranslationHistory,
    clearTranslationHistory,
} from "../api/client";

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
    yellowType: "#e6a817",
    greenScan: "#4caf50",

    // Tag colors
    medicalBg: "#e8f5e9",
    medicalText: "#2e7d32",
    slanBg: "#fff3e0",
    slanText: "#e65100",
    transitBg: "#e3f2fd",
    transitText: "#1565c0",

    errorBg: "#ffebee",
    errorText: "#c62828",

    // Recording state
    recordingBg: "#ffebee",
    recordingText: "#c62828",
    recordingPulse: "#ef5350",
};

// ── Nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { labelKey: "navHome" as const, emoji: "🏠", screen: "Home" },
    { labelKey: "navTranslator" as const, emoji: "🔤", screen: "Translator", active: true },
    { labelKey: "navAssistant" as const, emoji: "⚖️", screen: "Assistant" },
    { labelKey: "navCommunity" as const, emoji: "👥", screen: "Community" },
    { labelKey: "navTasks" as const, emoji: "📋", screen: "Tasks" },
    { labelKey: "navJournal" as const, emoji: "📓", screen: "Journal" },
];

// ── Translation history data model ────────────────────────────────────
type TranslationCategory = "medical" | "slang" | "transit";

const CATEGORY_STYLE: Record<TranslationCategory, { bg: string; text: string }> = {
    medical: { bg: Color.medicalBg, text: Color.medicalText },
    slang: { bg: Color.slanBg, text: Color.slanText },
    transit: { bg: Color.transitBg, text: Color.transitText },
};

const CATEGORY_LABEL_KEY: Record<TranslationCategory, "catMedical" | "catSlang" | "catTransit"> = {
    medical: "catMedical",
    slang: "catSlang",
    transit: "catTransit",
};

type TranslationEntry = {
    id: string;
    category?: TranslationCategory;
    tag?: string;
    tagBg?: string;
    tagText?: string;
    timestamp: number;
    hebrewText: string;
    phonetic?: Record<LangCode, string> | string;
    translated: Record<LangCode, string> | string;
    note?: Partial<Record<LangCode, string>> | string;
    /** Other likely meanings when the text was ambiguous. */
    alternatives?: { language: string; meaning: string }[];
};

const SEED_TRANSLATIONS: TranslationEntry[] = [
    {
        id: "1",
        category: "medical",
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        hebrewText: "לקחת פעמיים ביום אחרי האוכל",
        phonetic: {
            en: "Lakachat pa'amayim bayom acharei ha'ochel",
            tl: "Lakachat pa'amayim bayom acharei ha'ochel",
            ml: "ലകാഹത് പഅമായിം ബയോം അഹറേയ് ഹാഓഹെൽ",
            ru: "Лакахат паамаим баём ахарей аохель",
        },
        translated: {
            en: "Take twice a day after meals.",
            tl: "Inumin nang dalawang beses sa isang araw pagkatapos kumain.",
            ml: "ഭക്ഷണത്തിന് ശേഷം ദിവസത്തിൽ രണ്ടു തവണ കഴിക്കുക.",
            ru: "Принимайте два раза в день после еды.",
        },
    },
    {
        id: "2",
        category: "slang",
        timestamp: Date.now() - 26 * 60 * 60 * 1000,
        hebrewText: "הוא היום קצת סחוט",
        phonetic: {
            en: "Hu hayom ktzat sachut",
            tl: "Hu hayom ktzat sachut",
            ml: "ഹു ഹയോം ക്റ്റാറ്റ് സഹൂത്",
            ru: "Ху хайом ктцат сахут",
        },
        translated: {
            en: "He's a bit exhausted today.",
            tl: "Medyo pagod siya ngayon.",
            ml: "അവന് ഇന്ന് അല്പം ക്ഷീണിതനാണ്.",
            ru: "Он сегодня немного вымотан.",
        },
        note: {
            en: "(Lit: he is wrung out)",
            tl: "(Literal: siya ay pinigain)",
            ml: "(അക്ഷരാർത്ഥത്തിൽ: അവൻ പിഴിഞ്ഞെടുത്തു)",
            ru: "(Букв.: он выжат)",
        },
    },
    {
        id: "3",
        category: "transit",
        timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
        hebrewText: "תחנה מרכזית",
        phonetic: {
            en: "Tachana Merkazit",
            tl: "Tachana Merkazit",
            ml: "തഹാന മെർകസീത്",
            ru: "Тахана Мерказит",
        },
        translated: {
            en: "Central Station",
            tl: "Sentral na Istasyon",
            ml: "സെൻട്രൽ സ്റ്റേഷൻ",
            ru: "Центральная станция",
        },
    },
];

// ── Language options (must match what backend supports) ──────────────
const TARGET_LANGS = ["Hebrew", "English", "Tagalog", "Malayalam", "Russian"];


/** A translation from the server (or just made) → a card in the list. */
function toEntry(r: TranslateResponse, fallbackSource: string, inputType = "text", targetLanguage = ""): TranslationEntry {
    const category = r.category !== "general" ? r.category : undefined;
    const prefix = inputType === "image" ? "📷 " : inputType === "audio" ? "🎤 " : "";
    return {
        id: r.id ?? Date.now().toString(),
        category,
        tag: category ? undefined : `${prefix}${r.detectedLanguage} → ${targetLanguage}`,
        timestamp: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
        hebrewText: r.sourceText || fallbackSource,
        phonetic: r.phonetic || undefined,
        translated: r.translatedText,
        note: r.note || undefined,
        alternatives: r.alternatives?.length ? r.alternatives : undefined,
    };
}

// ── Recording config ─────────────────────────────────────────────────
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
    web: {
        mimeType: "audio/webm",
        bitsPerSecond: 128000,
    },
};

// ════════════════════════════════════════════════════════════════════
type Props = { navigation?: any };

export default function TranslatorScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { lang, user } = useApp();
    const t = T[lang];
    const b = BOT_T[lang];

    // Guests see examples; signed-in users their own last 10 (kept on the server).
    const [recentTranslations, setRecentTranslations] = React.useState<TranslationEntry[]>(
        user ? [] : SEED_TRANSLATIONS
    );
    const HISTORY_SIZE = 10;

    React.useEffect(() => {
        if (!user) {
            setRecentTranslations(SEED_TRANSLATIONS);
            return;
        }
        let cancelled = false;
        getTranslationHistory()
            .then(({ translations }) => {
                if (cancelled) return;
                setRecentTranslations(
                    translations.map((x: SavedTranslation) => toEntry(x, "", x.inputType, x.targetLanguage))
                );
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    /** Adds a new translation at the top, keeping only as many as the user wants. */
    const addEntry = (entry: TranslationEntry) =>
        setRecentTranslations((prev) => [entry, ...prev].slice(0, user ? HISTORY_SIZE : prev.length + 1));

    const handleClearHistory = async () => {
        if (!(await confirmAction(b.clearHistoryConfirm, b.clearHistory, b.cancel))) return;
        try {
            await clearTranslationHistory();
            setRecentTranslations([]);
        } catch (err: any) {
            showAlert("Error", err?.message);
        }
    };

    // ── Translate modal state ─────────────────────────────────────────
    const [modalVisible, setModalVisible] = React.useState(false);
    const [inputText, setInputText] = React.useState("");
    const [targetLang, setTargetLang] = React.useState("English");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // ── Image scan state ──────────────────────────────────────────────
    const [scanLoading, setScanLoading] = React.useState(false);

    // ── Voice recording state ─────────────────────────────────────────
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordingLoading, setRecordingLoading] = React.useState(false);
    const [recordingSeconds, setRecordingSeconds] = React.useState(0);
    const recordingRef = React.useRef<Audio.Recording | null>(null);
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

    // Clean up recording on unmount
    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            recordingRef.current?.stopAndUnloadAsync().catch(() => {});
        };
    }, []);

    const openModal = () => {
        setInputText("");
        setError(null);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setLoading(false);
        setError(null);
    };

    const handleTranslate = async () => {
        const trimmed = inputText.trim();
        if (!trimmed) return;

        setLoading(true);
        setError(null);

        try {
            const result: TranslateResponse = await translateText({
                text: trimmed,
                targetLanguage: targetLang,
                readerLanguage: lang,
            });

            addEntry(toEntry(result, trimmed, "text", targetLang));
            closeModal();
        } catch (err: any) {
            setError(err?.message ?? "Translation failed. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    // ── 📷 Scan Photo handler ─────────────────────────────────────────
    const handleScanPhoto = async () => {
        if (scanLoading) return;

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                showAlert(
                    "Permission Required",
                    "Please allow photo library access in Settings so CareConnect can scan images for translation."
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
                base64: true,
            });

            if (result.canceled || !result.assets?.length) return;

            const asset = result.assets[0];
            let base64 = asset.base64 ?? null;

            // Fall back to reading from URI if base64 not provided inline
            if (!base64 && asset.uri) {
                base64 = await uriToBase64(asset.uri);
            }

            if (!base64) {
                showAlert("Error", "Could not read the selected image. Please try another.");
                return;
            }

            setScanLoading(true);

            const translated = await translateText({
                imageBase64: base64,
                imageMimeType: asset.mimeType ?? mimeFromDataUri(asset.uri) ?? "image/jpeg",
                targetLanguage: targetLang,
                readerLanguage: lang,
            });

            addEntry(toEntry(translated, b.fromPhoto, "image", targetLang));
        } catch (err: any) {
            showAlert("Scan Failed", err?.message ?? "Could not process the image. Is the backend running?");
        } finally {
            setScanLoading(false);
        }
    };

    // ── 🎤 Voice recording handlers ───────────────────────────────────
    const startRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== "granted") {
                showAlert(
                    "Microphone Required",
                    "Please allow microphone access in Settings so CareConnect can record your voice for translation."
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
            setRecordingSeconds(0);

            timerRef.current = setInterval(() => {
                setRecordingSeconds((s) => s + 1);
            }, 1000);
        } catch (err: any) {
            showAlert("Recording Error", err?.message ?? "Could not start microphone. Please try again.");
        }
    };

    const stopRecordingAndTranslate = async () => {
        if (!recordingRef.current) return;

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsRecording(false);
        setRecordingLoading(true);

        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;

            if (!uri) throw new Error("No recording URI returned.");

            const base64 = await uriToBase64(uri);

            const mimeType = Platform.OS === "web" ? "audio/webm" : "audio/m4a";

            const result = await translateText({
                audioBase64: base64,
                audioMimeType: mimeType,
                targetLanguage: targetLang,
                readerLanguage: lang,
            });

            addEntry(toEntry(result, b.fromVoice, "audio", targetLang));
        } catch (err: any) {
            showAlert("Translation Failed", err?.message ?? "Could not translate the recording. Is the backend running?");
        } finally {
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
            setRecordingLoading(false);
            setRecordingSeconds(0);
        }
    };

    const handleMicPress = () => {
        if (recordingLoading) return;
        if (isRecording) {
            stopRecordingAndTranslate();
        } else {
            startRecording();
        }
    };

    const formatSeconds = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <View style={[s.root, { paddingTop: insets.top }]}>
            {/* ── Top bar ── */}
            <TopBar title={t.navTranslator} navigation={navigation} />

            {/* ── Content ── */}
            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Heading */}
                <Text style={s.heading}>{t.translatorHeading}</Text>
                <Text style={s.subheading}>{t.translatorSub}</Text>

                {/* Info card */}
                <View style={s.infoCard}>
                    <Text style={s.infoIcon}>ℹ</Text>
                    <View style={s.infoContent}>
                        <Text style={s.infoTitle}>{t.infoCardText}</Text>
                        <Text style={s.infoHighlight}>{t.infoCardHighlight}</Text>
                    </View>
                </View>

                {/* Input modes */}
                <View style={s.inputModes}>
                    {/* 🎤 Speak */}
                    <Pressable
                        style={[
                            s.mode,
                            s.modeMic,
                            (isRecording || recordingLoading) && s.modeMicActive,
                        ]}
                        onPress={handleMicPress}
                        disabled={recordingLoading}
                    >
                        {recordingLoading ? (
                            <ActivityIndicator color={Color.white} size="small" />
                        ) : (
                            <Text style={s.modeEmoji}>{isRecording ? "⏹" : "🎤"}</Text>
                        )}
                        <Text
                            style={s.modeLabel}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            {recordingLoading
                                ? "Processing…"
                                : isRecording
                                ? `Stop  ${formatSeconds(recordingSeconds)}`
                                : t.speakTranslate}
                        </Text>
                    </Pressable>

                    {/* ✏️ Write */}
                    <Pressable style={[s.mode, s.modeType]} onPress={openModal}>
                        <Text style={s.modeEmoji}>✏</Text>
                        <Text
                            style={[s.modeLabel, { color: Color.blackPearl }]}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            {t.writeAny}
                        </Text>
                    </Pressable>

                    {/* 📷 Scan */}
                    <Pressable
                        style={[s.mode, s.modeScan, scanLoading && { opacity: 0.6 }]}
                        onPress={handleScanPhoto}
                        disabled={scanLoading}
                    >
                        {scanLoading ? (
                            <ActivityIndicator color={Color.white} size="small" />
                        ) : (
                            <Text style={s.modeEmoji}>📷</Text>
                        )}
                        <Text
                            style={s.modeLabel}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.75}
                        >
                            {scanLoading ? "Scanning…" : t.scanPhoto}
                        </Text>
                    </Pressable>
                </View>

                {/* Target language selector (always visible for scan & voice) */}
                <View>
                    <Text style={s.langRowLabel}>{b.translateInto}</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={s.langRow}
                    >
                        {TARGET_LANGS.map((l) => (
                            <Pressable
                                key={l}
                                style={[s.langChip, targetLang === l && s.langChipActive]}
                                onPress={() => setTargetLang(l)}
                            >
                                <Text style={[s.langChipText, targetLang === l && s.langChipTextActive]}>
                                    {l}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>


                {/* Recording active banner */}
                {isRecording && (
                    <View style={s.recordingBanner}>
                        <View style={s.recordingDot} />
                        <Text style={s.recordingBannerText}>
                            Recording… {formatSeconds(recordingSeconds)} — tap ⏹ to stop
                        </Text>
                    </View>
                )}

                {/* Recent translations / history */}
                {user && recentTranslations.length > 0 && (
                    <Pressable onPress={handleClearHistory} hitSlop={8} style={s.clearBtn}>
                        <Text style={s.clearText}>🗑 {b.clearHistory}</Text>
                    </Pressable>
                )}

                {recentTranslations.length > 0 && (
                    <>
                        <Text style={s.recentTitle}>{t.recentTranslations}</Text>
                        {!user && <Text style={s.exampleNote}>{b.exampleNote}</Text>}
                        <View style={s.recentList}>
                            {recentTranslations.map((item) => {
                                let tagBg = Color.transitBg;
                                let tagTextColor = Color.transitText;
                                let tagLabel = "";

                                if (item.category) {
                                    const catStyle = CATEGORY_STYLE[item.category];
                                    tagBg = catStyle.bg;
                                    tagTextColor = catStyle.text;
                                    tagLabel = t[CATEGORY_LABEL_KEY[item.category]];
                                } else if (item.tag) {
                                    tagLabel = item.tag;
                                    if (item.tagBg) tagBg = item.tagBg;
                                    if (item.tagText) tagTextColor = item.tagText;
                                }

                                const original = item.hebrewText;

                                let phonetic: string | undefined = undefined;
                                if (item.phonetic) {
                                    phonetic = typeof item.phonetic === "string"
                                        ? item.phonetic
                                        : item.phonetic[lang];
                                }

                                let translated = "";
                                if (typeof item.translated === "string") {
                                    translated = item.translated;
                                } else {
                                    translated = item.translated[lang];
                                }

                                let note: string | undefined = undefined;
                                if (item.note) {
                                    note = typeof item.note === "string"
                                        ? item.note
                                        : item.note[lang];
                                }

                                return (
                                    <Pressable key={item.id} style={s.recentItem} onPress={() => {}}>
                                        <View style={[s.tag, { backgroundColor: tagBg }]}>
                                            <Text style={[s.tagText, { color: tagTextColor }]}>
                                                {tagLabel}
                                            </Text>
                                            <Text style={s.tagTime}>
                                                {formatRelativeTime(new Date(item.timestamp), lang)}
                                            </Text>
                                        </View>

                                        <Text style={s.originalText}>{original}</Text>

                                        {phonetic ? (
                                            <Text style={s.phoneticText}>{phonetic}</Text>
                                        ) : null}

                                        <View style={s.translatedRow}>
                                            <Text style={s.translatedIcon}>↪</Text>
                                            <View style={s.translatedContent}>
                                                <Text style={s.translatedText}>{translated}</Text>
                                                {note ? (
                                                    <Text style={s.translatedNote}>{note}</Text>
                                                ) : null}
                                                {item.alternatives?.length ? (
                                                    <View style={s.altBox}>
                                                        <Text style={s.altTitle}>{b.alsoMeans}</Text>
                                                        {item.alternatives.map((a, i) => (
                                                            <Text key={i} style={s.altText}>
                                                                • {a.meaning}
                                                                {a.language ? <Text style={s.altLang}> ({a.language})</Text> : null}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                ) : null}
                                            </View>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </>
                )}

                {recentTranslations.length === 0 && (
                    <View style={s.emptyState}>
                        <Text style={s.emptyEmoji}>🔤</Text>
                        <Text style={s.emptyText}>
                            Tap 🎤 to speak, ✏ to type, or 📷 to scan text for translation
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* ── Bottom navigation ── */}
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

            {/* ── Translate modal ── */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeModal}
            >
                {/* No full-screen touch handler: on the web it stole the focus from the text box. */}
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

                            <Text style={s.modalTitle}>{b.translateTitle}</Text>

                            <TextInput
                                style={s.modalInput}
                                placeholder={b.translatePh}
                                placeholderTextColor={Color.silver}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                autoFocus
                                textAlignVertical="top"
                            />

                            <Text style={s.modalLabel}>{b.translateInto}</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={s.langRow}
                            >
                                {TARGET_LANGS.map((l) => (
                                    <Pressable
                                        key={l}
                                        style={[s.langChip, targetLang === l && s.langChipActive]}
                                        onPress={() => setTargetLang(l)}
                                    >
                                        <Text style={[s.langChipText, targetLang === l && s.langChipTextActive]}>
                                            {l}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>


                            {error && (
                                <View style={s.errorBox}>
                                    <Text style={s.errorText}>⚠ {error}</Text>
                                </View>
                            )}

                            <View style={s.modalButtons}>
                                <Pressable style={s.cancelBtn} onPress={closeModal}>
                                    <Text style={s.cancelText}>{b.cancel}</Text>
                                </Pressable>
                                <Pressable
                                    style={[
                                        s.translateBtn,
                                        (!inputText.trim() || loading) && s.translateBtnDisabled,
                                    ]}
                                    onPress={handleTranslate}
                                    disabled={!inputText.trim() || loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={Color.white} size="small" />
                                    ) : (
                                        <Text style={s.translateBtnText}>{b.translateBtn}</Text>
                                    )}
                                </Pressable>
                            </View>
                        </KeyboardAvoidingView>
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
        paddingBottom: 40,
        gap: 16,
    },
    heading: { fontSize: 20, fontWeight: "700", color: Color.blackPearl },
    subheading: { fontSize: 14, color: Color.mako, marginBottom: 4 },
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
    infoIcon: { fontSize: 20, color: "#7b1fa2", marginTop: 2 },
    infoContent: { flex: 1, gap: 8 },
    infoTitle: { fontSize: 13, color: "#6a1b9a", fontWeight: "600", lineHeight: 18 },
    infoHighlight: {
        fontSize: 11,
        color: "#6a1b9a",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    inputModes: { flexDirection: "row", gap: 12, marginVertical: 8 },
    mode: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 4,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 84,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    modeMic: { backgroundColor: Color.blueMic },
    modeMicActive: { backgroundColor: Color.recordingPulse },
    modeType: { backgroundColor: Color.yellowType },
    modeScan: { backgroundColor: Color.greenScan },
    modeEmoji: { fontSize: 22 },
    modeLabel: { fontSize: 12, lineHeight: 15, fontWeight: "600", color: Color.white, textAlign: "center" },
    langRowLabel: { fontSize: 13, fontWeight: "600", color: Color.mako, marginBottom: 6 },
    langRow: { gap: 8, paddingVertical: 2 },
    langChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Color.linkWater,
        backgroundColor: Color.aliceBlue,
    },
    langChipActive: {
        backgroundColor: Color.endeavour,
        borderColor: Color.endeavour,
    },
    langChipText: { fontSize: 13, color: Color.mako, fontWeight: "500" },
    langChipTextActive: { color: Color.white, fontWeight: "700" },
    recordingBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: Color.recordingBg,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    recordingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Color.recordingPulse,
    },
    recordingBannerText: { fontSize: 13, color: Color.recordingText, fontWeight: "500" },
    clearBtn: { alignSelf: "flex-end", marginBottom: -8 },
    altBox: { marginTop: 6, gap: 2 },
    altTitle: { fontSize: 12, fontWeight: "700", color: Color.mako },
    altText: { fontSize: 13, color: Color.blackPearl },
    altLang: { fontSize: 12, color: Color.mako },
    clearText: { fontSize: 12, color: Color.mako, fontWeight: "600" },
    exampleNote: { fontSize: 12, color: Color.mako, fontStyle: "italic", marginTop: -10 },
    recentTitle: { fontSize: 16, fontWeight: "700", color: Color.blackPearl, marginTop: 8 },
    recentList: { gap: 12 },
    recentItem: {
        backgroundColor: Color.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Color.linkWater,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    tag: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        rowGap: 2,
    },
    tagText: { fontSize: 11, fontWeight: "600" },
    tagTime: { fontSize: 10, color: Color.mako },
    originalText: { fontSize: 14, fontWeight: "600", color: Color.blackPearl, lineHeight: 20 },
    phoneticText: { fontSize: 12, color: Color.mako, fontStyle: "italic", lineHeight: 16, marginTop: -2 },
    translatedRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    translatedIcon: { fontSize: 14, color: Color.endeavour, marginTop: 2 },
    translatedContent: { flex: 1, gap: 2 },
    translatedText: { fontSize: 13, color: Color.endeavour, fontWeight: "500", lineHeight: 18 },
    translatedNote: { fontSize: 11, color: Color.mako, fontStyle: "italic" },
    emptyState: { alignItems: "center", paddingVertical: 32, gap: 10 },
    emptyEmoji: { fontSize: 40 },
    emptyText: { fontSize: 14, color: Color.mako, textAlign: "center" },
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
        backgroundColor: Color.silver,
        alignSelf: "center",
        marginBottom: 4,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: Color.blackPearl },
    modalInput: {
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: Color.blackPearl,
        minHeight: 120,
        backgroundColor: Color.aliceBlue,
    },
    modalLabel: { fontSize: 13, fontWeight: "600", color: Color.mako },
    errorBox: {
        backgroundColor: Color.errorBg,
        borderRadius: 8,
        padding: 12,
    },
    errorText: { fontSize: 13, color: Color.errorText },
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
    translateBtn: {
        flex: 2,
        backgroundColor: Color.endeavour,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    translateBtnDisabled: { backgroundColor: Color.silver },
    translateBtnText: { fontSize: 15, color: Color.white, fontWeight: "700" },
});
