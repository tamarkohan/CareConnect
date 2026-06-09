import * as React from "react";
import { Text, StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import Spanmaterialsymbolsoutlined3 from "../assets/span-material-symbols-outlined3.svg";
import Guides from "./Guides";
import Icon11 from "../assets/Icon1.svg";
import {
    Gap,
    Height,
    Width,
    LineHeight,
    FontSize,
    FontFamily,
    Color,
    Padding,
    Border,
    BoxShadow,
} from "../GlobalStyles";

const Divflex = () => {
    return (
        <View style={styles.divflex}>
            <View style={styles.h2fontBold}>
                <Text style={styles.essentialTools}>Essential Tools</Text>
            </View>
            <Pressable
                style={[styles.agencySosSpanning2Columns, styles.divflex2FlexBox]}
            >
                <Spanmaterialsymbolsoutlined3
                    style={styles.spanmaterialSymbolsOutlinedIcon}
                    width={Width.width_24_02}
                    height={Height.height_24}
                />
                <View style={[styles.divflex2, styles.divflex2FlexBox]}>
                    <View style={styles.spanfontBold}>
                        <Text
                            style={[styles.myAgency, styles.myAgencyFlexBox]}
                        >{`My Agency `}</Text>
                    </View>
                </View>
            </Pressable>
            <View style={styles.divgrid}>
                <View style={[styles.guidesParent, styles.parentFlexBox]}>
                    <Guides
                        icon={require("../assets/Icon.svg")}
                        arrivalGuides=" Arrival Guides "
                    />
                    <Guides
                        icon={require("../assets/Icon.png")}
                        arrivalGuides="Migration Support"
                        guidesPaddingHorizontal="unset"
                        guidesPaddingTop={19}
                        guidesPaddingBottom={15}
                    />
                    <View style={[styles.dementiaCareWrapper, styles.dementiaFlexBox]}>
                        <View style={styles.dementiaCare}>
                            <View
                                style={[
                                    styles.spanmaterialSymbolsOutlined,
                                    styles.spanmaterialLayout,
                                ]}
                            >
                                <Image
                                    style={styles.iconLayout}
                                    contentFit="cover"
                                    source={require("../assets/Icon.png")}
                                />
                            </View>
                            <View style={styles.spanfontBold2}>
                                <Text
                                    style={[
                                        styles.publicTransportationUse,
                                        styles.dementiaCareTipsTypo,
                                    ]}
                                >
                                    Public Transportation Use
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.dementiaCareContainer, styles.dementiaFlexBox]}>
                        <View style={[styles.dementiaCare2, styles.dementiaLayout]}>
                            <View
                                style={[
                                    styles.spanmaterialSymbolsOutlined,
                                    styles.spanmaterialLayout,
                                ]}
                            >
                                <Icon11
                                    // style={[styles.icon2, styles.iconLayout]}
                                    width={Width.width_28_02}
                                    height={Height.height_34}
                                />
                            </View>
                            <View style={styles.spanfontBold3}>
                                <Text
                                    style={[styles.dementiaCareTips, styles.dementiaCareTipsTypo]}
                                >
                                    Dementia{"\n"}Care Tips
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.dementiaCareParent, styles.parentFlexBox]}>
                    <Guides
                        icon={require("../assets/Icon.svg")}
                        arrivalGuides={`Safety & Shelters`}
                        guidesPaddingHorizontal="unset"
                        guidesPaddingTop={12}
                        guidesPaddingBottom={15}
                    />
                    <Guides
                        icon={require("../assets/Icon.png")}
                        arrivalGuides="PIBA Application"
                        guidesPaddingHorizontal="unset"
                        guidesPaddingTop={13}
                        guidesPaddingBottom={25}
                    />
                    <View style={[styles.dementiaCareFrame, styles.dementiaFlexBox]}>
                        <View style={styles.dementiaCare}>
                            <View
                                style={[
                                    styles.spanmaterialSymbolsOutlined,
                                    styles.spanmaterialLayout,
                                ]}
                            >
                                <View style={styles.iconLayout}>
                                    <Image
                                        style={styles.image4Icon}
                                        contentFit="cover"
                                        source={require("../assets/image-4.png")}
                                    />
                                </View>
                            </View>
                            <View style={styles.spanfontBold2}>
                                <Text
                                    style={[
                                        styles.remittanceApplications,
                                        styles.dementiaCareTipsTypo,
                                    ]}
                                >
                                    Remittance Applications
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.dementiaCare4, styles.dementiaLayout]}>
                        <Image
                            style={styles.spanmaterialLayout}
                            contentFit="cover"
                            source={require("../assets/span-material-symbols-outlined.png")}
                        />
                        <View style={styles.spanfontBold3}>
                            <Text
                                style={[styles.dementiaCareTips, styles.dementiaCareTipsTypo]}
                            >
                                About US
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    divflex2FlexBox: {
        flexDirection: "row",
        alignItems: "center",
    },
    myAgencyFlexBox: {
        display: "flex",
        alignItems: "center",
    },
    parentFlexBox: {
        gap: Gap.gap_20,
        alignItems: "flex-end",
        height: 460,
    },
    dementiaFlexBox: {
        justifyContent: "flex-end",
        height: Height.height_100,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    spanmaterialLayout: {
        height: Height.height_32,
        width: Width.width_32,
    },
    dementiaCareTipsTypo: {
        lineHeight: LineHeight.lh_17_5,
        fontSize: FontSize.fs_14,
        fontFamily: FontFamily.interBold,
        textAlign: "left",
        color: Color.blackPearl,
        fontWeight: "700",
    },
    dementiaLayout: {
        paddingTop: Padding.padding_13,
        paddingHorizontal: Padding.padding_16,
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderStyle: "solid",
        backgroundColor: Color.white02,
        width: Width.width_165,
        height: Height.height_100,
        gap: Gap.gap_10,
        borderRadius: Border.br_12,
        elevation: 2,
        boxShadow: BoxShadow.shadow_drop,
        alignItems: "flex-start",
    },
    iconLayout: {
        height: Height.height_34,
        width: Width.width_28_02,
    },
    divflex: {
        gap: Gap.gap_12,
        alignItems: "flex-start",
        alignSelf: "stretch",
    },
    h2fontBold: {
        alignItems: "flex-start",
        alignSelf: "stretch",
    },
    essentialTools: {
        fontSize: FontSize.fs_18,
        lineHeight: LineHeight.lh_27,
        fontFamily: FontFamily.atkinsonHyperlegibleNext,
        textAlign: "left",
        color: Color.blackPearl,
        fontWeight: "700",
        alignSelf: "stretch",
    },
    agencySosSpanning2Columns: {
        height: Height.height_72,
        backgroundColor: Color.endeavour,
        padding: Padding.padding_16,
        gap: 57,
        alignItems: "center",
        borderRadius: Border.br_12,
        elevation: 2,
        boxShadow: BoxShadow.shadow_drop,
        flexDirection: "row",
        alignSelf: "stretch",
    },
    spanmaterialSymbolsOutlinedIcon: {
        width: Width.width_24_02,
        zIndex: 0,
        height: Height.height_24,
    },
    divflex2: {
        top: 24,
        left: 59,
        zIndex: 1,
        position: "absolute",
        alignItems: "center",
    },
    spanfontBold: {
        alignItems: "center",
    },
    myAgency: {
        width: 91,
        fontSize: FontSize.fs_16,
        lineHeight: LineHeight.lh_24,
        color: Color.white,
        textAlign: "center",
        justifyContent: "center",
        fontFamily: FontFamily.interBold,
        display: "flex",
        height: Height.height_24,
        fontWeight: "700",
    },
    divgrid: {
        height: 466,
        paddingHorizontal: Padding.padding_0,
        paddingBottom: Padding.padding_6,
        gap: Gap.gap_10,
        flexDirection: "row",
        alignItems: "flex-start",
        alignSelf: "stretch",
    },
    guidesParent: {
        width: 172,
    },
    dementiaCareWrapper: {
        width: 168,
        paddingRight: Padding.padding_3,
    },
    dementiaCare: {
        paddingHorizontal: Padding.padding_15,
        paddingTop: Padding.padding_12,
        paddingBottom: Padding.padding_15,
        borderWidth: 1,
        borderColor: Color.linkWater,
        borderStyle: "solid",
        backgroundColor: Color.white02,
        width: Width.width_165,
        height: Height.height_100,
        gap: Gap.gap_10,
        borderRadius: Border.br_12,
        elevation: 2,
        boxShadow: BoxShadow.shadow_drop,
        alignItems: "flex-start",
    },
    spanmaterialSymbolsOutlined: {
        alignItems: "flex-start",
    },
    spanfontBold2: {
        alignSelf: "flex-start",
        alignItems: "flex-start",
    },
    publicTransportationUse: {
        width: 137,
        display: "flex",
        alignItems: "center",
    },
    dementiaCareContainer: {
        zIndex: undefined,
        paddingRight: Padding.padding_7,
        width: 172,
    },
    dementiaCare2: {
        paddingBottom: Padding.padding_8,
    },
    icon2: {
        color: Color.colorDarkgreen,
    },
    spanfontBold3: {
        alignItems: "flex-start",
    },
    dementiaCareTips: {
        alignSelf: "stretch",
    },
    dementiaCareParent: {
        zIndex: 3,
        width: 166,
    },
    dementiaCareFrame: {
        paddingRight: Padding.padding_1,
        width: 166,
    },
    image4Icon: {
        top: 28,
        left: 0,
        width: 25,
        height: 23,
        position: "absolute",
    },
    remittanceApplications: {
        width: 144,
        display: "flex",
        alignItems: "center",
    },
    dementiaCare4: {
        paddingBottom: 25,
    },
});

export default Divflex;
