// ── botStrings.ts ────────────────────────────────────────────────────
// Texts for sign-in, the legal assistant and the translator, in every app
// language. Tagalog, Malayalam, Russian, Hindi and Tamil should be checked by native speakers.
import { LangCode } from "./translations";
import { SummaryField } from "./api/client";

type Strings = {
    // Sign-in
    codeLabel: string;
    codeSent: string;          // {to}
    signIn: string;
    change: string;
    resend: string;
    sameMethodNote: string;
    errInvalidId: string;
    errInvalidCode: string;
    errExpired: string;
    errLocked: string;
    errWait: string;
    errUnavailable: string;
    errNetwork: string;
    testModeHint: string;      // {code}
    signedInAs: string;
    demoAccount: string;
    guestAccount: string;
    signInMenu: string;

    // Legal assistant
    uploadMenuTitle: string;
    takePhoto: string;
    choosePhotos: string;
    chooseFile: string;
    pasteText: string;
    cancel: string;
    pasteTitle: string;
    pasteSub: string;
    pastePh: string;
    uploadBtn: string;
    readingContract: string;
    errTooLarge: string;
    errTooManyPhotos: string;
    errUpload: string;
    contractReady: string;
    contractDeleted: string;
    summaryTitle: string;
    concernsTitle: string;
    summaryUnavailable: string;
    replaceContract: string;
    showSummary: string;
    hideSummary: string;
    fields: Record<SummaryField, string>;
    disclaimerTitle: string;
    disclaimerBody: string;
    disclaimerAccept: string;
    disclaimerFooter: string;
    clearChat: string;
    clearChatConfirm: string;
    emptyWithContract: string;
    emptyNoContract: string;
    suggestions: string[];
    guestChatNote: string;
    errAsk: string;
    savedNote: string;

    // Translator
    translateInto: string;
    clearHistory: string;
    clearHistoryConfirm: string;
    translateTitle: string;
    translatePh: string;
    translateBtn: string;
    fromPhoto: string;
    fromVoice: string;
    exampleNote: string;
    alsoMeans: string;

    // Chat translation & export
    translatingChat: string;
    showOriginal: string;
    showTranslation: string;
    exportChat: string;
    exportTitle: string;
    shareAnswer: string;
    shareWhatsApp: string;
    shareOther: string;
    copyText: string;
    copied: string;
    copyShort: string;
    exportHeader: string;
    exportYou: string;
    exportBot: string;
    exportSources: string;
};

export const BOT_T: Record<LangCode, Strings> = {
    en: {
        codeLabel: "Code",
        codeSent: "We sent a 6-digit code to {to}.",
        signIn: "Sign in →",
        change: "Change",
        resend: "Send a new code",
        sameMethodNote:
            "Your contract, chats and translations are saved to this phone number or email. Next time, sign in the same way to see them.",
        errInvalidId: "Please enter a valid phone number or email.",
        errInvalidCode: "That code is not correct.",
        errExpired: "The code has expired. Please ask for a new one.",
        errLocked: "Too many wrong tries. Please ask for a new code.",
        errWait: "Please wait 30 seconds before asking for a new code.",
        errUnavailable: "Signing in this way isn't available yet.",
        errNetwork: "Could not reach the server. Please check your connection.",
        testModeHint: "Test mode: the code is {code}",
        signedInAs: "Signed in as",
        demoAccount: "Demo account",
        guestAccount: "Not signed in (nothing is saved)",
        signInMenu: "Sign in",

        uploadMenuTitle: "Add your contract",
        takePhoto: "Take a photo",
        choosePhotos: "Choose photos (up to 5 pages)",
        chooseFile: "Files or Google Drive (PDF, Word)",
        pasteText: "Paste the text",
        cancel: "Cancel",
        pasteTitle: "Paste Your Contract",
        pasteSub: "Copy the text from your contract and paste it below. Your data stays private and is never shared.",
        pastePh: "Paste contract text here…",
        uploadBtn: "Upload Contract",
        readingContract: "Reading your contract…",
        errTooLarge: "The file is too large (max 7 MB). Please use a smaller file or fewer photos.",
        errTooManyPhotos: "Please choose up to 5 photos.",
        errUpload: "We couldn't read this file. Please try again.",
        contractReady: "✅ Your contract is saved. You can now ask me questions about your rights based on it.",
        contractDeleted: "🗑 Your contract was deleted from our server.",
        summaryTitle: "Your contract at a glance",
        concernsTitle: "Please check these points",
        summaryUnavailable: "The summary isn't ready, but you can still ask questions about your contract.",
        replaceContract: "Replace",
        showSummary: "Show summary",
        hideSummary: "Hide summary",
        fields: {
            employer: "Employer",
            agency: "Agency",
            startDate: "Start date",
            salary: "Salary",
            workingHours: "Working hours",
            restDay: "Weekly rest",
            vacation: "Vacation",
            sickLeave: "Sick leave",
            deductions: "Deductions",
            noticePeriod: "Notice period",
        },
        disclaimerTitle: "Before you start",
        disclaimerBody:
            "This assistant gives general information about workers' rights in Israel. It is not a lawyer and can make mistakes. For decisions about your own case, please talk to a certified labour lawyer or a workers' rights organisation.",
        disclaimerAccept: "I understand",
        disclaimerFooter: "ℹ️ Information only, not legal advice.",
        clearChat: "Clear chat",
        clearChatConfirm: "Delete all messages in this chat?",
        emptyWithContract: "Ask me anything about your rights or your contract.",
        emptyNoContract: "Add your contract above, then ask about your rights.",
        suggestions: [
            "How many vacation days do I get per year?",
            "Can my employer keep my passport?",
            "What is my weekly rest day?",
        ],
        guestChatNote: "You are not signed in: this chat won't be saved.",
        errAsk: "Could not reach the server. Please check your connection and try again.",
        savedNote: "🔒 Saved encrypted to your account.",

        translateInto: "Translate into:",
        clearHistory: "Clear",
        clearHistoryConfirm: "Delete your saved translations?",
        translateTitle: "Translate Text",
        translatePh: "Type or paste text in any language…",
        translateBtn: "Translate →",
        fromPhoto: "📷 Photo",
        fromVoice: "🎤 Voice",
        exampleNote: "Examples – your own translations will appear here.",
        alsoMeans: "Could also mean:",
        translatingChat: "Translating the chat into English… this can take a few seconds.",
        showOriginal: "Show original",
        showTranslation: "Show translation",
        exportChat: "Export",
        exportTitle: "Send this chat",
        shareAnswer: "Share",
        shareWhatsApp: "Send by WhatsApp",
        shareOther: "Share…",
        copyText: "Copy text",
        copied: "Copied ✓",
        copyShort: "Copy",
        exportHeader: "CareConnect – my questions about my rights",
        exportYou: "Me",
        exportBot: "CareConnect assistant",
        exportSources: "Sources",
    },
    tl: {
        codeLabel: "Code",
        codeSent: "Nagpadala kami ng 6-digit na code sa {to}.",
        signIn: "Mag-sign in →",
        change: "Palitan",
        resend: "Magpadala ng bagong code",
        sameMethodNote:
            "Ang iyong kontrata, mga chat at mga salin ay naka-save sa numerong ito o email. Sa susunod, mag-sign in sa parehong paraan para makita ang mga ito.",
        errInvalidId: "Pakilagay ang tamang numero ng telepono o email.",
        errInvalidCode: "Mali ang code.",
        errExpired: "Nag-expire na ang code. Humingi ng bago.",
        errLocked: "Masyadong maraming maling subok. Humingi ng bagong code.",
        errWait: "Maghintay ng 30 segundo bago humingi ng bagong code.",
        errUnavailable: "Hindi pa available ang ganitong pag-sign in.",
        errNetwork: "Hindi maabot ang server. Pakisuri ang iyong koneksyon.",
        testModeHint: "Test mode: ang code ay {code}",
        signedInAs: "Naka-sign in bilang",
        demoAccount: "Demo account",
        guestAccount: "Hindi naka-sign in (walang mase-save)",
        signInMenu: "Mag-sign in",

        uploadMenuTitle: "Idagdag ang iyong kontrata",
        takePhoto: "Kumuha ng litrato",
        choosePhotos: "Pumili ng mga litrato (hanggang 5 pahina)",
        chooseFile: "Files o Google Drive (PDF, Word)",
        pasteText: "I-paste ang teksto",
        cancel: "Kanselahin",
        pasteTitle: "I-paste ang Iyong Kontrata",
        pasteSub: "Kopyahin ang teksto ng iyong kontrata at i-paste sa ibaba. Pribado ang iyong datos at hindi ibinabahagi.",
        pastePh: "I-paste dito ang teksto ng kontrata…",
        uploadBtn: "I-upload ang Kontrata",
        readingContract: "Binabasa ang iyong kontrata…",
        errTooLarge: "Masyadong malaki ang file (max 7 MB). Gumamit ng mas maliit na file o mas kaunting litrato.",
        errTooManyPhotos: "Pumili ng hanggang 5 litrato.",
        errUpload: "Hindi namin mabasa ang file na ito. Subukan muli.",
        contractReady: "✅ Naka-save ang iyong kontrata. Maaari ka nang magtanong tungkol sa iyong mga karapatan batay dito.",
        contractDeleted: "🗑 Nabura na ang iyong kontrata sa aming server.",
        summaryTitle: "Ang iyong kontrata sa madaling sabi",
        concernsTitle: "Pakisuri ang mga puntong ito",
        summaryUnavailable: "Hindi pa handa ang buod, pero maaari ka pa ring magtanong tungkol sa iyong kontrata.",
        replaceContract: "Palitan",
        showSummary: "Ipakita ang buod",
        hideSummary: "Itago ang buod",
        fields: {
            employer: "Employer",
            agency: "Ahensya",
            startDate: "Petsa ng simula",
            salary: "Sahod",
            workingHours: "Oras ng trabaho",
            restDay: "Lingguhang pahinga",
            vacation: "Bakasyon",
            sickLeave: "Sick leave",
            deductions: "Mga kaltas",
            noticePeriod: "Abiso bago umalis",
        },
        disclaimerTitle: "Bago ka magsimula",
        disclaimerBody:
            "Nagbibigay ang assistant na ito ng pangkalahatang impormasyon tungkol sa karapatan ng mga manggagawa sa Israel. Hindi ito abogado at maaaring magkamali. Para sa desisyon tungkol sa iyong sariling kaso, kumausap ng lisensyadong labor lawyer o organisasyon para sa karapatan ng manggagawa.",
        disclaimerAccept: "Naiintindihan ko",
        disclaimerFooter: "ℹ️ Impormasyon lamang, hindi legal na payo.",
        clearChat: "Burahin ang chat",
        clearChatConfirm: "Burahin ang lahat ng mensahe sa chat na ito?",
        emptyWithContract: "Magtanong ng kahit ano tungkol sa iyong mga karapatan o kontrata.",
        emptyNoContract: "Idagdag ang iyong kontrata sa itaas, saka magtanong tungkol sa iyong mga karapatan.",
        suggestions: [
            "Ilang araw ng bakasyon ang meron ako bawat taon?",
            "Puwede bang itago ng employer ang passport ko?",
            "Ano ang aking lingguhang araw ng pahinga?",
        ],
        guestChatNote: "Hindi ka naka-sign in: hindi mase-save ang chat na ito.",
        errAsk: "Hindi maabot ang server. Pakisuri ang koneksyon at subukan muli.",
        savedNote: "🔒 Naka-save nang naka-encrypt sa iyong account.",

        translateInto: "Isalin sa:",
        clearHistory: "Burahin",
        clearHistoryConfirm: "Burahin ang iyong mga naka-save na salin?",
        translateTitle: "Isalin ang Teksto",
        translatePh: "Mag-type o mag-paste ng teksto sa anumang wika…",
        translateBtn: "Isalin →",
        fromPhoto: "📷 Litrato",
        fromVoice: "🎤 Boses",
        exampleNote: "Mga halimbawa – dito lalabas ang sarili mong mga salin.",
        alsoMeans: "Maaari ring mangahulugang:",
        translatingChat: "Isinasalin ang chat sa Tagalog… maaaring tumagal ito ng ilang segundo.",
        showOriginal: "Ipakita ang orihinal",
        showTranslation: "Ipakita ang salin",
        exportChat: "I-export",
        exportTitle: "Ipadala ang chat na ito",
        shareAnswer: "Ibahagi",
        shareWhatsApp: "Ipadala sa WhatsApp",
        shareOther: "Ibahagi…",
        copyText: "Kopyahin ang teksto",
        copied: "Nakopya ✓",
        copyShort: "Kopyahin",
        exportHeader: "CareConnect – mga tanong ko tungkol sa aking mga karapatan",
        exportYou: "Ako",
        exportBot: "CareConnect assistant",
        exportSources: "Mga pinagkunan",
    },
    ml: {
        codeLabel: "കോഡ്",
        codeSent: "{to} ലേക്ക് ഞങ്ങൾ 6 അക്ക കോഡ് അയച്ചു.",
        signIn: "സൈൻ ഇൻ →",
        change: "മാറ്റുക",
        resend: "പുതിയ കോഡ് അയക്കുക",
        sameMethodNote:
            "നിങ്ങളുടെ കരാർ, ചാറ്റുകൾ, വിവർത്തനങ്ങൾ എന്നിവ ഈ ഫോൺ നമ്പറിലോ ഇമെയിലിലോ സേവ് ചെയ്യപ്പെടുന്നു. അടുത്ത തവണ അവ കാണാൻ ഇതേ രീതിയിൽ സൈൻ ഇൻ ചെയ്യുക.",
        errInvalidId: "ശരിയായ ഫോൺ നമ്പറോ ഇമെയിലോ നൽകുക.",
        errInvalidCode: "ഈ കോഡ് ശരിയല്ല.",
        errExpired: "കോഡിന്റെ കാലാവധി കഴിഞ്ഞു. പുതിയത് ആവശ്യപ്പെടുക.",
        errLocked: "വളരെയധികം തെറ്റായ ശ്രമങ്ങൾ. പുതിയ കോഡ് ആവശ്യപ്പെടുക.",
        errWait: "പുതിയ കോഡ് ചോദിക്കുന്നതിന് മുമ്പ് 30 സെക്കൻഡ് കാത്തിരിക്കുക.",
        errUnavailable: "ഈ രീതിയിലുള്ള സൈൻ ഇൻ ഇപ്പോൾ ലഭ്യമല്ല.",
        errNetwork: "സെർവറിൽ എത്താനായില്ല. നിങ്ങളുടെ കണക്ഷൻ പരിശോധിക്കുക.",
        testModeHint: "ടെസ്റ്റ് മോഡ്: കോഡ് {code} ആണ്",
        signedInAs: "സൈൻ ഇൻ ചെയ്തത്",
        demoAccount: "ഡെമോ അക്കൗണ്ട്",
        guestAccount: "സൈൻ ഇൻ ചെയ്തിട്ടില്ല (ഒന്നും സേവ് ചെയ്യില്ല)",
        signInMenu: "സൈൻ ഇൻ",

        uploadMenuTitle: "നിങ്ങളുടെ കരാർ ചേർക്കുക",
        takePhoto: "ഫോട്ടോ എടുക്കുക",
        choosePhotos: "ഫോട്ടോകൾ തിരഞ്ഞെടുക്കുക (5 പേജ് വരെ)",
        chooseFile: "ഫയലുകൾ അല്ലെങ്കിൽ Google Drive (PDF, Word)",
        pasteText: "ടെക്സ്റ്റ് പേസ്റ്റ് ചെയ്യുക",
        cancel: "റദ്ദാക്കുക",
        pasteTitle: "നിങ്ങളുടെ കരാർ പേസ്റ്റ് ചെയ്യുക",
        pasteSub: "കരാറിലെ ടെക്സ്റ്റ് കോപ്പി ചെയ്ത് താഴെ പേസ്റ്റ് ചെയ്യുക. നിങ്ങളുടെ വിവരങ്ങൾ സ്വകാര്യമാണ്, ആരുമായും പങ്കിടില്ല.",
        pastePh: "കരാർ ടെക്സ്റ്റ് ഇവിടെ പേസ്റ്റ് ചെയ്യുക…",
        uploadBtn: "കരാർ അപ്‌ലോഡ് ചെയ്യുക",
        readingContract: "നിങ്ങളുടെ കരാർ വായിക്കുന്നു…",
        errTooLarge: "ഫയൽ വളരെ വലുതാണ് (പരമാവധി 7 MB). ചെറിയ ഫയലോ കുറച്ച് ഫോട്ടോകളോ ഉപയോഗിക്കുക.",
        errTooManyPhotos: "5 ഫോട്ടോകൾ വരെ തിരഞ്ഞെടുക്കുക.",
        errUpload: "ഈ ഫയൽ വായിക്കാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
        contractReady: "✅ നിങ്ങളുടെ കരാർ സേവ് ചെയ്തു. ഇതിനെ അടിസ്ഥാനമാക്കി നിങ്ങളുടെ അവകാശങ്ങളെക്കുറിച്ച് ചോദിക്കാം.",
        contractDeleted: "🗑 നിങ്ങളുടെ കരാർ ഞങ്ങളുടെ സെർവറിൽ നിന്ന് ഇല്ലാതാക്കി.",
        summaryTitle: "നിങ്ങളുടെ കരാർ ഒറ്റനോട്ടത്തിൽ",
        concernsTitle: "ഈ കാര്യങ്ങൾ പരിശോധിക്കുക",
        summaryUnavailable: "സംഗ്രഹം തയ്യാറായിട്ടില്ല, എങ്കിലും കരാറിനെക്കുറിച്ച് ചോദിക്കാം.",
        replaceContract: "മാറ്റുക",
        showSummary: "സംഗ്രഹം കാണിക്കുക",
        hideSummary: "സംഗ്രഹം മറയ്ക്കുക",
        fields: {
            employer: "തൊഴിലുടമ",
            agency: "ഏജൻസി",
            startDate: "ആരംഭ തീയതി",
            salary: "ശമ്പളം",
            workingHours: "ജോലി സമയം",
            restDay: "പ്രതിവാര അവധി",
            vacation: "വാർഷിക അവധി",
            sickLeave: "അസുഖ അവധി",
            deductions: "കിഴിവുകൾ",
            noticePeriod: "നോട്ടീസ് കാലാവധി",
        },
        disclaimerTitle: "തുടങ്ങുന്നതിന് മുമ്പ്",
        disclaimerBody:
            "ഈ അസിസ്റ്റന്റ് ഇസ്രായേലിലെ തൊഴിലാളി അവകാശങ്ങളെക്കുറിച്ച് പൊതുവായ വിവരങ്ങൾ നൽകുന്നു. ഇത് ഒരു അഭിഭാഷകനല്ല, തെറ്റുകൾ സംഭവിക്കാം. നിങ്ങളുടെ സ്വന്തം കേസിലെ തീരുമാനങ്ങൾക്ക്, അംഗീകൃത തൊഴിൽ അഭിഭാഷകനെയോ തൊഴിലാളി അവകാശ സംഘടനയെയോ സമീപിക്കുക.",
        disclaimerAccept: "എനിക്ക് മനസ്സിലായി",
        disclaimerFooter: "ℹ️ വിവരങ്ങൾ മാത്രം, നിയമോപദേശമല്ല.",
        clearChat: "ചാറ്റ് മായ്ക്കുക",
        clearChatConfirm: "ഈ ചാറ്റിലെ എല്ലാ സന്ദേശങ്ങളും ഇല്ലാതാക്കണോ?",
        emptyWithContract: "നിങ്ങളുടെ അവകാശങ്ങളെക്കുറിച്ചോ കരാറിനെക്കുറിച്ചോ എന്തും ചോദിക്കൂ.",
        emptyNoContract: "മുകളിൽ നിങ്ങളുടെ കരാർ ചേർക്കുക, തുടർന്ന് അവകാശങ്ങളെക്കുറിച്ച് ചോദിക്കുക.",
        suggestions: [
            "എനിക്ക് വർഷത്തിൽ എത്ര അവധി ദിവസങ്ങൾ ഉണ്ട്?",
            "എന്റെ പാസ്‌പോർട്ട് തൊഴിലുടമയ്ക്ക് സൂക്ഷിക്കാമോ?",
            "എന്റെ പ്രതിവാര അവധി ദിവസം ഏതാണ്?",
        ],
        guestChatNote: "നിങ്ങൾ സൈൻ ഇൻ ചെയ്തിട്ടില്ല: ഈ ചാറ്റ് സേവ് ചെയ്യില്ല.",
        errAsk: "സെർവറിൽ എത്താനായില്ല. കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
        savedNote: "🔒 നിങ്ങളുടെ അക്കൗണ്ടിൽ എൻക്രിപ്റ്റ് ചെയ്ത് സേവ് ചെയ്തു.",

        translateInto: "ഇതിലേക്ക് വിവർത്തനം ചെയ്യുക:",
        clearHistory: "മായ്ക്കുക",
        clearHistoryConfirm: "സേവ് ചെയ്ത വിവർത്തനങ്ങൾ ഇല്ലാതാക്കണോ?",
        translateTitle: "ടെക്സ്റ്റ് വിവർത്തനം ചെയ്യുക",
        translatePh: "ഏത് ഭാഷയിലും ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ പേസ്റ്റ് ചെയ്യുക…",
        translateBtn: "വിവർത്തനം →",
        fromPhoto: "📷 ഫോട്ടോ",
        fromVoice: "🎤 ശബ്ദം",
        exampleNote: "ഉദാഹരണങ്ങൾ – നിങ്ങളുടെ വിവർത്തനങ്ങൾ ഇവിടെ കാണാം.",
        alsoMeans: "ഇതിനും അർത്ഥമാകാം:",
        translatingChat: "ചാറ്റ് മലയാളത്തിലേക്ക് വിവർത്തനം ചെയ്യുന്നു… കുറച്ച് സെക്കൻഡ് എടുത്തേക്കാം.",
        showOriginal: "യഥാർത്ഥം കാണിക്കുക",
        showTranslation: "വിവർത്തനം കാണിക്കുക",
        exportChat: "എക്സ്പോർട്ട്",
        exportTitle: "ഈ ചാറ്റ് അയക്കുക",
        shareAnswer: "പങ്കിടുക",
        shareWhatsApp: "WhatsApp വഴി അയക്കുക",
        shareOther: "പങ്കിടുക…",
        copyText: "ടെക്സ്റ്റ് കോപ്പി ചെയ്യുക",
        copied: "കോപ്പി ചെയ്തു ✓",
        copyShort: "കോപ്പി",
        exportHeader: "CareConnect – എന്റെ അവകാശങ്ങളെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾ",
        exportYou: "ഞാൻ",
        exportBot: "CareConnect അസിസ്റ്റന്റ്",
        exportSources: "ഉറവിടങ്ങൾ",
    },
    ru: {
        codeLabel: "Код",
        codeSent: "Мы отправили 6-значный код на {to}.",
        signIn: "Войти →",
        change: "Изменить",
        resend: "Отправить новый код",
        sameMethodNote:
            "Ваш договор, чаты и переводы сохраняются за этим номером телефона или email. В следующий раз входите тем же способом, чтобы их увидеть.",
        errInvalidId: "Введите правильный номер телефона или email.",
        errInvalidCode: "Неверный код.",
        errExpired: "Срок действия кода истёк. Запросите новый.",
        errLocked: "Слишком много неверных попыток. Запросите новый код.",
        errWait: "Подождите 30 секунд, прежде чем запросить новый код.",
        errUnavailable: "Вход этим способом пока недоступен.",
        errNetwork: "Нет связи с сервером. Проверьте подключение.",
        testModeHint: "Тестовый режим: код {code}",
        signedInAs: "Вы вошли как",
        demoAccount: "Демо-аккаунт",
        guestAccount: "Вы не вошли (ничего не сохраняется)",
        signInMenu: "Войти",

        uploadMenuTitle: "Добавьте ваш договор",
        takePhoto: "Сделать фото",
        choosePhotos: "Выбрать фото (до 5 страниц)",
        chooseFile: "Файлы или Google Диск (PDF, Word)",
        pasteText: "Вставить текст",
        cancel: "Отмена",
        pasteTitle: "Вставьте ваш договор",
        pasteSub: "Скопируйте текст договора и вставьте его ниже. Ваши данные конфиденциальны и никому не передаются.",
        pastePh: "Вставьте текст договора сюда…",
        uploadBtn: "Загрузить договор",
        readingContract: "Читаем ваш договор…",
        errTooLarge: "Файл слишком большой (максимум 7 МБ). Используйте файл поменьше или меньше фото.",
        errTooManyPhotos: "Выберите не более 5 фото.",
        errUpload: "Не удалось прочитать файл. Попробуйте ещё раз.",
        contractReady: "✅ Ваш договор сохранён. Теперь можно задавать вопросы о ваших правах на его основе.",
        contractDeleted: "🗑 Ваш договор удалён с нашего сервера.",
        summaryTitle: "Ваш договор вкратце",
        concernsTitle: "Проверьте эти пункты",
        summaryUnavailable: "Краткое содержание не готово, но вы можете задавать вопросы о договоре.",
        replaceContract: "Заменить",
        showSummary: "Показать кратко",
        hideSummary: "Скрыть",
        fields: {
            employer: "Работодатель",
            agency: "Агентство",
            startDate: "Дата начала",
            salary: "Зарплата",
            workingHours: "Часы работы",
            restDay: "Выходной день",
            vacation: "Отпуск",
            sickLeave: "Больничный",
            deductions: "Вычеты",
            noticePeriod: "Срок уведомления",
        },
        disclaimerTitle: "Прежде чем начать",
        disclaimerBody:
            "Этот помощник даёт общую информацию о правах работников в Израиле. Он не юрист и может ошибаться. Для решений по вашему случаю обратитесь к дипломированному юристу по трудовому праву или в организацию по защите прав работников.",
        disclaimerAccept: "Понятно",
        disclaimerFooter: "ℹ️ Только информация, не юридическая консультация.",
        clearChat: "Очистить чат",
        clearChatConfirm: "Удалить все сообщения в этом чате?",
        emptyWithContract: "Спросите что угодно о ваших правах или договоре.",
        emptyNoContract: "Добавьте договор выше, затем спросите о ваших правах.",
        suggestions: [
            "Сколько дней отпуска мне положено в год?",
            "Может ли работодатель хранить мой паспорт?",
            "Какой у меня выходной день?",
        ],
        guestChatNote: "Вы не вошли в аккаунт: этот чат не будет сохранён.",
        errAsk: "Нет связи с сервером. Проверьте подключение и попробуйте ещё раз.",
        savedNote: "🔒 Сохранено в зашифрованном виде в вашем аккаунте.",

        translateInto: "Перевести на:",
        clearHistory: "Очистить",
        clearHistoryConfirm: "Удалить сохранённые переводы?",
        translateTitle: "Перевод текста",
        translatePh: "Введите или вставьте текст на любом языке…",
        translateBtn: "Перевести →",
        fromPhoto: "📷 Фото",
        fromVoice: "🎤 Голос",
        exampleNote: "Примеры – здесь появятся ваши переводы.",
        alsoMeans: "Может также означать:",
        translatingChat: "Переводим чат на русский… это может занять несколько секунд.",
        showOriginal: "Показать оригинал",
        showTranslation: "Показать перевод",
        exportChat: "Экспорт",
        exportTitle: "Отправить этот чат",
        shareAnswer: "Поделиться",
        shareWhatsApp: "Отправить в WhatsApp",
        shareOther: "Поделиться…",
        copyText: "Скопировать текст",
        copied: "Скопировано ✓",
        copyShort: "Копировать",
        exportHeader: "CareConnect – мои вопросы о моих правах",
        exportYou: "Я",
        exportBot: "Помощник CareConnect",
        exportSources: "Источники",
    },
    hi: {
        codeLabel: "कोड",
        codeSent: "हमने {to} पर 6 अंकों का कोड भेजा है।",
        signIn: "साइन इन करें →",
        change: "बदलें",
        resend: "नया कोड भेजें",
        sameMethodNote:
            "आपका अनुबंध, चैट और अनुवाद इसी फ़ोन नंबर या ईमेल पर सहेजे जाते हैं। अगली बार इन्हें देखने के लिए इसी तरह साइन इन करें।",
        errInvalidId: "कृपया सही फ़ोन नंबर या ईमेल डालें।",
        errInvalidCode: "यह कोड सही नहीं है।",
        errExpired: "कोड की समय-सीमा खत्म हो गई। कृपया नया कोड मांगें।",
        errLocked: "बहुत बार गलत कोड डाला गया। कृपया नया कोड मांगें।",
        errWait: "नया कोड मांगने से पहले 30 सेकंड रुकें।",
        errUnavailable: "इस तरह साइन इन करना अभी उपलब्ध नहीं है।",
        errNetwork: "सर्वर तक नहीं पहुँच सके। कृपया अपना इंटरनेट जाँचें।",
        testModeHint: "टेस्ट मोड: कोड है {code}",
        signedInAs: "इस खाते से साइन इन:",
        demoAccount: "डेमो खाता",
        guestAccount: "साइन इन नहीं (कुछ भी सहेजा नहीं जाता)",
        signInMenu: "साइन इन",

        uploadMenuTitle: "अपना अनुबंध जोड़ें",
        takePhoto: "फ़ोटो लें",
        choosePhotos: "फ़ोटो चुनें (5 पेज तक)",
        chooseFile: "फ़ाइलें या Google Drive (PDF, Word)",
        pasteText: "टेक्स्ट पेस्ट करें",
        cancel: "रद्द करें",
        pasteTitle: "अपना अनुबंध पेस्ट करें",
        pasteSub: "अपने अनुबंध का टेक्स्ट कॉपी करके नीचे पेस्ट करें। आपका डेटा निजी रहता है और किसी से साझा नहीं होता।",
        pastePh: "अनुबंध का टेक्स्ट यहाँ पेस्ट करें…",
        uploadBtn: "अनुबंध अपलोड करें",
        readingContract: "आपका अनुबंध पढ़ा जा रहा है…",
        errTooLarge: "फ़ाइल बहुत बड़ी है (अधिकतम 7 MB)। छोटी फ़ाइल या कम फ़ोटो इस्तेमाल करें।",
        errTooManyPhotos: "कृपया 5 तक फ़ोटो चुनें।",
        errUpload: "हम यह फ़ाइल नहीं पढ़ सके। कृपया फिर कोशिश करें।",
        contractReady: "✅ आपका अनुबंध सहेज लिया गया। अब आप इसके आधार पर अपने अधिकारों के बारे में सवाल पूछ सकते हैं।",
        contractDeleted: "🗑 आपका अनुबंध हमारे सर्वर से मिटा दिया गया।",
        summaryTitle: "आपका अनुबंध एक नज़र में",
        concernsTitle: "कृपया ये बातें जाँचें",
        summaryUnavailable: "सारांश तैयार नहीं है, लेकिन आप फिर भी अपने अनुबंध के बारे में सवाल पूछ सकते हैं।",
        replaceContract: "बदलें",
        showSummary: "सारांश दिखाएँ",
        hideSummary: "सारांश छिपाएँ",
        fields: {
            employer: "नियोक्ता",
            agency: "एजेंसी",
            startDate: "शुरू होने की तारीख",
            salary: "वेतन",
            workingHours: "काम के घंटे",
            restDay: "साप्ताहिक छुट्टी",
            vacation: "छुट्टियाँ",
            sickLeave: "बीमारी की छुट्टी",
            deductions: "कटौतियाँ",
            noticePeriod: "नोटिस अवधि",
        },
        disclaimerTitle: "शुरू करने से पहले",
        disclaimerBody:
            "यह सहायक इज़राइल में कामगारों के अधिकारों के बारे में सामान्य जानकारी देता है। यह वकील नहीं है और गलती कर सकता है। अपने मामले के फ़ैसलों के लिए किसी प्रमाणित श्रम वकील या कामगार अधिकार संगठन से बात करें।",
        disclaimerAccept: "मैं समझ गया/गई",
        disclaimerFooter: "ℹ️ सिर्फ़ जानकारी, कानूनी सलाह नहीं।",
        clearChat: "चैट मिटाएँ",
        clearChatConfirm: "इस चैट के सभी संदेश मिटाएँ?",
        emptyWithContract: "अपने अधिकारों या अनुबंध के बारे में कुछ भी पूछें।",
        emptyNoContract: "ऊपर अपना अनुबंध जोड़ें, फिर अपने अधिकारों के बारे में पूछें।",
        suggestions: [
            "मुझे साल में कितनी छुट्टियाँ मिलती हैं?",
            "क्या मेरा नियोक्ता मेरा पासपोर्ट रख सकता है?",
            "मेरी साप्ताहिक छुट्टी कौन-सा दिन है?",
        ],
        guestChatNote: "आप साइन इन नहीं हैं: यह चैट सहेजी नहीं जाएगी।",
        errAsk: "सर्वर तक नहीं पहुँच सके। कृपया इंटरनेट जाँचकर फिर कोशिश करें।",
        savedNote: "🔒 आपके खाते में एन्क्रिप्ट करके सहेजा गया।",

        translateInto: "इसमें अनुवाद करें:",
        clearHistory: "मिटाएँ",
        clearHistoryConfirm: "अपने सहेजे गए अनुवाद मिटाएँ?",
        translateTitle: "टेक्स्ट का अनुवाद",
        translatePh: "किसी भी भाषा में टेक्स्ट लिखें या पेस्ट करें…",
        translateBtn: "अनुवाद करें →",
        fromPhoto: "📷 फ़ोटो",
        fromVoice: "🎤 आवाज़",
        exampleNote: "उदाहरण – आपके अपने अनुवाद यहाँ दिखेंगे।",
        alsoMeans: "इसका मतलब यह भी हो सकता है:",
        translatingChat: "चैट का हिंदी में अनुवाद हो रहा है… इसमें कुछ सेकंड लग सकते हैं।",
        showOriginal: "मूल दिखाएँ",
        showTranslation: "अनुवाद दिखाएँ",
        exportChat: "एक्सपोर्ट",
        exportTitle: "यह चैट भेजें",
        shareAnswer: "शेयर करें",
        shareWhatsApp: "WhatsApp से भेजें",
        shareOther: "शेयर करें…",
        copyText: "टेक्स्ट कॉपी करें",
        copied: "कॉपी हो गया ✓",
        copyShort: "कॉपी",
        exportHeader: "CareConnect – मेरे अधिकारों के बारे में मेरे सवाल",
        exportYou: "मैं",
        exportBot: "CareConnect सहायक",
        exportSources: "स्रोत",
    },
    ta: {
        codeLabel: "குறியீடு",
        codeSent: "{to}-க்கு 6 இலக்க குறியீட்டை அனுப்பினோம்.",
        signIn: "உள்நுழை →",
        change: "மாற்று",
        resend: "புதிய குறியீடு அனுப்பு",
        sameMethodNote:
            "உங்கள் ஒப்பந்தம், உரையாடல்கள், மொழிபெயர்ப்புகள் இந்த தொலைபேசி எண் அல்லது மின்னஞ்சலில் சேமிக்கப்படும். அடுத்த முறை அவற்றைப் பார்க்க இதே வழியில் உள்நுழையுங்கள்.",
        errInvalidId: "சரியான தொலைபேசி எண் அல்லது மின்னஞ்சலை உள்ளிடவும்.",
        errInvalidCode: "இந்தக் குறியீடு சரியில்லை.",
        errExpired: "குறியீட்டின் காலம் முடிந்தது. புதிய குறியீட்டைக் கேளுங்கள்.",
        errLocked: "பல முறை தவறாக உள்ளிட்டீர்கள். புதிய குறியீட்டைக் கேளுங்கள்.",
        errWait: "புதிய குறியீடு கேட்கும் முன் 30 வினாடிகள் காத்திருங்கள்.",
        errUnavailable: "இந்த வழியில் உள்நுழைவது இன்னும் கிடைக்கவில்லை.",
        errNetwork: "சர்வரை அடைய முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்.",
        testModeHint: "சோதனை முறை: குறியீடு {code}",
        signedInAs: "உள்நுழைந்த கணக்கு:",
        demoAccount: "டெமோ கணக்கு",
        guestAccount: "உள்நுழையவில்லை (எதுவும் சேமிக்கப்படாது)",
        signInMenu: "உள்நுழை",

        uploadMenuTitle: "உங்கள் ஒப்பந்தத்தைச் சேர்க்கவும்",
        takePhoto: "புகைப்படம் எடுக்கவும்",
        choosePhotos: "புகைப்படங்களைத் தேர்வு செய்யவும் (5 பக்கங்கள் வரை)",
        chooseFile: "கோப்புகள் அல்லது Google Drive (PDF, Word)",
        pasteText: "உரையை ஒட்டவும்",
        cancel: "ரத்து",
        pasteTitle: "உங்கள் ஒப்பந்தத்தை ஒட்டவும்",
        pasteSub: "ஒப்பந்தத்தின் உரையை நகலெடுத்து கீழே ஒட்டவும். உங்கள் தகவல்கள் தனிப்பட்டவை, யாருடனும் பகிரப்படாது.",
        pastePh: "ஒப்பந்த உரையை இங்கே ஒட்டவும்…",
        uploadBtn: "ஒப்பந்தத்தைப் பதிவேற்று",
        readingContract: "உங்கள் ஒப்பந்தம் படிக்கப்படுகிறது…",
        errTooLarge: "கோப்பு மிகப் பெரியது (அதிகபட்சம் 7 MB). சிறிய கோப்பு அல்லது குறைவான புகைப்படங்களைப் பயன்படுத்தவும்.",
        errTooManyPhotos: "5 புகைப்படங்கள் வரை தேர்வு செய்யவும்.",
        errUpload: "இந்தக் கோப்பைப் படிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
        contractReady: "✅ உங்கள் ஒப்பந்தம் சேமிக்கப்பட்டது. இனி அதன் அடிப்படையில் உங்கள் உரிமைகள் பற்றி கேட்கலாம்.",
        contractDeleted: "🗑 உங்கள் ஒப்பந்தம் எங்கள் சர்வரிலிருந்து நீக்கப்பட்டது.",
        summaryTitle: "உங்கள் ஒப்பந்தம் ஒரே பார்வையில்",
        concernsTitle: "இந்த விஷயங்களைச் சரிபார்க்கவும்",
        summaryUnavailable: "சுருக்கம் தயாராகவில்லை, ஆனாலும் உங்கள் ஒப்பந்தம் பற்றி கேள்விகள் கேட்கலாம்.",
        replaceContract: "மாற்று",
        showSummary: "சுருக்கத்தைக் காட்டு",
        hideSummary: "சுருக்கத்தை மறை",
        fields: {
            employer: "முதலாளி",
            agency: "ஏஜென்சி",
            startDate: "தொடக்க தேதி",
            salary: "சம்பளம்",
            workingHours: "வேலை நேரம்",
            restDay: "வார விடுமுறை",
            vacation: "விடுமுறை",
            sickLeave: "நோய் விடுப்பு",
            deductions: "பிடித்தங்கள்",
            noticePeriod: "அறிவிப்புக் காலம்",
        },
        disclaimerTitle: "தொடங்கும் முன்",
        disclaimerBody:
            "இந்த உதவியாளர் இஸ்ரேலில் தொழிலாளர் உரிமைகள் பற்றி பொதுவான தகவல்களை வழங்குகிறது. இது வழக்கறிஞர் அல்ல, தவறுகள் செய்யலாம். உங்கள் சொந்த விஷயத்தில் முடிவெடுக்க, சான்றளிக்கப்பட்ட தொழிலாளர் வழக்கறிஞர் அல்லது தொழிலாளர் உரிமை அமைப்பிடம் பேசுங்கள்.",
        disclaimerAccept: "புரிந்துகொண்டேன்",
        disclaimerFooter: "ℹ️ தகவல் மட்டுமே, சட்ட ஆலோசனை அல்ல.",
        clearChat: "உரையாடலை அழி",
        clearChatConfirm: "இந்த உரையாடலின் எல்லா செய்திகளையும் நீக்கவா?",
        emptyWithContract: "உங்கள் உரிமைகள் அல்லது ஒப்பந்தம் பற்றி எதையும் கேளுங்கள்.",
        emptyNoContract: "மேலே உங்கள் ஒப்பந்தத்தைச் சேர்த்து, பின் உங்கள் உரிமைகள் பற்றி கேளுங்கள்.",
        suggestions: [
            "எனக்கு ஆண்டுக்கு எத்தனை விடுமுறை நாட்கள் கிடைக்கும்?",
            "என் முதலாளி என் பாஸ்போர்ட்டை வைத்துக்கொள்ளலாமா?",
            "என் வார விடுமுறை நாள் எது?",
        ],
        guestChatNote: "நீங்கள் உள்நுழையவில்லை: இந்த உரையாடல் சேமிக்கப்படாது.",
        errAsk: "சர்வரை அடைய முடியவில்லை. இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
        savedNote: "🔒 உங்கள் கணக்கில் மறைகுறியாக்கம் செய்து சேமிக்கப்பட்டது.",

        translateInto: "இதில் மொழிபெயர்:",
        clearHistory: "அழி",
        clearHistoryConfirm: "சேமித்த மொழிபெயர்ப்புகளை நீக்கவா?",
        translateTitle: "உரையை மொழிபெயர்",
        translatePh: "எந்த மொழியிலும் உரையை எழுதுங்கள் அல்லது ஒட்டுங்கள்…",
        translateBtn: "மொழிபெயர் →",
        fromPhoto: "📷 புகைப்படம்",
        fromVoice: "🎤 குரல்",
        exampleNote: "உதாரணங்கள் – உங்கள் மொழிபெயர்ப்புகள் இங்கே தோன்றும்.",
        alsoMeans: "இதற்கு இப்படியும் பொருள் இருக்கலாம்:",
        translatingChat: "உரையாடல் தமிழில் மொழிபெயர்க்கப்படுகிறது… சில வினாடிகள் ஆகலாம்.",
        showOriginal: "மூலத்தைக் காட்டு",
        showTranslation: "மொழிபெயர்ப்பைக் காட்டு",
        exportChat: "ஏற்றுமதி",
        exportTitle: "இந்த உரையாடலை அனுப்பு",
        shareAnswer: "பகிர்",
        shareWhatsApp: "WhatsApp மூலம் அனுப்பு",
        shareOther: "பகிர்…",
        copyText: "உரையை நகலெடு",
        copied: "நகலெடுக்கப்பட்டது ✓",
        copyShort: "நகல்",
        exportHeader: "CareConnect – என் உரிமைகள் பற்றிய என் கேள்விகள்",
        exportYou: "நான்",
        exportBot: "CareConnect உதவியாளர்",
        exportSources: "ஆதாரங்கள்",
    },
};
