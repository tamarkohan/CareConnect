// ── LocationPicker.tsx ───────────────────────────────────────────────
// "Where are you now?" on the community map: the user picks a city and then a
// neighborhood from searchable lists (src/data/israelPlaces.ts), or types the
// neighborhood when the city has none listed. The choice is remembered on the
// device; nothing is sent to the server.
import * as React from "react";
import { View, Text, Pressable, Modal, FlatList, TextInput, StyleSheet } from "react-native";
import { useLang } from "../AppContext";
import { LangCode } from "../translations";
import { ISRAEL_PLACES } from "../data/israelPlaces";
import { getItem, setItem } from "../api/storage";

export type UserLocation = { city: string; neighborhood: string };
const STORAGE_KEY = "careconnect.location";

const STR: Record<LangCode, Record<"where" | "city" | "neighborhood" | "chooseCity" | "chooseNeighborhood" | "typeNeighborhood" | "search" | "cancel" | "whole", string>> = {
    en: { where: "Where are you now?", city: "City / town", neighborhood: "Neighborhood", chooseCity: "Choose your city", chooseNeighborhood: "Choose your neighborhood", typeNeighborhood: "Type your neighborhood", search: "Search", cancel: "Cancel", whole: "Whole city" },
    tl: { where: "Nasaan ka ngayon?", city: "Lungsod / bayan", neighborhood: "Lugar (neighborhood)", chooseCity: "Piliin ang lungsod mo", chooseNeighborhood: "Piliin ang lugar mo", typeNeighborhood: "I-type ang lugar mo", search: "Hanapin", cancel: "Kanselahin", whole: "Buong lungsod" },
    ml: { where: "നിങ്ങൾ ഇപ്പോൾ എവിടെയാണ്?", city: "നഗരം / പട്ടണം", neighborhood: "പ്രദേശം", chooseCity: "നിങ്ങളുടെ നഗരം തിരഞ്ഞെടുക്കുക", chooseNeighborhood: "നിങ്ങളുടെ പ്രദേശം തിരഞ്ഞെടുക്കുക", typeNeighborhood: "നിങ്ങളുടെ പ്രദേശം ടൈപ്പ് ചെയ്യുക", search: "തിരയുക", cancel: "റദ്ദാക്കുക", whole: "മുഴുവൻ നഗരം" },
    ru: { where: "Где вы сейчас?", city: "Город", neighborhood: "Район", chooseCity: "Выберите город", chooseNeighborhood: "Выберите район", typeNeighborhood: "Введите район", search: "Поиск", cancel: "Отмена", whole: "Весь город" },
};

export function useSavedLocation() {
    const [location, setLocation] = React.useState<UserLocation | null>(null);
    React.useEffect(() => {
        getItem(STORAGE_KEY).then((v) => {
            try { if (v) setLocation(JSON.parse(v)); } catch { /* ignore a broken value */ }
        });
    }, []);
    const save = (loc: UserLocation) => {
        setLocation(loc);
        setItem(STORAGE_KEY, JSON.stringify(loc));
    };
    return [location, save] as const;
}

export default function LocationPicker({ value, onChange }: { value: UserLocation | null; onChange: (loc: UserLocation) => void }) {
    const { lang } = useLang();
    const t = STR[lang];
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
                    <Text style={[s.selectValue, !value?.city && s.placeholder]} numberOfLines={1}>{value?.city || t.chooseCity}</Text>
                    <Text style={s.caret}>▾</Text>
                </Pressable>
                {value?.city ? (
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
                items={ISRAEL_PLACES.map((p) => p.city)}
                onChoose={(city) => { onChange({ city, neighborhood: "" }); setPicking(null); }}
                onClose={() => setPicking(null)}
            />
            <ListPicker
                visible={picking === "neighborhood"}
                title={t.chooseNeighborhood}
                search={t.search}
                cancel={t.cancel}
                items={[t.whole, ...neighborhoods]}
                onChoose={(n) => { onChange({ city: value!.city, neighborhood: n === t.whole ? "" : n }); setPicking(null); }}
                onClose={() => setPicking(null)}
            />
        </View>
    );
}

function ListPicker({ visible, title, search, cancel, items, onChoose, onClose }: {
    visible: boolean; title: string; search: string; cancel: string; items: string[];
    onChoose: (item: string) => void; onClose: () => void;
}) {
    const [query, setQuery] = React.useState("");
    React.useEffect(() => { if (visible) setQuery(""); }, [visible]);
    const q = query.trim().toLowerCase();
    const shown = q ? items.filter((i) => i.toLowerCase().includes(q)) : items;
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={s.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={s.sheet}>
                    <Text style={s.sheetTitle}>{title}</Text>
                    <TextInput style={s.search} placeholder={search} value={query} onChangeText={setQuery} autoCorrect={false} />
                    <FlatList
                        data={shown}
                        keyExtractor={(i) => i}
                        style={{ maxHeight: 380 }}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <Pressable style={s.option} onPress={() => onChoose(item)}>
                                <Text style={s.optionText}>{item}</Text>
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
    cancel: { fontSize: 15, color: "#005dac", fontWeight: "600" },
});
