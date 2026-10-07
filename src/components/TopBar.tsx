// ── TopBar.tsx ───────────────────────────────────────────────────────
// Shared top bar used on every screen after Login.
// Shows: hamburger menu (left) · screen title (centre) · language picker (right)
// Both the menu drawer and language dropdown render as full-screen overlays
// so they always appear above the bottom nav on every screen.

import * as React from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Modal,
    TouchableWithoutFeedback,
    ScrollView,
} from "react-native";
import { useLang } from "../AppContext";
import { LANGUAGES, T } from "../translations";
import { BOT_T } from "../botStrings";

const Color = {
    aliceBlue: "#f3faff",
    blackPearl: "#071e27",
    endeavour: "#005dac",
    linkWater: "#cfe6f2",
    mako: "#414752",
    white: "#fff",
    red: "#c62828",
    lightRed: "#fff0f0",
};

type Props = {
    title: string;
    navigation?: any;
};

export default function TopBar({ title, navigation }: Props) {
    const { lang, setLang, signOut, user } = useLang();
    const b = BOT_T[lang];
    // Shown in the menu so testers know which account they are using.
    const account = user
        ? user.isDemo
            ? `${b.demoAccount} (123)`
            : user.phone ?? user.email ?? ""
        : b.guestAccount;
    const [showMenu, setShowMenu] = React.useState(false);
    const [showLangs, setShowLangs] = React.useState(false);

    const t = T[lang];
    const currentLang = LANGUAGES.find((l) => l.code === lang)!;

    return (
        <>
            {/* ── Bar ── */}
            <View style={s.topBar}>
                <Pressable style={s.menuBtn} onPress={() => setShowMenu(true)}>
                    <Text style={s.menuIcon}>☰</Text>
                </Pressable>
                <Text style={s.title}>{title}</Text>
                <Pressable style={s.globeBtn} onPress={() => setShowLangs(true)}>
                    <Text style={s.globeIcon}>🌐</Text>
                </Pressable>
            </View>

            {/* ── Hamburger menu modal ── */}
            <Modal
                visible={showMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
                    <View style={s.overlay}>
                        {/* Stop touch from closing when tapping inside drawer */}
                        <TouchableWithoutFeedback>
                            <View style={s.menuDrawer}>
                                {/* Header */}
                                <View style={s.menuHeader}>
                                    <Text style={s.menuTitle}>{t.menu}</Text>
                                    <Pressable onPress={() => setShowMenu(false)} style={s.closeBtn}>
                                        <Text style={s.closeIcon}>✕</Text>
                                    </Pressable>
                                </View>

                                <View style={s.accountBox}>
                                    {user && <Text style={s.accountLabel}>{b.signedInAs}</Text>}
                                    <Text style={s.accountValue}>{account}</Text>
                                </View>

                                <View style={s.menuDivider} />

                                {/* Items */}
                                <Pressable style={s.menuItem} onPress={() => setShowMenu(false)}>
                                    <Text style={s.menuItemIcon}>⚙</Text>
                                    <Text style={s.menuItemText}>{t.settings}</Text>
                                </Pressable>

                                <Pressable style={s.menuItem} onPress={() => setShowMenu(false)}>
                                    <Text style={s.menuItemIcon}>👤</Text>
                                    <Text style={s.menuItemText}>{t.profile}</Text>
                                </Pressable>

                                <Pressable style={s.menuItem} onPress={() => setShowMenu(false)}>
                                    <Text style={s.menuItemIcon}>❓</Text>
                                    <Text style={s.menuItemText}>{t.helpCenter}</Text>
                                </Pressable>

                                <View style={s.menuDivider} />

                                <Pressable
                                    style={s.menuItem}
                                    onPress={async () => {
                                        setShowMenu(false);
                                        // App.tsx goes back to the login screen by itself.
                                        await signOut();
                                    }}
                                >
                                    <Text style={[s.menuItemIcon, s.logoutIcon]}>↩</Text>
                                    <Text style={[s.menuItemText, s.logoutText]}>{user ? t.logout : b.signInMenu}</Text>
                                </Pressable>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* ── Language picker modal ── */}
            <Modal
                visible={showLangs}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLangs(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowLangs(false)}>
                    <View style={s.overlay}>
                        <TouchableWithoutFeedback>
                            <View style={s.langPanel}>
                                <Text style={s.langPanelTitle}>Languages</Text>
                                <View style={s.langDivider} />
                                {LANGUAGES.map((l) => (
                                    <Pressable
                                        key={l.code}
                                        style={[
                                            s.langOption,
                                            l.code === lang && s.langOptionActive,
                                        ]}
                                        onPress={() => {
                                            setLang(l.code);
                                            setShowLangs(false);
                                        }}
                                    >
                                        <Text style={s.langGlobe}>🌐</Text>
                                        <Text
                                            style={[
                                                s.langOptionText,
                                                l.code === lang && s.langOptionTextActive,
                                            ]}
                                        >
                                            {l.nativeLabel}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

// ════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
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

    // ── Shared overlay ──
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
    },

    // ── Hamburger menu drawer ──
    menuDrawer: {
        width: 260,
        backgroundColor: Color.white,
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 16,
    },
    menuHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    menuTitle: { fontSize: 18, fontWeight: "700", color: Color.endeavour },
    closeBtn: { padding: 4 },
    closeIcon: { fontSize: 16, color: Color.mako },
    menuDivider: {
        height: 1,
        backgroundColor: Color.linkWater,
        marginHorizontal: 0,
        marginVertical: 4,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    menuItemIcon: { fontSize: 18, width: 22, textAlign: "center" },
    menuItemText: { fontSize: 15, color: Color.blackPearl },
    logoutIcon: { color: Color.red },
    logoutText: { color: Color.red },

    // ── Language panel ──
    langPanel: {
        width: 240,
        backgroundColor: Color.white,
        borderRadius: 16,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 16,
    },
    langPanelTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Color.blackPearl,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    langDivider: {
        height: 1,
        backgroundColor: Color.linkWater,
        marginBottom: 4,
    },
    langOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 0,
        borderWidth: 0,
    },
    langOptionActive: {
        borderWidth: 1.5,
        borderColor: Color.endeavour,
        borderRadius: 10,
        marginHorizontal: 8,
        paddingHorizontal: 12,
        backgroundColor: Color.aliceBlue,
    },
    langGlobe: { fontSize: 18 },
    langOptionText: { fontSize: 15, color: Color.blackPearl },
    langOptionTextActive: { color: Color.endeavour, fontWeight: "700" },
    accountBox: { paddingHorizontal: 16, paddingVertical: 10, gap: 2 },
    accountLabel: { fontSize: 11, color: Color.mako },
    accountValue: { fontSize: 14, color: Color.blackPearl, fontWeight: "600" },
});
