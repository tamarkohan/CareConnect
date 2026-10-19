// ── nameStrings.ts ───────────────────────────────────────────────────
// The user's name (first name, full name or a nickname): texts of the "Your
// name" box (home page) in every app language, and nameIn(), which picks the
// spelling for the app language.
// The server spells each name in every app language's letters
// (backend/services/names.js), e.g. Rohit → रोहित (Hindi), ரோஹித் (Tamil).
import { LangCode } from "./translations";

/** Something with a name as typed and, if known, its spelling per app language. */
type Named = { displayName?: string | null; displayNames?: Partial<Record<LangCode, string>> | null; names?: Partial<Record<LangCode, string>> | null };

/** Max length of a name (first name, full name or nickname), as on the server. */
export const NAME_MAX = 30;
/** What a name box accepts while typing: letters, spaces, - and ' (no numbers, links or emojis). */
export const nameInput = (text: string) => text.replace(/[^\p{L}\p{M} .'-]/gu, "").slice(0, NAME_MAX);

/** An error from saving a name, in the app language when we know it. */
export const nameError = (err: any, lang: LangCode): string =>
    err?.code === "nameTaken" ? NAME_T[lang].nameTaken : err?.message ?? "Error";

/** The name in the letters of the app language (falls back to the name as typed). */
export const nameIn = (p: Named | null | undefined, lang: LangCode): string =>
    p?.displayNames?.[lang] || p?.names?.[lang] || p?.displayName || "";

type Strings = {
    addName: string;
    changeName: string;
    title: string;
    explain: string;        // {community}: name of the Community page
    placeholder: string;
    lettersOnly: string;
    othersSee: string;      // followed by the name in every alphabet
    othersLetters: string;  // caregivers list, under "Others see you as"
    nameTaken: string;      // another account has this name
    save: string;
    cancel: string;
};

export const NAME_T: Record<LangCode, Strings> = {
    en: {
        addName: "Add your name",
        changeName: "Change name",
        title: "Your name",
        explain: "The app greets you with this name. If you join the caregivers list ({community} page), other caregivers see this name too – each in the letters of their own app language, for example Rohit, रोहित or ரோஹித்.",
        placeholder: "Your name",
        lettersOnly: "First name, full name or a nickname – all fine. Letters only: no numbers or emojis.",
        othersSee: "In every app language:",
        othersLetters: "Each person sees your name in the letters of their own app language.",
        nameTaken: "This name is already taken. Add a letter, your last name or a nickname.",
        save: "Save",
        cancel: "Cancel",
    },
    tl: {
        addName: "Ilagay ang pangalan mo",
        changeName: "Palitan ang pangalan",
        title: "Ang pangalan mo",
        explain: "Ito ang pangalang ginagamit ng app sa pagbati sa iyo. Kung sasali ka sa listahan ng mga caregiver ({community} page), makikita rin ng ibang caregiver ang pangalang ito – sa mga letra ng wika ng kanilang app, halimbawa Rohit, रोहित o ரோஹித்.",
        placeholder: "Pangalan mo",
        lettersOnly: "First name, buong pangalan o palayaw – ayos lang lahat. Letra lang: walang numero o emoji.",
        othersSee: "Sa bawat wika ng app:",
        othersLetters: "Nakikita ng bawat isa ang pangalan mo sa mga letra ng wika ng kanilang app.",
        nameTaken: "May gumagamit na ng pangalang ito. Magdagdag ng letra, apelyido o palayaw.",
        save: "I-save",
        cancel: "Kanselahin",
    },
    ml: {
        addName: "നിങ്ങളുടെ പേര് ചേർക്കുക",
        changeName: "പേര് മാറ്റുക",
        title: "നിങ്ങളുടെ പേര്",
        explain: "ഈ പേരിലാണ് ആപ്പ് നിങ്ങളെ അഭിവാദ്യം ചെയ്യുന്നത്. നിങ്ങൾ പരിചാരകരുടെ ലിസ്റ്റിൽ ({community} പേജ്) ചേർന്നാൽ, മറ്റ് പരിചാരകരും ഈ പേര് കാണും – ഓരോരുത്തരും അവരുടെ ആപ്പ് ഭാഷയുടെ അക്ഷരങ്ങളിൽ, ഉദാഹരണത്തിന് Rohit, रोहित അല്ലെങ്കിൽ ரோஹித்.",
        placeholder: "നിങ്ങളുടെ പേര്",
        lettersOnly: "ആദ്യ പേര്, മുഴുവൻ പേര് അല്ലെങ്കിൽ വിളിപ്പേര് – എല്ലാം ശരി. അക്ഷരങ്ങൾ മാത്രം: അക്കങ്ങളോ ഇമോജികളോ വേണ്ട.",
        othersSee: "ഓരോ ആപ്പ് ഭാഷയിലും:",
        othersLetters: "ഓരോരുത്തരും നിങ്ങളുടെ പേര് അവരുടെ ആപ്പ് ഭാഷയുടെ അക്ഷരങ്ങളിൽ കാണും.",
        nameTaken: "ഈ പേര് ഇതിനകം മറ്റൊരാൾ ഉപയോഗിക്കുന്നു. ഒരു അക്ഷരമോ കുടുംബപ്പേരോ വിളിപ്പേരോ ചേർക്കുക.",
        save: "സേവ് ചെയ്യുക",
        cancel: "റദ്ദാക്കുക",
    },
    ru: {
        addName: "Добавить имя",
        changeName: "Изменить имя",
        title: "Ваше имя",
        explain: "С этим именем приложение вас приветствует. Если вы присоединитесь к списку сиделок (страница «{community}»), другие сиделки тоже увидят это имя – буквами языка своего приложения, например Rohit, Рохит или रोहित.",
        placeholder: "Ваше имя",
        lettersOnly: "Имя, имя и фамилия или прозвище – всё подходит. Только буквы: без цифр и эмодзи.",
        othersSee: "На каждом языке приложения:",
        othersLetters: "Каждый видит ваше имя буквами языка своего приложения.",
        nameTaken: "Это имя уже занято. Добавьте букву, фамилию или прозвище.",
        save: "Сохранить",
        cancel: "Отмена",
    },
    hi: {
        addName: "अपना नाम जोड़ें",
        changeName: "नाम बदलें",
        title: "आपका नाम",
        explain: "ऐप इसी नाम से आपका अभिवादन करता है। अगर आप केयरगिवर सूची ({community} पेज) में शामिल होते हैं, तो दूसरे केयरगिवर भी यह नाम देखेंगे – हर कोई अपनी ऐप भाषा के अक्षरों में, जैसे Rohit, रोहित या ரோஹித்।",
        placeholder: "आपका नाम",
        lettersOnly: "पहला नाम, पूरा नाम या उपनाम – सब ठीक है। सिर्फ़ अक्षर: अंक या इमोजी नहीं।",
        othersSee: "हर ऐप भाषा में:",
        othersLetters: "हर व्यक्ति आपका नाम अपनी ऐप भाषा के अक्षरों में देखता है।",
        nameTaken: "यह नाम पहले से किसी और का है। कोई अक्षर, अपना सरनेम या कोई उपनाम जोड़ें।",
        save: "सहेजें",
        cancel: "रद्द करें",
    },
    ta: {
        addName: "உங்கள் பெயரைச் சேர்க்கவும்",
        changeName: "பெயரை மாற்றவும்",
        title: "உங்கள் பெயர்",
        explain: "இந்தப் பெயரில்தான் ஆப் உங்களை வரவேற்கிறது. நீங்கள் பராமரிப்பாளர் பட்டியலில் ({community} பக்கம்) சேர்ந்தால், மற்ற பராமரிப்பாளர்களும் இந்தப் பெயரைப் பார்ப்பார்கள் – ஒவ்வொருவரும் தங்கள் ஆப் மொழியின் எழுத்துகளில், உதாரணமாக Rohit, रोहित அல்லது ரோஹித்.",
        placeholder: "உங்கள் பெயர்",
        lettersOnly: "முதல் பெயர், முழுப் பெயர் அல்லது புனைப்பெயர் – எல்லாம் சரி. எழுத்துகள் மட்டும்: எண்கள் அல்லது எமோஜி வேண்டாம்.",
        othersSee: "ஒவ்வொரு ஆப் மொழியிலும்:",
        othersLetters: "ஒவ்வொருவரும் உங்கள் பெயரைத் தங்கள் ஆப் மொழியின் எழுத்துகளில் பார்ப்பார்கள்.",
        nameTaken: "இந்தப் பெயர் ஏற்கனவே பயன்பாட்டில் உள்ளது. ஒரு எழுத்து, உங்கள் குடும்பப் பெயர் அல்லது புனைப்பெயரைச் சேர்க்கவும்.",
        save: "சேமி",
        cancel: "ரத்து",
    },
};
