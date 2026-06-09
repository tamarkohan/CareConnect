import * as React from "react";
import { useMemo } from "react";
import { StyleSheet, View, Text, ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import {
    Width,
    Height,
    BoxShadow,
    Border,
    Color,
    Padding,
    Gap,
    FontSize,
    LineHeight,
    FontFamily,
} from "../GlobalStyles";

export type GuidesType = {
    icon?: ImageSourcePropType;
    arrivalGuides?: string;

    /** Style props */
    guidesPaddingHorizontal?: number | string;
    guidesPaddingTop?: number | string;
    guidesPaddingBottom?: number | string;
};

const getStyleValue = (key: string, value: string | number | undefined) => {
    if (value === undefined) return;
    return { [key]: value === "unset" ? undefined : value };
};
const Guides = ({
    icon,
    arrivalGuides,
    guidesPaddingHorizontal,
    guidesPaddingTop,
    guidesPaddingBottom,
}: GuidesType) => {
    const guidesStyle = useMemo(() => {
        return {
            ...getStyleValue("paddingHorizontal", guidesPaddingHorizontal),
            ...getStyleValue("paddingTop", guidesPaddingTop),
            ...getStyleValue("paddingBottom", guidesPaddingBottom),
        };
    }, [guidesPaddingHorizontal, guidesPaddingTop, guidesPaddingBottom]);

    return (
        <View style={[styles.guides, guidesStyle]}>
            <View style={styles.spanmaterialSymbolsOutlined}>
                {icon && <Image source={icon} style={{ width: '100%', height: '100%' }} />}
            </View>
            <View style={styles.spanfontBold}>
                <Text style={styles.arrivalGuides}>{arrivalGuides}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    guides: {
        width: Width.width_165,
        height: Height.height_100,
        boxShadow: BoxShadow.shadow_drop,
        elevation: 2,
        borderRadius: Border.br_12,
        backgroundColor: Color.white02,
        borderStyle: "solid",
        borderColor: Color.linkWater,
        borderWidth: 1,
        paddingHorizontal: Padding.padding_15,
        paddingTop: Padding.padding_12,
        paddingBottom: Padding.padding_15,
        gap: Gap.gap_10,
        alignItems: "flex-start",
    },
    spanmaterialSymbolsOutlined: {
        width: Width.width_32,
        height: Height.height_32,
        alignItems: "flex-start",
    },
    spanfontBold: {
        alignItems: "flex-start",
    },
    arrivalGuides: {
        alignSelf: "stretch",
        fontSize: FontSize.fs_14,
        lineHeight: LineHeight.lh_17_5,
        fontWeight: "700",
        fontFamily: FontFamily.interBold,
        color: Color.blackPearl,
        textAlign: "left",
    },
});

export default Guides;
