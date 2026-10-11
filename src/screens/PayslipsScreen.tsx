// ── PayslipsScreen.tsx ───────────────────────────────────────────────
// Upload payslips (PDF / Word file, or photos of the paper), see each one
// explained line by line in the app language, and learn the general rules.
// Only the explanation is stored (encrypted, see backend/services/payslips.js).
import * as React from "react";
import { View, Text, Pressable, Modal, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useLang } from "../AppContext";
import { LangCode, T } from "../translations";
import { PAGE_T } from "../pageStrings";
import { PAYSLIP_SECTIONS } from "../infoPages";
import { PageFrame, InfoSections, s as page, PageColor } from "../components/InfoSections";
import { getPayslips, uploadPayslip, deletePayslip, Payslip, ContractFile } from "../api/client";
import { showAlert, confirmAction, uriToBase64 } from "../api/platform";

const MAX_UPLOAD_BYTES = 7 * 1024 * 1024;
const MAX_PHOTOS = 5;
const FILE_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/*",
];
const approxBytes = (base64: string) => Math.floor((base64.length * 3) / 4);

const MONTHS: Record<LangCode, string[]> = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    tl: ["Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo", "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"],
    ml: ["ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ", "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്ടോബർ", "നവംബർ", "ഡിസംബർ"],
    ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};
const monthName = (period: string | null, lang: LangCode) => {
    const m = period?.match(/^(\d{4})-(\d{2})$/);
    return m ? `${MONTHS[lang][Number(m[2]) - 1]} ${m[1]}` : null;
};
const money = (n: number | null) => (n === null ? "–" : `₪${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);

export default function PayslipsScreen({ navigation }: any) {
    const { lang } = useLang();
    const p = PAGE_T[lang];
    const [payslips, setPayslips] = React.useState<Payslip[] | null>(null);
    const [menu, setMenu] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [open, setOpen] = React.useState<string | null>(null);

    React.useEffect(() => {
        getPayslips().then((r) => setPayslips(r.payslips)).catch(() => setPayslips([]));
    }, []);

    const errorText = (err: any) => {
        if (err?.code === "tooLarge" || err?.status === 413) return p.errTooLarge;
        if (err?.code === "notDocument") return p.errNotDocument;
        return p.errUpload;
    };

    const send = async (files: ContractFile[]) => {
        if (files.reduce((n, f) => n + approxBytes(f.base64), 0) > MAX_UPLOAD_BYTES) return showAlert(p.errTooLarge);
        setUploading(true);
        try {
            const { payslip } = await uploadPayslip(files);
            setPayslips((list) => [payslip, ...(list || [])].sort((a, b) => (b.period || "").localeCompare(a.period || "")));
            setOpen(payslip.id);
        } catch (err) {
            showAlert(p.uploadPayslip, errorText(err));
        } finally {
            setUploading(false);
        }
    };

    const toFiles = (assets: { uri: string; base64?: string | null; mimeType?: string | null; fileName?: string | null; name?: string }[]) =>
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
            if (!result.canceled && result.assets?.length) await send(await toFiles(result.assets));
        } catch (err: any) {
            showAlert(p.takePhoto, err?.message ?? p.errUpload);
        }
    };

    const choosePhotos = async () => {
        setMenu(false);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"], allowsMultipleSelection: true, selectionLimit: MAX_PHOTOS,
                orderedSelection: true, quality: 0.5, base64: true,
            });
            if (!result.canceled && result.assets?.length) await send(await toFiles(result.assets.slice(0, MAX_PHOTOS)));
        } catch (err: any) {
            showAlert(p.choosePhotos, err?.message ?? p.errUpload);
        }
    };

    const chooseFile = async () => {
        setMenu(false);
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: FILE_TYPES, multiple: false, copyToCacheDirectory: true });
            if (result.canceled || !result.assets?.length) return;
            if (result.assets[0].size && result.assets[0].size > MAX_UPLOAD_BYTES) return showAlert(p.errTooLarge);
            await send(await toFiles([result.assets[0]]));
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
            <Text style={page.pageTitle}>🧾  {T[lang].payslips}</Text>
            <Text style={page.intro}>{p.payslipsIntro}</Text>

            <Pressable style={[page.button, uploading && { opacity: 0.6 }]} onPress={() => setMenu(true)} disabled={uploading}>
                <Text style={page.buttonText}>⬆  {p.uploadPayslip}</Text>
            </Pressable>
            {uploading ? (
                <View style={x.reading}>
                    <ActivityIndicator color={PageColor.blue} />
                    <Text style={page.body}>{p.readingPayslip}</Text>
                </View>
            ) : null}

            <View style={page.card}>
                <Text style={page.cardTitle}>{p.myPayslips}</Text>
                {payslips === null ? (
                    <ActivityIndicator color={PageColor.blue} />
                ) : payslips.length === 0 ? (
                    <Text style={page.small}>{p.noPayslips}</Text>
                ) : (
                    payslips.map((ps) => {
                        const info = ps[lang] || ps.en;
                        const expanded = open === ps.id;
                        return (
                            <View key={ps.id} style={x.item}>
                                <Pressable onPress={() => setOpen(expanded ? null : ps.id)} style={x.itemHead}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={x.month}>{monthName(ps.period, lang) || p.unknownMonth}</Text>
                                        <Text style={page.small}>
                                            {ps.employer ? `${ps.employer} · ` : ""}{p.net}: {money(ps.net)}
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
                                                {info.items.map((it, i) => (
                                                    <View key={i} style={x.line}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={x.original}>{it.original}</Text>
                                                            <Text style={page.body}>{it.meaning}</Text>
                                                        </View>
                                                        {it.amount ? <Text style={x.amount}>{it.amount}</Text> : null}
                                                    </View>
                                                ))}
                                            </>
                                        ) : null}
                                        {info.checks.length ? (
                                            <View style={x.checks}>
                                                <Text style={x.sub}>⚠ {p.checks}</Text>
                                                {info.checks.map((ch, i) => <Text key={i} style={page.body}>• {ch}</Text>)}
                                            </View>
                                        ) : null}
                                        <Pressable onPress={() => remove(ps.id)} style={{ alignSelf: "flex-end", padding: 6 }}>
                                            <Text style={{ color: PageColor.red, fontWeight: "600" }}>{p.deletePayslip}</Text>
                                        </Pressable>
                                    </View>
                                ) : null}
                            </View>
                        );
                    })
                )}
            </View>

            <InfoSections sections={PAYSLIP_SECTIONS} />

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
    item: { borderTopWidth: 1, borderTopColor: PageColor.line, paddingTop: 8, gap: 6 },
    itemHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    month: { fontSize: 16, fontWeight: "700", color: PageColor.ink },
    caret: { fontSize: 16, color: PageColor.muted },
    sub: { fontSize: 14, fontWeight: "700", color: PageColor.blue, marginTop: 4 },
    line: { flexDirection: "row", gap: 10, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: PageColor.bg },
    original: { fontSize: 15, fontWeight: "700", color: PageColor.ink, textAlign: "left" },
    amount: { fontSize: 15, fontWeight: "700", color: PageColor.ink },
    checks: { backgroundColor: "#fff7e0", borderRadius: 8, padding: 10, gap: 4 },
    backdrop: { flex: 1, backgroundColor: "rgba(7,30,39,0.4)", justifyContent: "flex-end" },
    sheet: { backgroundColor: PageColor.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, gap: 4 },
    option: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: PageColor.line },
});
