// ── EmailInput.tsx ───────────────────────────────────────────────────
// An email field with shortcuts: while typing, a list under the field offers
// the common endings (@gmail.com, @campus.haifa.ac.il, …). Tapping one fills
// it in, and the field stays plain text, so any part can still be changed –
// e.g. choose @campus.haifa.ac.il, then edit it to @is.haifa.ac.il. After the
// "@" the list keeps only the endings that start with what was typed, and it
// closes when none does (any other address can be typed as usual).
import * as React from "react";
import { View, Text, Pressable, TextInput, StyleProp, TextStyle } from "react-native";
import { themedColors, themedStyles } from "../theme";

const Color = themedColors({
    ink: "#071e27",
    muted: "#414752",
    blue: "#005dac",
    line: "#cfe6f2",
    white: "#fff",
    pressed: "#dcebf7",
});

/** The endings offered, in this order. */
export const EMAIL_DOMAINS = [
    "gmail.com",
    "campus.haifa.ac.il",
    "icloud.com",
    "rafael.co.il",
    "outlook.com",
    "hotmail.com",
    "yahoo.com",
    "walla.co.il",
];
const MAX_SHOWN = 5;

/** The addresses to offer for what's typed so far (none when nothing fits). */
export function emailSuggestions(text: string): string[] {
    const value = text.trim();
    const at = value.indexOf("@");
    const name = at === -1 ? value : value.slice(0, at);
    if (!name || /\s/.test(name)) return [];
    const typed = at === -1 ? "" : value.slice(at + 1).toLowerCase();
    if (EMAIL_DOMAINS.includes(typed)) return [];   // already complete
    return EMAIL_DOMAINS.filter((d) => d.startsWith(typed))
        .slice(0, MAX_SHOWN)
        .map((d) => `${name}@${d}`);
}

type Props = {
    value: string;
    onChangeText: (text: string) => void;
    onSubmitEditing?: () => void;
    placeholder?: string;
    placeholderTextColor?: string;
    style?: StyleProp<TextStyle>;    // the field's own look, as for a TextInput
    autoFocus?: boolean;
};

export default function EmailInput({ value, onChangeText, onSubmitEditing, placeholder, placeholderTextColor, style, autoFocus }: Props) {
    const input = React.useRef<TextInput>(null);
    const [focused, setFocused] = React.useState(!!autoFocus);
    const blurTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    React.useEffect(() => () => clearTimeout(blurTimer.current), []);

    const suggestions = focused ? emailSuggestions(value) : [];

    const choose = (email: string) => {
        clearTimeout(blurTimer.current);
        onChangeText(email);
        // Back in the field, so the address can be edited right away.
        input.current?.focus();
        setFocused(true);
    };

    return (
        <View style={s.wrap}>
            <TextInput
                ref={input}
                style={[style, s.field]}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                autoFocus={autoFocus}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmitEditing}
                onFocus={() => {
                    clearTimeout(blurTimer.current);
                    setFocused(true);
                }}
                // A moment's wait, so tapping a suggestion (which takes the focus away
                // from the field on a computer) still counts.
                onBlur={() => {
                    blurTimer.current = setTimeout(() => setFocused(false), 250);
                }}
            />
            {suggestions.length > 0 && (
                <View style={s.list} accessibilityRole="menu">
                    {suggestions.map((email, i) => {
                        const at = email.indexOf("@");
                        return (
                            <Pressable
                                key={email}
                                style={({ pressed }) => [s.option, i > 0 && s.optionBorder, pressed && s.optionPressed]}
                                onPress={() => choose(email)}
                                accessibilityRole="menuitem"
                                accessibilityLabel={email}
                            >
                                <Text style={s.optionText} numberOfLines={1}>
                                    {email.slice(0, at)}
                                    <Text style={s.domain}>{email.slice(at)}</Text>
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const s = themedStyles({
    wrap: { flex: 1, gap: 4 },
    // The field keeps its height inside the column (a "flex: 1" from its look would squash it).
    field: { flexGrow: 0, flexShrink: 0, flexBasis: "auto" },
    list: {
        borderWidth: 1,
        borderColor: Color.line,
        borderRadius: 8,
        backgroundColor: Color.white,
        overflow: "hidden",
    },
    option: { paddingHorizontal: 14, paddingVertical: 11 },
    optionBorder: { borderTopWidth: 1, borderTopColor: Color.line },
    optionPressed: { backgroundColor: Color.pressed },
    optionText: { fontSize: 14, color: Color.muted },
    domain: { color: Color.blue, fontWeight: "700" },
});
