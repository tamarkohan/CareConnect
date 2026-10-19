// ── PayslipsScreen.tsx ───────────────────────────────────────────────
// Upload payslips (PDF / Word file, or photos of the paper), see each one
// explained line by line in the app language, and learn the general rules.
// The explanation and the original file are stored encrypted (see
// backend/services/payslips.js), so the original can be downloaded later.
import * as React from "react";
import { View, Text, Pressable, Modal, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useLang } from "../AppContext";
import { LangCode, T } from "../translations";
import { PAGE_T, fill } from "../pageStrings";
import { PAYSLIP_SECTIONS } from "../infoPages";
import { FAQ } from "../infoFaq";
import { PageFrame, InfoSections, FaqList, s as page, PageColor } from "../components/InfoSections";
import {
    getPayslips, uploadPayslip, deletePayslip, getPayslipFiles, explainPayslipLine, Payslip, ContractFile,
} from "../api/client";
import { showAlert, confirmAction, uriToBase64, saveFile } from "../api/platform";

const MAX_UPLOAD_BYTES = 7 * 1024 * 1024;
// Payslips per selection. Each one is a Gemini call (the free plan allows
// about 20 a day for the main model; after that the backup models answer).
const MAX_PER_SELECTION = 20;

type Asset = { uri: string; base64?: string | null; mimeType?: string | null; fileName?: string | null; name?: string };
type Upload = { name: string; read: () => Promise<ContractFile[]> };
const FILE_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",   // Excel (.xlsx)
    "text/csv",
    "text/comma-separated-values",
    "text/plain",
    "image/*",
];
// Older uploads have no kind: they were all payslips.
const KIND_ICON: Record<string, string> = { payslip: "🧾", hoursSheet: "📊", other: "📄" };
const approxBytes = (base64: string) => Math.floor((base64.length * 3) / 4);

const MONTHS: Record<LangCode, string[]> = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    tl: ["Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo", "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"],
    ml: ["ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ", "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്ടോബർ", "നവംബർ", "ഡിസംബർ"],
    ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    hi: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
    ta: ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"],
};
const monthName = (period: string | null, lang: LangCode) => {
    const m = period?.match(/^(\d{4})-(\d{2})$/);
    return m ? `${MONTHS[lang][Number(m[2]) - 1]} ${m[1]}` : null;
};
const money = (n: number | null) => (n === null ? "–" : `₪${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);

/** Payslips grouped by year, newest year first ("" = month not found, last). */
function byYear(list: Payslip[]): [string, Payslip[]][] {
    const groups = new Map<string, Payslip[]>();
    for (const ps of list) {
        const year = ps.period?.slice(0, 4) || "";
        groups.set(year, [...(groups.get(year) || []), ps]);
    }
    return [...groups.entries()].sort(([a], [b]) => (b || "0").localeCompare(a || "0"));
}

function YearGroup({ year, count, startOpen, forceOpen, children }: {
    year: string; count: number; startOpen: boolean; forceOpen: boolean; children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = React.useState(startOpen);
    const shown = isOpen || forceOpen;
    return (
        <View style={x.year}>
            <Pressable style={x.yearHead} onPress={() => setIsOpen(!shown)} accessibilityRole="button">
                <Text style={x.yearTitle}>{year}</Text>
                <View style={x.badge}><Text style={x.badgeText}>{count}</Text></View>
                <Text style={x.caret}>{shown ? "▴" : "▾"}</Text>
            </Pressable>
            {shown ? children : null}
        </View>
    );
}

function PayslipItem({ payslip: ps, expanded, onToggle, onDelete }: {
    payslip: Payslip; expanded: boolean; onToggle: () => void; onDelete: () => void;
}) {
    const { lang } = useLang();
    const p = PAGE_T[lang];
    const info = ps[lang] ?? ps.en;
    const [downloading, setDownloading] = React.useState(false);

    const download = async () => {
        setDownloading(true);
        try {
            const { files } = await getPayslipFiles(ps.id);
            for (const f of files) await saveFile(f.name, f.mimeType, f.base64);
        } catch (err: any) {
            showAlert(p.download, err?.status === 404 ? p.noFile : err?.message ?? p.errUpload);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <View style={x.item}>
            <Pressable onPress={onToggle} style={x.itemHead} accessibilityRole="button">
                <View style={{ flex: 1 }}>
                    <Text style={x.month}>{monthName(ps.period, lang) || p.unknownMonth}</Text>
                    <Text style={[page.small, { textAlign: "left" }]}>
                        {KIND_ICON[ps.kind || "payslip"] ?? "🧾"} {p.kinds[ps.kind || "payslip"] ?? p.kinds.other}  ·  {p.net}: {money(ps.net)}{ps.employer ? `  ·  ${ps.employer}` : ""}
                    </Text>
                </View>
                <Text style={x.caret}>{expanded ? "▴" : "▾"}</Text>
            </Pressable>
            {expanded ? (
                <View style={{ gap: 8 }}>
                    <Text style={page.body}>{info.overview}</Text>
                    <Text style={page.body}>{p.gross}: {money(ps.gross)}   ·   {p.net}: {money(ps.net)}</Text>
                    {info.items.length ? (
                        <>
                            <Text style={x.sub}>{p.lines}</Text>
                            <Text style={page.small}>{p.tapForMore}</Text>
                            {info.items.map((it, i) => (
                                <PayslipLine key={i} payslipId={ps.id} line={it} original={ps.en?.items?.[i]?.original || it.original} />
                            ))}
                        </>
                    ) : null}
                    {info.checks.length ? (
                        <View style={x.checks}>
                            <Text style={x.sub}>⚠ {p.checks}</Text>
                            {info.checks.map((ch, i) => <Text key={i} style={page.body}>• {ch}</Text>)}
                        </View>
                    ) : null}
                    <View style={x.actions}>
                        {ps.hasFile ? (
                            <Pressable onPress={download} disabled={downloading} style={x.action}>
                                <Text style={page.linkText}>{downloading ? "…" : p.download}</Text>
                            </Pressable>
                        ) : (
                            <Text style={[page.small, { flex: 1 }]}>{p.noFile}</Text>
                        )}
                        <Pressable onPress={onDelete} style={x.action}>
                            <Text style={{ color: PageColor.red, fontWeight: "600" }}>{p.deletePayslip}</Text>
                        </Pressable>
                    </View>
                </View>
            ) : null}
        </View>
    );
}

/** A payslip line; tapping it asks for (and remembers) a longer explanation. */
function PayslipLine({ payslipId, line, original }: {
    payslipId: string; line: { original: string; meaning: string; amount: string }; original: string;
}) {
    const { lang } = useLang();
    const p = PAGE_T[lang];
    const [detail, setDetail] = React.useState<string | null>(null);
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => { setDetail(null); setOpen(false); }, [lang]);

    const toggle = async () => {
        if (open) return setOpen(false);
        setOpen(true);
        if (detail) return;
        setLoading(true);
        try {
            setDetail((await explainPayslipLine(payslipId, original, lang)).text);
        } catch (err: any) {
            setDetail(err?.message ?? p.errUpload);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Pressable onPress={toggle} style={x.line} accessibilityRole="button">
            <View style={x.lineHead}>
                <View style={{ flex: 1 }}>
                    <Text style={x.original}>{line.original}</Text>
                    <Text style={page.body}>{line.meaning}</Text>
                </View>
                {line.amount ? <Text style={x.amount}>{line.amount}</Text> : null}
                <Text style={x.more}>{open ? "−" : "+"}</Text>
            </View>
            {open ? (
                <View style={x.detail}>
                    {loading ? (
                        <View style={x.reading}><ActivityIndicator color={PageColor.blue} size="small" /><Text style={page.small}>{p.explaining}</Text></View>
                    ) : (
                        <Text style={page.body}>{detail}</Text>
                    )}
                </View>
            ) : null}
        </Pressable>
    );
}

export default function PayslipsScreen({ navigation }: any) {
    const { lang } = useLang();
    const p = PAGE_T[lang];
    const [payslips, setPayslips] = React.useState<Payslip[] | null>(null);
    const [menu, setMenu] = React.useState(false);
    const [progress, setProgress] = React.useState<{ n: number; total: number } | null>(null);
    const [result, setResult] = React.useState<{ ok: number; total: number; failed: { item: Upload; error: string }[] } | null>(null);
    const uploading = progress !== null;
    const [open, setOpen] = React.useState<string | null>(null);

    React.useEffect(() => {
        getPayslips().then((r) => setPayslips(r.payslips)).catch(() => setPayslips([]));
    }, []);

    const errorText = (err: any) => {
        if (err?.code === "tooLarge" || err?.status === 413) return p.errTooLarge;
        if (err?.code === "notDocument") return p.errNotDocument;
        return p.errUpload;
    };

    // Several payslips can be chosen at once: each file (or photo) is one
    // payslip, read one after the other so the screen can show progress and a
    // file that fails doesn't stop the others.
    const sendMany = async (items: Upload[]) => {
        if (!items.length) return;
        if (items.length > MAX_PER_SELECTION) return showAlert(fill(p.tooManyFiles, { max: String(MAX_PER_SELECTION) }));
        setProgress({ n: 1, total: items.length });
        setResult(null);
        const failed: { item: Upload; error: string }[] = [];
        let firstId: string | null = null;
        for (let i = 0; i < items.length; i++) {
            setProgress({ n: i + 1, total: items.length });
            try {
                const files = await items[i].read();
                if (files.reduce((n, f) => n + approxBytes(f.base64), 0) > MAX_UPLOAD_BYTES) throw { code: "tooLarge" };
                const { payslip } = await uploadPayslip(files);
                firstId = firstId || payslip.id;
                setPayslips((list) => [payslip, ...(list || [])].sort((a, b) => (b.period || "").localeCompare(a.period || "")));
            } catch (err) {
                failed.push({ item: items[i], error: errorText(err) });
            }
        }
        setProgress(null);
        if (items.length === 1 && !failed.length) {
            setOpen(firstId);
        } else if (items.length === 1) {
            showAlert(p.uploadPayslip, failed[0].error);
        } else {
            setResult({ ok: items.length - failed.length, total: items.length, failed });
        }
    };

    /** One upload per payslip; files are read only when it's their turn. */
    const asUploads = (assets: Asset[], each: boolean): Upload[] =>
        each
            ? assets.map((a) => ({ name: a.fileName ?? a.name ?? "payslip", read: () => toFiles([a]) }))
            : [{ name: assets[0]?.fileName ?? "photo", read: () => toFiles(assets) }];

    const toFiles = (assets: Asset[]) =>
        Promise.all(assets.map(async (a) => ({
            base64: a.base64 || (await uriToBase64(a.uri)),
            mimeType: a.mimeType ?? undefined,
            name: a.fileName ?? a.name ?? undefined,
        })));

    const takePhoto = async () => {
        setMenu(false);
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") return showAlert(p.takePhoto, "Please allow camera access in Settings.");
            const result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
            if (!result.canceled && result.assets?.length) await sendMany(asUploads(result.assets, false));
        } catch (err: any) {
            showAlert(p.takePhoto, err?.message ?? p.errUpload);
        }
    };

    const choosePhotos = async () => {
        setMenu(false);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"], allowsMultipleSelection: true, selectionLimit: MAX_PER_SELECTION,
                orderedSelection: true, quality: 0.5, base64: true,
            });
            if (!result.canceled && result.assets?.length) await sendMany(asUploads(result.assets, true));
        } catch (err: any) {
            showAlert(p.choosePhotos, err?.message ?? p.errUpload);
        }
    };

    const chooseFile = async () => {
        setMenu(false);
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: FILE_TYPES, multiple: true, copyToCacheDirectory: true });
            if (result.canceled || !result.assets?.length) return;
            await sendMany(asUploads(result.assets, true));
        } catch (err: any) {
            showAlert(p.chooseFile, err?.message ?? p.errUpload);
        }
    };

    const remove = async (id: string) => {
        if (!(await confirmAction(p.deleteConfirm, p.deletePayslip, p.cancel))) return;
        try {
            await deletePayslip(id);
            setPayslips((list) => (list || []).filter((x) => x.id !== id));
        } catch (err: any) {
            showAlert(p.deletePayslip, err?.message ?? p.errUpload);
        }
    };

    return (
        <PageFrame title={T[lang].payslips} navigation={navigation}>
            <Text style={page.pageTitle}>💵  {T[lang].payslips}</Text>
            <Text style={page.intro}>{p.payslipsIntro}</Text>

            <Pressable style={[page.button, uploading && { opacity: 0.6 }]} onPress={() => setMenu(true)} disabled={uploading}>
                <Text style={page.buttonText}>⬆  {p.uploadPayslip}</Text>
            </Pressable>
            {progress ? (
                <View style={x.reading}>
                    <ActivityIndicator color={PageColor.blue} />
                    <Text style={page.body}>
                        {progress.total > 1 ? fill(p.readingMany, { n: String(progress.n), total: String(progress.total) }) : p.readingPayslip}
                    </Text>
                </View>
            ) : null}
            {result ? (
                <View style={[x.checks, !result.failed.length && { backgroundColor: "#e8f5e9" }]}>
                    <Text style={page.body}>{result.failed.length ? "⚠ " : "✓ "}{fill(p.uploadSummary, { ok: String(result.ok), total: String(result.total) })}</Text>
                    {result.failed.length ? (
                        <>
                            <Text style={x.sub}>{p.uploadFailedList}</Text>
                            {result.failed.map((f, i) => <Text key={i} style={page.small}>• {f.item.name}: {f.error}</Text>)}
                            <Pressable onPress={() => sendMany(result.failed.map((f) => f.item))} style={{ paddingVertical: 4 }}>
                                <Text style={page.linkText}>{p.retryFailed}</Text>
                            </Pressable>
                        </>
                    ) : null}
                </View>
            ) : null}

            <View style={page.card}>
                <Text style={page.cardTitle}>{p.myPayslips}</Text>
                {payslips === null ? (
                    <ActivityIndicator color={PageColor.blue} />
                ) : payslips.length === 0 ? (
                    <Text style={page.small}>{p.noPayslips}</Text>
                ) : (
                    byYear(payslips).map(([year, list], i) => (
                        <YearGroup
                            key={year}
                            year={year || p.unknownMonth}
                            count={list.length}
                            startOpen={i === 0}
                            forceOpen={list.some((ps) => ps.id === open)}
                        >
                            {list.map((ps) => (
                                <PayslipItem
                                    key={ps.id}
                                    payslip={ps}
                                    expanded={open === ps.id}
                                    onToggle={() => setOpen(open === ps.id ? null : ps.id)}
                                    onDelete={() => remove(ps.id)}
                                />
                            ))}
                        </YearGroup>
                    ))
                )}
            </View>

            <InfoSections sections={PAYSLIP_SECTIONS} />
            <FaqList items={FAQ.payslips} />

            <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
                <View style={x.backdrop}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenu(false)} />
                    <View style={x.sheet}>
                        <Text style={page.cardTitle}>{p.uploadPayslip}</Text>
                        <Pressable style={x.option} onPress={takePhoto}><Text style={page.body}>📷  {p.takePhoto}</Text></Pressable>
                        <Pressable style={x.option} onPress={choosePhotos}><Text style={page.body}>🖼  {p.choosePhotos}</Text></Pressable>
                        <Pressable style={x.option} onPress={chooseFile}><Text style={page.body}>📄  {p.chooseFile}</Text></Pressable>
                        <Pressable onPress={() => setMenu(false)} style={{ alignSelf: "flex-end", padding: 8 }}>
                            <Text style={page.linkText}>{p.cancel}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </PageFrame>
    );
}

const x = StyleSheet.create({
    reading: { flexDirection: "row", alignItems: "center", gap: 10 },
    year: { borderTopWidth: 1, borderTopColor: PageColor.line, paddingTop: 6, gap: 4 },
    yearHead: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
    badge: { backgroundColor: PageColor.line, borderRadius: 999, minWidth: 26, paddingHorizontal: 8, paddingVertical: 2, alignItems: "center" },
    badgeText: { fontSize: 13, fontWeight: "700", color: PageColor.blue },
    yearTitle: { fontSize: 18, fontWeight: "800", color: PageColor.blue, flex: 1 },
    item: { backgroundColor: PageColor.bg, borderRadius: 10, padding: 10, gap: 6, marginBottom: 6 },
    itemHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    month: { fontSize: 16, fontWeight: "700", color: PageColor.ink },
    caret: { fontSize: 16, color: PageColor.muted },
    sub: { fontSize: 14, fontWeight: "700", color: PageColor.blue, marginTop: 4 },
    line: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: PageColor.line, gap: 6 },
    lineHead: { flexDirection: "row", gap: 10, alignItems: "center" },
    more: { fontSize: 18, fontWeight: "700", color: PageColor.blue, width: 18, textAlign: "center" },
    detail: { backgroundColor: PageColor.white, borderRadius: 8, padding: 10, borderLeftWidth: 3, borderLeftColor: PageColor.blue },
    actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
    action: { paddingVertical: 6 },
    original: { fontSize: 15, fontWeight: "700", color: PageColor.ink, textAlign: "left" },
    amount: { fontSize: 15, fontWeight: "700", color: PageColor.ink },
    checks: { backgroundColor: "#fff7e0", borderRadius: 8, padding: 10, gap: 4 },
    backdrop: { flex: 1, backgroundColor: "rgba(7,30,39,0.4)", justifyContent: "flex-end" },
    sheet: { backgroundColor: PageColor.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, gap: 4 },
    option: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: PageColor.line },
});
