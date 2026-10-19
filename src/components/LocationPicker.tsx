// ── LocationPicker.tsx ───────────────────────────────────────────────
// "Where are you now?" on the community map: the user picks a city, town,
// kibbutz, moshav or village – or just the area – and then a neighborhood from
// searchable lists (src/data/israelPlaces.ts, israelLocalities.ts), or types
// the neighborhood when the place has none listed. Search forgives spelling
// (src/data/placeSearch.ts). The choice is remembered on the device for each
// account (another account on the same phone starts with nothing chosen).
// Nothing is sent to the server, except the city on the caregivers list.
import * as React from "react";
import { View, Text, Pressable, Modal, FlatList, TextInput, StyleSheet } from "react-native";
import { useLang } from "../AppContext";
import { LangCode } from "../translations";
import { ISRAEL_PLACES } from "../data/israelPlaces";
import { AREAS, searchPlaces } from "../data/placeSearch";
import { getItem, setItem, removeItem } from "../api/storage";

export type UserLocation = { city: string; neighborhood: string };
// Before, one location was shared by every account on the device; it's dropped.
const OLD_KEY = "careconnect.location";
/** "All of Israel – I'd rather not say": the map shows Israel; others see no city. */
export const ANYWHERE = "Israel";
/** The city others may see: none for "All of Israel" or when nothing is chosen. */
export const sharedCity = (loc: UserLocation | null) => (loc?.city && loc.city !== ANYWHERE ? loc.city : "");
export const sharedNeighborhood = (loc: UserLocation | null) => (sharedCity(loc) ? loc!.neighborhood : "");

const STR: Record<LangCode, Record<"where" | "city" | "neighborhood" | "chooseCity" | "chooseNeighborhood" | "typeNeighborhood" | "search" | "cancel" | "whole" | "area" | "noMatch" | "anywhere" | "anywhereSub", string>> = {
    en: { where: "Where are you now?", city: "City / town", neighborhood: "Neighborhood", chooseCity: "Choose your city", chooseNeighborhood: "Choose your neighborhood", typeNeighborhood: "Type your neighborhood", search: "Search", cancel: "Cancel", whole: "Whole city", area: "Area", noMatch: "No place with this name. Choose the area you are in:", anywhere: "All of Israel – I'd rather not say", anywhereSub: "Others see only your name, no city" },
    tl: { where: "Nasaan ka ngayon?", city: "Lungsod / bayan", neighborhood: "Lugar (neighborhood)", chooseCity: "Piliin ang lungsod mo", chooseNeighborhood: "Piliin ang lugar mo", typeNeighborhood: "I-type ang lugar mo", search: "Hanapin", cancel: "Kanselahin", whole: "Buong lungsod", area: "Rehiyon", noMatch: "Walang lugar na ganitong pangalan. Piliin ang rehiyon kung nasaan ka:", anywhere: "Buong Israel – ayokong sabihin", anywhereSub: "Pangalan mo lang ang makikita ng iba, walang lungsod" },
    ml: { where: "നിങ്ങൾ ഇപ്പോൾ എവിടെയാണ്?", city: "നഗരം / പട്ടണം", neighborhood: "പ്രദേശം", chooseCity: "നിങ്ങളുടെ നഗരം തിരഞ്ഞെടുക്കുക", chooseNeighborhood: "നിങ്ങളുടെ പ്രദേശം തിരഞ്ഞെടുക്കുക", typeNeighborhood: "നിങ്ങളുടെ പ്രദേശം ടൈപ്പ് ചെയ്യുക", search: "തിരയുക", cancel: "റദ്ദാക്കുക", whole: "മുഴുവൻ നഗരം", area: "മേഖല", noMatch: "ഈ പേരിൽ സ്ഥലമില്ല. നിങ്ങൾ ഉള്ള മേഖല തിരഞ്ഞെടുക്കുക:", anywhere: "ഇസ്രായേൽ മുഴുവൻ – പറയാൻ ആഗ്രഹിക്കുന്നില്ല", anywhereSub: "മറ്റുള്ളവർ നിങ്ങളുടെ പേര് മാത്രം കാണും, നഗരം ഇല്ല" },
    ru: { where: "Где вы сейчас?", city: "Город", neighborhood: "Район", chooseCity: "Выберите город", chooseNeighborhood: "Выберите район", typeNeighborhood: "Введите район", search: "Поиск", cancel: "Отмена", whole: "Весь город", area: "Район страны", noMatch: "Места с таким названием нет. Выберите район, где вы находитесь:", anywhere: "Весь Израиль – не хочу указывать", anywhereSub: "Другие увидят только ваше имя, без города" },
    hi: { where: "आप अभी कहाँ हैं?", city: "शहर / कस्बा", neighborhood: "इलाका", chooseCity: "अपना शहर चुनें", chooseNeighborhood: "अपना इलाका चुनें", typeNeighborhood: "अपना इलाका लिखें", search: "खोजें", cancel: "रद्द करें", whole: "पूरा शहर", area: "क्षेत्र", noMatch: "इस नाम की कोई जगह नहीं है। वह क्षेत्र चुनें जहाँ आप हैं:", anywhere: "पूरा इज़राइल – नहीं बताना चाहती/चाहता", anywhereSub: "दूसरों को सिर्फ़ आपका नाम दिखेगा, शहर नहीं" },
    ta: { where: "நீங்கள் இப்போது எங்கே இருக்கிறீர்கள்?", city: "நகரம் / ஊர்", neighborhood: "பகுதி", chooseCity: "உங்கள் நகரத்தைத் தேர்வு செய்யுங்கள்", chooseNeighborhood: "உங்கள் பகுதியைத் தேர்வு செய்யுங்கள்", typeNeighborhood: "உங்கள் பகுதியை எழுதுங்கள்", search: "தேடு", cancel: "ரத்து", whole: "முழு நகரம்", area: "பகுதி (மண்டலம்)", noMatch: "இந்தப் பெயரில் இடம் இல்லை. நீங்கள் இருக்கும் பகுதியைத் தேர்வு செய்யுங்கள்:", anywhere: "முழு இஸ்ரேல் – சொல்ல விரும்பவில்லை", anywhereSub: "மற்றவர்கள் உங்கள் பெயரை மட்டுமே பார்ப்பார்கள், நகரம் இல்லை" },
};

/** The signed-in account's "Where are you now?"; loaded: false until read from the device. */
export function useSavedLocation() {
    const { user } = useLang();
    const key = user ? `careconnect.location.${user.id}` : null;
    const [location, setLocation] = React.useState<UserLocation | null>(null);
    const [loaded, setLoaded] = React.useState(false);
    React.useEffect(() => {
        setLocation(null);
        setLoaded(false);
        removeItem(OLD_KEY);
        if (!key) return;
        let current = true;
        getItem(key).then((v) => {
            if (!current) return;
            try { if (v) setLocation(JSON.parse(v)); } catch { /* ignore a broken value */ }
            setLoaded(true);
        });
        return () => { current = false; };
    }, [key]);
    const save = React.useCallback((loc: UserLocation) => {
        setLocation(loc);
        if (key) setItem(key, JSON.stringify(loc));
    }, [key]);
    return [location, save, loaded] as const;
}

export default function LocationPicker({ value, onChange }: { value: UserLocation | null; onChange: (loc: UserLocation) => void }) {
    const { lang } = useLang();
    const t = STR[lang];
    const anywhere: PickItem = { label: `🇮🇱 ${t.anywhere}`, sub: t.anywhereSub, value: ANYWHERE };
    const [picking, setPicking] = React.useState<"city" | "neighborhood" | null>(null);
    const neighborhoods = ISRAEL_PLACES.find((p) => p.city === value?.city)?.neighborhoods ?? [];
    // Typed neighborhood (for cities without a list), saved when the field is left.
    const [typed, setTyped] = React.useState(value?.neighborhood ?? "");
    React.useEffect(() => setTyped(value?.neighborhood ?? ""), [value?.city, value?.neighborhood]);

    return (
        <View style={s.box}>
            <Text style={s.where}>📍 {t.where}</Text>
            <View style={s.row}>
                <Pressable style={s.select} onPress={() => setPicking("city")} accessibilityRole="button">
                    <Text style={s.selectLabel}>{t.city}</Text>
                    <Text style={[s.selectValue, !value?.city && s.placeholder]} numberOfLines={1}>
                        {value?.city === ANYWHERE ? t.anywhere : value?.city || t.chooseCity}
                    </Text>
                    <Text style={s.caret}>▾</Text>
                </Pressable>
                {value?.city && value.city !== ANYWHERE ? (
                    neighborhoods.length ? (
                        <Pressable style={s.select} onPress={() => setPicking("neighborhood")} accessibilityRole="button">
                            <Text style={s.selectLabel}>{t.neighborhood}</Text>
                            <Text style={[s.selectValue, !value.neighborhood && s.placeholder]} numberOfLines={1}>
                                {value.neighborhood || t.chooseNeighborhood}
                            </Text>
                            <Text style={s.caret}>▾</Text>
                        </Pressable>
                    ) : (
                        <View style={s.select}>
                            <Text style={s.selectLabel}>{t.neighborhood}</Text>
                            <TextInput
                                style={s.input}
                                placeholder={t.typeNeighborhood}
                                value={typed}
                                onChangeText={setTyped}
                                onBlur={() => onChange({ city: value.city, neighborhood: typed.trim() })}
                                onSubmitEditing={() => onChange({ city: value.city, neighborhood: typed.trim() })}
                            />
                        </View>
                    )
                ) : null}
            </View>

            <ListPicker
                visible={picking === "city"}
                title={t.chooseCity}
                search={t.search}
                cancel={t.cancel}
                find={(q) => [
                    // First, for anyone who'd rather not say where they live.
                    ...(q ? [] : [anywhere]),
                    ...searchPlaces(q).map((o) => ({ label: o.label, sub: o.kind === "area" ? `${t.area} · ${o.hebrew}` : o.hebrew })),
                ]}
                noMatch={t.noMatch}
                fallback={[anywhere, ...AREAS.map((o) => ({ label: o.label, sub: `${t.area} · ${o.hebrew}` }))]}
                onChoose={(city) => { onChange({ city, neighborhood: "" }); setPicking(null); }}
                onClose={() => setPicking(null)}
            />
            <ListPicker
                visible={picking === "neighborhood"}
                title={t.chooseNeighborhood}
                search={t.search}
                cancel={t.cancel}
                find={(q) => [t.whole, ...neighborhoods].filter((n) => n.toLowerCase().includes(q.toLowerCase())).map((label) => ({ label }))}
                onChoose={(n) => { onChange({ city: value!.city, neighborhood: n === t.whole ? "" : n }); setPicking(null); }}
                onClose={() => setPicking(null)}
            />
        </View>
    );
}

/** value: what is saved when it differs from what is shown (e.g. ANYWHERE). */
type PickItem = { label: string; sub?: string; value?: string };

/** A searchable list; when nothing matches, shows noMatch and the fallback items (e.g. areas). */
function ListPicker({ visible, title, search, cancel, find, noMatch, fallback, onChoose, onClose }: {
    visible: boolean; title: string; search: string; cancel: string;
    find: (query: string) => PickItem[];
    noMatch?: string; fallback?: PickItem[];
    onChoose: (item: string) => void; onClose: () => void;
}) {
    const [query, setQuery] = React.useState("");
    React.useEffect(() => { if (visible) setQuery(""); }, [visible]);
    const found = visible ? find(query.trim()) : [];
    const none = !found.length && !!fallback;
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={s.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={s.sheet}>
                    <Text style={s.sheetTitle}>{title}</Text>
                    <TextInput style={s.search} placeholder={search} value={query} onChangeText={setQuery} autoCorrect={false} />
                    {none && noMatch ? <Text style={s.noMatch}>{noMatch}</Text> : null}
                    <FlatList
                        data={none ? fallback : found}
                        keyExtractor={(i) => i.value ?? i.label}
                        style={{ maxHeight: 380 }}
                        keyboardShouldPersistTaps="handled"
                        initialNumToRender={20}
                        renderItem={({ item }) => (
                            <Pressable style={s.option} onPress={() => onChoose(item.value ?? item.label)}>
                                <Text style={s.optionText}>{item.label}</Text>
                                {item.sub ? <Text style={s.optionSub}>{item.sub}</Text> : null}
                            </Pressable>
                        )}
                    />
                    <Pressable onPress={onClose} style={{ alignSelf: "flex-end", padding: 8 }}>
                        <Text style={s.cancel}>{cancel}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    box: { backgroundColor: "#e8f5e9", paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    where: { fontSize: 14, fontWeight: "700", color: "#2e7d32" },
    row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    select: {
        flex: 1, minWidth: 140, backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#cfe6f2",
        paddingHorizontal: 10, paddingVertical: 6,
    },
    selectLabel: { fontSize: 11, color: "#414752" },
    selectValue: { fontSize: 15, fontWeight: "600", color: "#071e27", paddingRight: 16 },
    placeholder: { color: "#8a93a0", fontWeight: "400" },
    caret: { position: "absolute", right: 10, top: 16, fontSize: 12, color: "#414752" },
    input: { fontSize: 15, color: "#071e27", paddingVertical: 2 },
    backdrop: { flex: 1, backgroundColor: "rgba(7,30,39,0.4)", justifyContent: "center", padding: 16 },
    sheet: { backgroundColor: "#fff", borderRadius: 14, padding: 16, gap: 10, maxWidth: 480, width: "100%", alignSelf: "center" },
    sheetTitle: { fontSize: 17, fontWeight: "700", color: "#071e27" },
    search: { borderWidth: 1, borderColor: "#cfe6f2", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15 },
    option: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#cfe6f2" },
    optionText: { fontSize: 15, color: "#071e27" },
    optionSub: { fontSize: 12, color: "#414752", marginTop: 1, textAlign: "left" },
    noMatch: { fontSize: 13, color: "#005dac", fontWeight: "600" },
    cancel: { fontSize: 15, color: "#005dac", fontWeight: "600" },
});
