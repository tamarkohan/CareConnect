// ── RemittanceScreen.tsx ─────────────────────────────────────────────
// Currency converter (today's rates, from the backend) + information about
// remittance apps. The first currencies depend on the app language: Tagalog
// starts with Philippine pesos, Malayalam with Indian rupees; English and
// Russian start with dollars and shekels. Every row can be changed.
import * as React from "react";
import { View, Text, TextInput, Pressable, Modal, FlatList, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { useLang } from "../AppContext";
import { LangCode, T } from "../translations";
import { PAGE_T, fill } from "../pageStrings";
import { REMITTANCE_SECTIONS } from "../infoPages";
import { PageFrame, InfoSections, s as page, PageColor } from "../components/InfoSections";
import { getRates, Rates } from "../api/client";

const CURRENCIES: { code: string; flag: string; name: string }[] = [
    { code: "USD", flag: "🇺🇸", name: "US dollar" },
    { code: "ILS", flag: "🇮🇱", name: "Israeli shekel" },
    { code: "PHP", flag: "🇵🇭", name: "Philippine peso" },
    { code: "INR", flag: "🇮🇳", name: "Indian rupee" },
    { code: "LKR", flag: "🇱🇰", name: "Sri Lankan rupee" },
    { code: "NPR", flag: "🇳🇵", name: "Nepalese rupee" },
    { code: "THB", flag: "🇹🇭", name: "Thai baht" },
    { code: "CNY", flag: "🇨🇳", name: "Chinese yuan" },
    { code: "UAH", flag: "🇺🇦", name: "Ukrainian hryvnia" },
    { code: "MDL", flag: "🇲🇩", name: "Moldovan leu" },
    { code: "UZS", flag: "🇺🇿", name: "Uzbek som" },
    { code: "GEL", flag: "🇬🇪", name: "Georgian lari" },
    { code: "RUB", flag: "🇷🇺", name: "Russian ruble" },
    { code: "EUR", flag: "🇪🇺", name: "Euro" },
];
const byCode = Object.fromEntries(CURRENCIES.map((c) => [c.code, c]));

const DEFAULTS: Record<LangCode, string[]> = {
    en: ["USD", "ILS"],
    tl: ["PHP", "USD", "ILS"],
    ml: ["INR", "USD", "ILS"],
    ru: ["USD", "ILS"],
};
const MAX_ROWS = 5;

// Hand-made number formatting (Intl isn't reliable on Hermes, see translations.ts).
function format(n: number): string {
    if (!Number.isFinite(n)) return "";
    const digits = n === 0 ? 0 : Math.abs(n) < 1 ? 4 : 2;
    const [int, dec] = n.toFixed(digits).split(".");
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const trimmed = dec ? dec.replace(/0+$/, "") : "";
    return trimmed ? `${grouped}.${trimmed}` : grouped;
}
const parse = (text: string) => parseFloat(text.replace(/,/g, ""));

export default function RemittanceScreen({ navigation }: any) {
    const { lang } = useLang();
    const p = PAGE_T[lang];
    const [rates, setRates] = React.useState<Rates | null>(null);
    const [error, setError] = React.useState(false);
    const [rows, setRows] = React.useState<string[]>(DEFAULTS[lang]);
    // The row the user typed in, and what they typed; the other rows are computed.
    const [source, setSource] = React.useState({ index: 0, text: "100" });
    const [picking, setPicking] = React.useState<number | null>(null); // row index, or rows.length to add

    const load = React.useCallback(() => {
        setError(false);
        getRates().then(setRates).catch(() => setError(true));
    }, []);
    React.useEffect(load, [load]);

    // Switching the app language starts again from that language's currencies.
    React.useEffect(() => {
        setRows(DEFAULTS[lang]);
        setSource({ index: 0, text: "100" });
    }, [lang]);

    const convert = (amount: number, from: string, to: string) =>
        rates ? (amount / rates.rates[from]) * rates.rates[to] : NaN;

    const sourceAmount = parse(source.text);
    const valueOf = (i: number) =>
        i === source.index ? source.text : Number.isFinite(sourceAmount) ? format(convert(sourceAmount, rows[source.index], rows[i])) : "";

    const choose = (code: string) => {
        if (picking === null) return;
        if (picking >= rows.length) {
            setRows([...rows, code]);
        } else {
            // Keep the typed amount where the user typed it.
            const next = [...rows];
            next[picking] = code;
            setRows(next);
        }
        setPicking(null);
    };

    const remove = (i: number) => {
        const next = rows.filter((_, j) => j !== i);
        setRows(next);
        if (source.index === i) setSource({ index: 0, text: valueOf(0) || "100" });
        else if (source.index > i) setSource({ ...source, index: source.index - 1 });
    };

    const first = rows[0];
    const updated = rates ? new Date(rates.updatedAt) : null;

    return (
        <PageFrame title={T[lang].remittanceApps} navigation={navigation}>
            <Text style={page.pageTitle}>💲  {T[lang].remittanceApps}</Text>

            <View style={page.card}>
                <Text style={page.cardTitle}>{p.converterTitle}</Text>
                <Text style={page.small}>{p.converterHint}</Text>

                {error ? (
                    <View style={{ gap: 8 }}>
                        <Text style={[page.body, { color: PageColor.red }]}>{p.ratesError}</Text>
                        <Pressable style={page.button} onPress={load}><Text style={page.buttonText}>{p.retry}</Text></Pressable>
                    </View>
                ) : !rates ? (
                    <ActivityIndicator color={PageColor.blue} style={{ marginVertical: 16 }} />
                ) : (
                    <>
                        {rows.map((code, i) => (
                            <View key={`${i}-${code}`} style={c.row}>
                                <Pressable style={c.currency} onPress={() => setPicking(i)} accessibilityRole="button" accessibilityLabel={p.chooseCurrency}>
                                    <Text style={c.flag}>{byCode[code]?.flag}</Text>
                                    <Text style={c.code}>{code}</Text>
                                    <Text style={c.caret}>▾</Text>
                                </Pressable>
                                <TextInput
                                    style={[c.input, i === source.index && c.inputActive]}
                                    value={valueOf(i)}
                                    onChangeText={(text) => setSource({ index: i, text: text.replace(/[^\d.,]/g, "") })}
                                    onFocus={() => i !== source.index && setSource({ index: i, text: valueOf(i).replace(/,/g, "") })}
                                    keyboardType="decimal-pad"
                                    inputMode="decimal"
                                    selectTextOnFocus
                                />
                                {rows.length > 2 ? (
                                    <Pressable onPress={() => remove(i)} style={c.remove} accessibilityLabel={p.removeCurrency}>
                                        <Text style={c.removeText}>✕</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        ))}
                        {rows.length < MAX_ROWS ? (
                            <Pressable onPress={() => setPicking(rows.length)} style={{ paddingVertical: 4 }}>
                                <Text style={page.linkText}>{p.addCurrency}</Text>
                            </Pressable>
                        ) : null}

                        <View style={c.rates}>
                            {rows.slice(1).filter((code) => code !== first).map((code) => (
                                <Text key={code} style={page.body}>
                                    {fill(p.rateLine, { from: first, to: `${format(convert(1, first, code))} ${code}` })}
                                </Text>
                            ))}
                        </View>
                        {updated ? (
                            <Text style={page.small}>
                                {fill(p.ratesUpdated, { date: `${updated.getDate()}/${updated.getMonth() + 1}/${updated.getFullYear()}` })}{" "}
                                <Text style={{ color: PageColor.blue }} onPress={() => Linking.openURL(rates.source.url)}>{p.ratesSource}</Text>
                            </Text>
                        ) : null}
                    </>
                )}
            </View>

            <InfoSections sections={REMITTANCE_SECTIONS} />

            <CurrencyPicker
                visible={picking !== null}
                title={p.chooseCurrency}
                searchPlaceholder={p.search}
                cancel={p.cancel}
                exclude={picking !== null && picking >= rows.length ? rows : []}
                onChoose={choose}
                onClose={() => setPicking(null)}
            />
        </PageFrame>
    );
}

function CurrencyPicker({ visible, title, searchPlaceholder, cancel, exclude, onChoose, onClose }: {
    visible: boolean; title: string; searchPlaceholder: string; cancel: string; exclude: string[];
    onChoose: (code: string) => void; onClose: () => void;
}) {
    const [query, setQuery] = React.useState("");
    React.useEffect(() => { if (visible) setQuery(""); }, [visible]);
    const q = query.trim().toLowerCase();
    const items = CURRENCIES.filter((cur) => !exclude.includes(cur.code))
        .filter((cur) => !q || cur.code.toLowerCase().includes(q) || cur.name.toLowerCase().includes(q));

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={c.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={c.sheet}>
                    <Text style={page.cardTitle}>{title}</Text>
                    <TextInput style={c.search} placeholder={searchPlaceholder} value={query} onChangeText={setQuery} autoCorrect={false} />
                    <FlatList
                        data={items}
                        keyExtractor={(cur) => cur.code}
                        style={{ maxHeight: 360 }}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <Pressable style={c.option} onPress={() => onChoose(item.code)}>
                                <Text style={c.flag}>{item.flag}</Text>
                                <Text style={c.code}>{item.code}</Text>
                                <Text style={[page.body, { flex: 1 }]}>{item.name}</Text>
                            </Pressable>
                        )}
                    />
                    <Pressable onPress={onClose} style={{ alignSelf: "flex-end", padding: 8 }}>
                        <Text style={page.linkText}>{cancel}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const c = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 8 },
    currency: {
        flexDirection: "row", alignItems: "center", gap: 6, minWidth: 104,
        borderWidth: 1, borderColor: PageColor.line, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10,
        backgroundColor: PageColor.bg,
    },
    flag: { fontSize: 20 },
    code: { fontSize: 16, fontWeight: "700", color: PageColor.ink },
    caret: { fontSize: 12, color: PageColor.muted },
    input: {
        flex: 1, minWidth: 0, borderWidth: 1, borderColor: PageColor.line, borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 18, color: PageColor.ink, backgroundColor: PageColor.white,
    },
    inputActive: { borderColor: PageColor.blue, borderWidth: 2 },
    remove: { padding: 6 },
    removeText: { fontSize: 16, color: PageColor.muted },
    rates: { borderTopWidth: 1, borderTopColor: PageColor.line, paddingTop: 8, gap: 2 },
    backdrop: { flex: 1, backgroundColor: "rgba(7,30,39,0.4)", justifyContent: "center", padding: 16 },
    sheet: { backgroundColor: PageColor.white, borderRadius: 14, padding: 16, gap: 10, maxWidth: 480, width: "100%", alignSelf: "center" },
    search: { borderWidth: 1, borderColor: PageColor.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15 },
    option: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: PageColor.line },
});
