import * as React from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import { BlurView } from "expo-blur";
import Divnavitem1 from "../assets/div-nav-item.svg";
import {
    Padding,
    Height,
    Width,
    FontFamily,
    LineHeight,
    FontSize,
    Color,
} from "../GlobalStyles";

const NavbottomNav = () => {
    return (
        <View style={styles.navbottomNav}>
            <BlurView style={styles.blurview} intensity={12}>
                <View style={[styles.view, styles.viewLayout]} />
            </BlurView>
            <View style={[styles.divnavItem, styles.divnavItemSpaceBlock]}>
                <View style={styles.spanmaterialSymbolsOutlined}>
                    <View style={styles.icon} />
                </View>
                <View style={[styles.spanmargin, styles.spanmarginPosition]} />
            </View>
            <Pressable
                style={[styles.divnavItem, styles.divnavItemSpaceBlock]}
                onPress={() => { }}
            >
                <View style={styles.spanmaterialSymbolsOutlined}>
                    <View style={styles.icon} />
                </View>
                <View style={[styles.spanmargin2, styles.spanmarginPosition]} />
            </Pressable>
            <Pressable
                style={[styles.divnavItem, styles.divnavItemSpaceBlock]}
                onPress={() => { }}
            >
                <View style={styles.spanmaterialSymbolsOutlined}>
                    <View style={styles.icon} />
                </View>
                <View style={[styles.spanmargin3, styles.spanmarginPosition]} />
            </Pressable>
            <Pressable
                style={[styles.divnavItem4, styles.divnavItemSpaceBlock]}
                onPress={() => { }}
            >
                <View style={styles.spanmaterialSymbolsOutlinedWrapper}>
                    <View style={styles.spanmaterialSymbolsOutlined4}>
                        <View style={styles.icon} />
                    </View>
                </View>
                <View style={[styles.spanmargin4, styles.spanmarginLayout]}>
                    <View style={[styles.spanmargin5, styles.spanmarginLayout]}>
                        <View style={styles.frameParent}>
                            <View style={styles.frameGroup}>
                                <View style={styles.translatorWrapper}>
                                    <Text style={[styles.translator, styles.tasksTypo]}>
                                        Translator
                                    </Text>
                                </View>
                                <Text style={[styles.assistant, styles.tasksSpaceBlock]}>
                                    Assistant
                                </Text>
                                <View style={[styles.communityWrapper, styles.tasksSpaceBlock]}>
                                    <Text style={[styles.translator, styles.tasksTypo]}>
                                        Community
                                    </Text>
                                </View>
                                <Text style={[styles.tasks, styles.tasksSpaceBlock]}>
                                    Tasks
                                </Text>
                            </View>
                            <Text style={[styles.journal, styles.homeTypo]}>Journal</Text>
                            <Text style={[styles.home, styles.homeTypo]}>Home</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
            <Pressable
                style={[styles.divnavItem, styles.divnavItemSpaceBlock]}
                onPress={() => { }}
            >
                <View style={styles.spanmaterialSymbolsOutlined}>
                    <View style={styles.icon5} />
                </View>
                <View style={[styles.spanmargin6, styles.spanmarginPosition]} />
            </Pressable>
            <Pressable style={styles.divnavItem6} onPress={() => { }}>
                <Divnavitem1
                    style={[styles.icon6, styles.viewLayout]}
                    width={61}
                    height={69}
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    viewLayout: {
        height: "100%",
        width: "100%",
    },
    divnavItemSpaceBlock: {
        paddingTop: Padding.padding_11,
        alignItems: "flex-start",
        height: Height.height_69,
    },
    spanmarginPosition: {
        top: 24,
        width: Width.width_80,
        zIndex: 1,
        height: Height.height_54,
        position: "absolute",
    },
    spanmarginLayout: {
        width: 603,
        alignItems: "flex-start",
    },
    tasksTypo: {
        alignItems: "flex-end",
        display: "flex",
        textAlign: "left",
        fontFamily: FontFamily.sFPro,
        fontWeight: "500",
        lineHeight: LineHeight.lh_18,
        fontSize: FontSize.fs_13,
        color: Color.mako,
        width: Width.width_80,
    },
    tasksSpaceBlock: {
        marginLeft: -17,
        height: Height.height_50,
    },
    homeTypo: {
        left: "50%",
        top: "50%",
        alignItems: "flex-end",
        display: "flex",
        textAlign: "left",
        fontFamily: FontFamily.sFPro,
        fontWeight: "500",
        lineHeight: LineHeight.lh_18,
        fontSize: FontSize.fs_13,
        position: "absolute",
    },
    navbottomNav: {
        height: 85,
        right: -67,
        bottom: -2,
        left: 22,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderColor: Color.linkWater,
        borderTopWidth: 1,
        alignItems: "center",
        paddingTop: 9,
        overflow: "hidden",
        zIndex: 3,
        flexDirection: "row",
        position: "absolute",
    },
    blurview: {
        opacity: 1,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        position: "absolute",
    },
    view: {
        backgroundColor: Color.aliceBlue,
    },
    divnavItem: {
        paddingLeft: Padding.padding_19,
        paddingRight: Padding.padding_18,
        paddingBottom: Padding.padding_30,
        width: Width.width_61,
        flexDirection: "row",
    },
    spanmaterialSymbolsOutlined: {
        zIndex: 0,
        alignItems: "flex-start",
    },
    icon: {
        width: Width.width_24_01,
        height: Height.height_27_99,
    },
    spanmargin: {
        left: 9.8,
        zIndex: 1,
    },
    spanmargin2: {
        left: 0.3,
        zIndex: 1,
    },
    spanmargin3: {
        left: 2.3,
        zIndex: 1,
    },
    divnavItem4: {
        width: 69,
        paddingRight: Padding.padding_0,
        paddingBottom: Padding.padding_0,
    },
    spanmaterialSymbolsOutlinedWrapper: {
        width: 47.1,
        paddingLeft: 23,
        height: Height.height_28,
        zIndex: 1,
        alignItems: "flex-start",
        flexDirection: "row",
    },
    spanmaterialSymbolsOutlined4: {
        alignItems: "flex-start",
    },
    spanmargin4: {
        height: 58,
        paddingTop: Padding.padding_4,
        marginTop: -15,
        zIndex: 2,
    },
    spanmargin5: {
        top: -13.5,
        left: -132,
        paddingHorizontal: Padding.padding_0,
        paddingTop: Padding.padding_3,
        paddingBottom: Padding.padding_1,
        height: Height.height_54,
        width: 603,
        zIndex: 0,
        flexDirection: "row",
        position: "absolute",
    },
    frameParent: {
        width: 398.98,
        height: Height.height_50,
    },
    frameGroup: {
        top: 0,
        left: 50,
        zIndex: 1,
        width: 292,
        height: Height.height_50,
        alignItems: "flex-start",
        flexDirection: "row",
        position: "absolute",
    },
    translatorWrapper: {
        width: 86.5,
        paddingRight: 6,
        height: Height.height_50,
        zIndex: 1,
        alignItems: "flex-start",
    },
    translator: {
        height: Height.height_50,
    },
    assistant: {
        alignItems: "flex-end",
        display: "flex",
        textAlign: "left",
        fontFamily: FontFamily.sFPro,
        fontWeight: "500",
        lineHeight: LineHeight.lh_18,
        fontSize: FontSize.fs_13,
        color: Color.mako,
        width: Width.width_80,
        zIndex: 2,
    },
    communityWrapper: {
        width: 97.7,
        paddingRight: 17,
        alignItems: "flex-start",
        zIndex: 3,
    },
    tasks: {
        zIndex: 4,
        alignItems: "flex-end",
        display: "flex",
        textAlign: "left",
        fontFamily: FontFamily.sFPro,
        fontWeight: "500",
        lineHeight: LineHeight.lh_18,
        fontSize: FontSize.fs_13,
        color: Color.mako,
        width: Width.width_80,
    },
    journal: {
        marginTop: -25,
        marginLeft: 120,
        color: Color.mako,
        top: "50%",
    },
    home: {
        marginTop: -1,
        marginLeft: -199,
        color: Color.endeavour,
    },
    icon5: {
        width: Width.width_24_02,
        height: Height.height_28,
    },
    spanmargin6: {
        left: 10.3,
        zIndex: 1,
    },
    divnavItem6: {
        width: Width.width_61,
        height: Height.height_69,
    },
    icon6: {
        width: 61,
        height: 69,
    },
});

export default NavbottomNav;
