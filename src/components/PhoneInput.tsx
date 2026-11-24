// ── PhoneInput.tsx ───────────────────────────────────────────────────
// A phone field with the country codes of the people who use the app: while the
// field is empty (or holds just "+" and part of a code) a list under it offers
// 🇮🇱 Israel +972, 🇵🇭 Philippines +63, 🇮🇳 India +91… Tapping one fills it in and
// the number is typed after it. Any other code can be typed (it's plain text),
// and a number without a code that starts with 0 (05…) is taken as Israeli by
// the server (backend/services/users.js).
import * as React from "react";
import { View, Text, Pressable, TextInput, StyleProp, TextStyle } from "react-native";
import { LangCode } from "../translations";
import { themedColors, themedStyles } from "../theme";

const Color = themedColors({
    ink: "#071e27",
    muted: "#414752",
    blue: "#005dac",
    line: "#cfe6f2",
    white: "#fff",
    pressed: "#dcebf7",
});

type Country = { code: string; flag: string; name: Record<LangCode, string> };

/** In this order. Keep the codes in sync with KNOWN_CODES in backend/services/users.js. */
export const COUNTRIES: Country[] = [
    { code: "972", flag: "🇮🇱", name: { en: "Israel", tl: "Israel", ml: "ഇസ്രായേൽ", ru: "Израиль", hi: "इज़राइल", ta: "இஸ்ரேல்" } },
    { code: "63", flag: "🇵🇭", name: { en: "Philippines", tl: "Pilipinas", ml: "ഫിലിപ്പീൻസ്", ru: "Филиппины", hi: "फ़िलीपींस", ta: "பிலிப்பைன்ஸ்" } },
    { code: "91", flag: "🇮🇳", name: { en: "India", tl: "India", ml: "ഇന്ത്യ", ru: "Индия", hi: "भारत", ta: "இந்தியா" } },
    { code: "94", flag: "🇱🇰", name: { en: "Sri Lanka", tl: "Sri Lanka", ml: "ശ്രീലങ്ക", ru: "Шри-Ланка", hi: "श्रीलंका", ta: "இலங்கை" } },
    { code: "977", flag: "🇳🇵", name: { en: "Nepal", tl: "Nepal", ml: "നേപ്പാൾ", ru: "Непал", hi: "नेपाल", ta: "நேபாளம்" } },
    { code: "373", flag: "🇲🇩", name: { en: "Moldova", tl: "Moldova", ml: "മോൾഡോവ", ru: "Молдова", hi: "मोल्डोवा", ta: "மால்டோவா" } },
    { code: "998", flag: "🇺🇿", name: { en: "Uzbekistan", tl: "Uzbekistan", ml: "ഉസ്ബെക്കിസ്ഥാൻ", ru: "Узбекистан", hi: "उज़्बेकिस्तान", ta: "உஸ்பெகிஸ்தான்" } },
    { code: "380", flag: "🇺🇦", name: { en: "Ukraine", tl: "Ukraine", ml: "യുക്രെയ്ൻ", ru: "Украина", hi: "यूक्रेन", ta: "உக்ரைன்" } },
    { code: "7", flag: "🇷🇺", name: { en: "Russia", tl: "Russia", ml: "റഷ്യ", ru: "Россия", hi: "रूस", ta: "ரஷ்யா" } },
];

export const PHONE_T: Record<LangCode, { placeholder: string; hint: string }> = {
    en: {
        placeholder: "Country code + number",
        hint: "Choose your country code from the list, or type it. An Israeli number can also start with 05.",
    },
    tl: {
        placeholder: "Country code + numero",
        hint: "Piliin ang country code sa listahan, o i-type ito. Ang numerong Israeli ay puwede ring magsimula sa 05.",
    },
    ml: {
        placeholder: "രാജ്യ കോഡ് + നമ്പർ",
        hint: "പട്ടികയിൽ നിന്ന് രാജ്യ കോഡ് തിരഞ്ഞെടുക്കുക, അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക. ഇസ്രായേൽ നമ്പർ 05-ൽ തുടങ്ങാം.",
    },
    ru: {
        placeholder: "Код страны + номер",
        hint: "Выберите код страны из списка или введите его. Израильский номер можно начать с 05.",
    },
    hi: {
        placeholder: "देश कोड + नंबर",
        hint: "सूची से अपने देश का कोड चुनें या लिखें। इज़राइली नंबर 05 से भी शुरू हो सकता है।",
    },
    ta: {
        placeholder: "நாட்டுக் குறியீடு + எண்",
        hint: "பட்டியலில் இருந்து நாட்டுக் குறியீட்டைத் தேர்ந்தெடுக்கவும் அல்லது தட்டச்சு செய்யவும். இஸ்ரேல் எண் 05 இல் தொடங்கலாம்.",
    },
};

/** The countries to offer for what's typed so far (none once a code is complete). */
export function countrySuggestions(text: string): Country[] {
    const value = text.trim();
    if (!value) return COUNTRIES;
    const m = value.match(/^\+(\d*)$/);
    if (!m) return [];                       // a number is being typed (or a code and a space)
    const typed = m[1];
    const fits = COUNTRIES.filter((c) => c.code.startsWith(typed));
    // A whole code that no other code continues (+63, +7): it's chosen.
    if (fits.length === 1 && fits[0].code === typed) return [];
    return fits;
}

/** The number as it will be used: "+972 52…" for an Israeli number typed with 0. */
export function phoneForDisplay(raw: string): string {
    const v = raw.trim();
    if (v.startsWith("+") || !/^\d/.test(v) || v.replace(/\D/g, "").length < 6) return v;
    if (v.startsWith("00")) return `+${v.slice(2)}`;
    return `+972 ${v.replace(/^0/, "")}`;
}

type Props = {
    value: string;
    onChangeText: (text: string) => void;
    onSubmitEditing?: () => void;
    lang: LangCode;
    placeholderTextColor?: string;
    style?: StyleProp<TextStyle>;    // the field's own look, as for a TextInput
    autoFocus?: boolean;
};

export default function PhoneInput({ value, onChangeText, onSubmitEditing, lang, placeholderTextColor, style, autoFocus }: Props) {
    const p = PHONE_T[lang] ?? PHONE_T.en;
    const input = React.useRef<TextInput>(null);
    const [focused, setFocused] = React.useState(!!autoFocus);
    const blurTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    React.useEffect(() => () => clearTimeout(blurTimer.current), []);

    const suggestions = focused ? countrySuggestions(value) : [];

    const choose = (country: Country) => {
        clearTimeout(blurTimer.current);
        onChangeText(`+${country.code} `);
        // Back in the field, so the number can be typed right after the code.
        input.current?.focus();
        setFocused(true);
    };

    return (
        <View style={s.wrap}>
            <TextInput
                ref={input}
                style={[style, s.field]}
                placeholder={p.placeholder}
                placeholderTextColor={placeholderTextColor}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="tel"
                autoFocus={autoFocus}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmitEditing}
                onFocus={() => {
                    clearTimeout(blurTimer.current);
                    setFocused(true);
                }}
                // A moment's wait, so tapping a country (which takes the focus away
                // from the field on a computer) still counts.
                onBlur={() => {
                    blurTimer.current = setTimeout(() => setFocused(false), 250);
                }}
            />
            {suggestions.length > 0 && (
                <View style={s.list} accessibilityRole="menu">
                    {suggestions.map((c, i) => (
                        <Pressable
                            key={c.code}
                            style={({ pressed }) => [s.option, i > 0 && s.optionBorder, pressed && s.optionPressed]}
                            onPress={() => choose(c)}
                            accessibilityRole="menuitem"
                            accessibilityLabel={`${c.name[lang] ?? c.name.en} +${c.code}`}
                        >
                            <Text style={s.flag}>{c.flag}</Text>
                            <Text style={s.name} numberOfLines={1}>{c.name[lang] ?? c.name.en}</Text>
                            <Text style={s.code}>+{c.code}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
            <Text style={s.hint}>{p.hint}</Text>
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
    option: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
    optionBorder: { borderTopWidth: 1, borderTopColor: Color.line },
    optionPressed: { backgroundColor: Color.pressed },
    flag: { fontSize: 18 },
    name: { flex: 1, fontSize: 14, color: Color.ink },
    code: { fontSize: 14, fontWeight: "700", color: Color.blue },
    hint: { fontSize: 12, color: Color.muted, lineHeight: 16 },
});
