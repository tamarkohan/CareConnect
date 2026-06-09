import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import Spanmaterialsymbolsoutlined1 from "../assets/span-material-symbols-outlined1.svg";
import Spanmaterialsymbolsoutlined2 from "../assets/span-material-symbols-outlined2.svg";
import {
    BoxShadow,
    Border,
    Color,
    Padding,
    Gap,
    Height,
    Width,
    FontSize,
    LineHeight,
    FontFamily,
} from "../GlobalStyles";

const WordOfTheDayFixedHeight = () => {
    return (
        <View style={[styles.wordOfTheDayFixedHeight, styles.divflexFlexBox1]}>
            <View style={[styles.divflex, styles.divflexFlexBox]}>
                <View style={styles.divflex2}>
                    <Spanmaterialsymbolsoutlined1
                        style={styles.spanmaterialSymbolsOutlinedIcon}
                        width={Width.width_24_02}
                        height={Height.height_24}
                    />
                    <View style={styles.h2uppercase}>
                        <Text style={[styles.wordOfThe, styles.textFlexBox]}>
                            Word of the Day
                        </Text>
                    </View>
                </View>
                <Spanmaterialsymbolsoutlined2
                    style={styles.spanmaterialSymbolsOutlinedIcon}
                    width={Width.width_24_02}
                    height={Height.height_24}
                />
            </View>
            <View style={styles.div}>
                <View style={[styles.divflex3, styles.divflexFlexBox]}>
                    <View style={styles.spanfontBold}>
                        <Text style={[styles.text, styles.textFlexBox]}>תודה</Text>
                    </View>
                    <View style={styles.todaWrapper}>
                        <Text style={[styles.toda, styles.textFlexBox]}>/ Toda /</Text>
                    </View>
                </View>
                <View style={styles.ptextTertiary}>
                    <Text style={styles.thankYou}>Thank you</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    divflexFlexBox1: {
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    divflexFlexBox: {
        flexDirection: "row",
        alignSelf: "stretch",
    },
    textFlexBox: {
        display: "flex",
        alignItems: "center",
    },
    wordOfTheDayFixedHeight: {
        boxShadow: BoxShadow.shadow_drop,
        elevation: 2,
        borderRadius: Border.br_12,
        backgroundColor: Color.creamBrulee,
        borderStyle: "solid",
        borderColor: Color.colorGoldenrod,
        borderWidth: 1,
        paddingHorizontal: Padding.padding_20,
        paddingTop: Padding.padding_19,
        paddingBottom: Padding.padding_13,
        gap: 0,
        minHeight: 140,
        alignSelf: "stretch",
    },
    divflex: {
        gap: Gap.gap_20,
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    divflex2: {
        gap: Gap.gap_8,
        alignItems: "center",
        flexDirection: "row",
    },
    spanmaterialSymbolsOutlinedIcon: {
        height: Height.height_24,
        width: Width.width_24_02,
    },
    h2uppercase: {
        alignItems: "flex-start",
    },
    wordOfThe: {
        width: 112,
        height: Height.height_18,
        fontSize: FontSize.fs_12,
        lineHeight: LineHeight.lh_18,
        textTransform: "uppercase",
        textAlign: "left",
        color: Color.cinnamon,
        fontFamily: FontFamily.atkinsonHyperlegibleNext,
        fontWeight: "700",
        display: "flex",
    },
    div: {
        paddingTop: Padding.padding_8,
        alignItems: "flex-start",
        alignSelf: "stretch",
    },
    divflex3: {
        gap: 10,
        alignItems: "flex-end",
        height: Height.height_48,
    },
    spanfontBold: {
        alignItems: "flex-end",
    },
    text: {
        width: 76,
        fontSize: FontSize.fs_32,
        lineHeight: LineHeight.lh_48,
        textAlign: "right",
        justifyContent: "flex-end",
        height: Height.height_48,
        color: Color.cinnamon,
        fontFamily: FontFamily.atkinsonHyperlegibleNext,
        fontWeight: "700",
        display: "flex",
    },
    todaWrapper: {
        zIndex: 0,
        width: 67,
        height: Height.height_34,
        paddingBottom: Padding.padding_7,
        justifyContent: "flex-end",
        alignItems: "flex-start",
    },
    toda: {
        width: 70,
        height: 27,
        fontSize: FontSize.fs_18,
        lineHeight: LineHeight.lh_27,
        fontStyle: "italic",
        fontFamily: FontFamily.interLight,
        color: Color.cinnamon80,
        textAlign: "left",
    },
    ptextTertiary: {
        alignItems: "flex-start",
        alignSelf: "stretch",
    },
    thankYou: {
        fontSize: FontSize.fs_16,
        lineHeight: LineHeight.lh_24,
        fontWeight: "500",
        fontFamily: FontFamily.interMedium,
        textAlign: "left",
        color: Color.cinnamon,
        alignSelf: "stretch",
    },
});

export default WordOfTheDayFixedHeight;
