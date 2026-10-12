// ── pageStrings.ts ───────────────────────────────────────────────────
// Texts of the home-screen pages (remittance, payslips, agency) in every app
// language. Tagalog, Malayalam and Russian should be checked by native speakers.
import { LangCode } from "./translations";

type Strings = {
    back: string;
    call: string;
    // Agency
    agencyFromContract: string;
    agencyName: string;
    employerName: string;
    agencyUnknown: string;
    openAssistant: string;
    // Remittance / converter
    converterTitle: string;
    converterHint: string;
    rateLine: string;              // {from} {to}
    ratesUpdated: string;          // {date}
    ratesSource: string;
    ratesError: string;
    retry: string;
    chooseCurrency: string;
    addCurrency: string;
    removeCurrency: string;
    search: string;
    // Payslips
    payslipsIntro: string;
    uploadPayslip: string;
    takePhoto: string;
    choosePhotos: string;
    chooseFile: string;
    cancel: string;
    readingPayslip: string;
    readingMany: string;       // {n} {total}
    uploadSummary: string;     // {ok} {total}
    uploadFailedList: string;
    retryFailed: string;
    tooManyFiles: string;      // {max}
    myPayslips: string;
    noPayslips: string;
    unknownMonth: string;
    gross: string;
    net: string;
    lines: string;
    checks: string;
    deletePayslip: string;
    deleteConfirm: string;
    download: string;
    noFile: string;
    tapForMore: string;
    explaining: string;
    faqTitle: string;
    errUpload: string;
    errTooLarge: string;
    errNotDocument: string;
};

export const PAGE_T: Record<LangCode, Strings> = {
    en: {
        back: "Back",
        call: "Call",
        agencyFromContract: "From your contract",
        agencyName: "Agency",
        employerName: "Employer",
        agencyUnknown: "Upload your work contract in the Legal assistant, and your agency's details will appear here.",
        openAssistant: "Open the Legal assistant",
        converterTitle: "Currency converter",
        converterHint: "Type an amount in any currency. Tap a currency to change it.",
        rateLine: "1 {from} = {to}",
        ratesUpdated: "Rates of {date}. Apps and banks use their own rate and fee.",
        ratesSource: "Rates by ExchangeRate-API",
        ratesError: "Couldn't load the exchange rates.",
        retry: "Try again",
        chooseCurrency: "Choose a currency",
        addCurrency: "+ Add a currency",
        removeCurrency: "Remove",
        search: "Search",
        payslipsIntro: "Upload your payslips – a PDF, a file or a photo of the paper. You get an explanation of every line in your language, and they stay saved here.",
        uploadPayslip: "Upload payslips",
        takePhoto: "Take a photo (scan the paper)",
        choosePhotos: "Choose photos – one payslip per photo",
        chooseFile: "Choose files (PDF, Word) – you can pick several",
        cancel: "Cancel",
        readingPayslip: "Reading your payslip…",
        readingMany: "Reading payslip {n} of {total}…",
        uploadSummary: "{ok} of {total} payslips uploaded.",
        uploadFailedList: "These couldn't be read:",
        retryFailed: "Try these again",
        tooManyFiles: "Please choose up to {max} files at a time.",
        myPayslips: "My payslips",
        noPayslips: "No payslips yet.",
        unknownMonth: "Month not found",
        gross: "Gross",
        net: "Net",
        lines: "What each line means",
        checks: "Worth checking",
        deletePayslip: "Delete",
        deleteConfirm: "Delete this payslip? The explanation and the original file will be deleted for good and can't be retrieved afterwards.",
        download: "⬇ Download original",
        noFile: "The original file of this payslip wasn't saved (uploaded before files were kept).",
        tapForMore: "Tap a line for more explanation.",
        explaining: "Explaining…",
        faqTitle: "Popular questions",
        errUpload: "Could not read the payslip. Please try again.",
        errTooLarge: "The file is too large (max 8 MB). Please use a smaller file or fewer photos.",
        errNotDocument: "This doesn't look like a payslip. Please choose a photo or file of your payslip.",
    },
    tl: {
        back: "Bumalik",
        call: "Tawagan",
        agencyFromContract: "Mula sa contract mo",
        agencyName: "Ahensya",
        employerName: "Employer",
        agencyUnknown: "I-upload ang work contract mo sa Legal assistant, at lalabas dito ang detalye ng ahensya mo.",
        openAssistant: "Buksan ang Legal assistant",
        converterTitle: "Currency converter",
        converterHint: "Mag-type ng halaga sa kahit anong currency. I-tap ang currency para palitan ito.",
        rateLine: "1 {from} = {to}",
        ratesUpdated: "Rate noong {date}. May sariling rate at fee ang mga app at bangko.",
        ratesSource: "Rate mula sa ExchangeRate-API",
        ratesError: "Hindi ma-load ang exchange rates.",
        retry: "Subukan ulit",
        chooseCurrency: "Pumili ng currency",
        addCurrency: "+ Magdagdag ng currency",
        removeCurrency: "Alisin",
        search: "Hanapin",
        payslipsIntro: "I-upload ang mga payslip mo – PDF, file o picture ng papel. Makakakuha ka ng paliwanag ng bawat linya sa wika mo, at mananatili silang naka-save dito.",
        uploadPayslip: "Mag-upload ng mga payslip",
        takePhoto: "Kumuha ng picture (i-scan ang papel)",
        choosePhotos: "Pumili ng mga picture – isang payslip bawat picture",
        chooseFile: "Pumili ng mga file (PDF, Word) – puwede ang marami",
        cancel: "Kanselahin",
        readingPayslip: "Binabasa ang payslip mo…",
        readingMany: "Binabasa ang payslip {n} sa {total}…",
        uploadSummary: "{ok} sa {total} na payslip ang na-upload.",
        uploadFailedList: "Hindi nabasa ang mga ito:",
        retryFailed: "Subukan ulit ang mga ito",
        tooManyFiles: "Pumili ng hanggang {max} file sa isang beses.",
        myPayslips: "Mga payslip ko",
        noPayslips: "Wala pang payslip.",
        unknownMonth: "Hindi makita ang buwan",
        gross: "Gross",
        net: "Net",
        lines: "Ibig sabihin ng bawat linya",
        checks: "Dapat i-check",
        deletePayslip: "Burahin",
        deleteConfirm: "Burahin ang payslip na ito? Mabubura nang tuluyan ang paliwanag at ang original na file, at hindi na ito maibabalik.",
        download: "⬇ I-download ang original",
        noFile: "Hindi na-save ang original na file ng payslip na ito (na-upload bago itinago ang mga file).",
        tapForMore: "I-tap ang linya para sa mas mahabang paliwanag.",
        explaining: "Ipinapaliwanag…",
        faqTitle: "Mga madalas itanong",
        errUpload: "Hindi mabasa ang payslip. Pakisubukan ulit.",
        errTooLarge: "Masyadong malaki ang file (max 8 MB). Gumamit ng mas maliit na file o mas kaunting picture.",
        errNotDocument: "Mukhang hindi ito payslip. Pumili ng picture o file ng payslip mo.",
    },
    ml: {
        back: "തിരികെ",
        call: "വിളിക്കുക",
        agencyFromContract: "നിങ്ങളുടെ കരാറിൽ നിന്ന്",
        agencyName: "ഏജൻസി",
        employerName: "തൊഴിലുടമ",
        agencyUnknown: "ലീഗൽ അസിസ്റ്റന്റിൽ നിങ്ങളുടെ തൊഴിൽ കരാർ അപ്‌ലോഡ് ചെയ്യുക, ഏജൻസിയുടെ വിവരങ്ങൾ ഇവിടെ കാണാം.",
        openAssistant: "ലീഗൽ അസിസ്റ്റന്റ് തുറക്കുക",
        converterTitle: "കറൻസി കൺവെർട്ടർ",
        converterHint: "ഏത് കറൻസിയിലും തുക ടൈപ്പ് ചെയ്യുക. മാറ്റാൻ കറൻസിയിൽ ടാപ്പ് ചെയ്യുക.",
        rateLine: "1 {from} = {to}",
        ratesUpdated: "{date} തീയതിയിലെ നിരക്ക്. ആപ്പുകളും ബാങ്കുകളും സ്വന്തം നിരക്കും ഫീസും ഉപയോഗിക്കുന്നു.",
        ratesSource: "നിരക്കുകൾ: ExchangeRate-API",
        ratesError: "വിനിമയ നിരക്കുകൾ ലോഡ് ചെയ്യാനായില്ല.",
        retry: "വീണ്ടും ശ്രമിക്കുക",
        chooseCurrency: "കറൻസി തിരഞ്ഞെടുക്കുക",
        addCurrency: "+ കറൻസി ചേർക്കുക",
        removeCurrency: "നീക്കുക",
        search: "തിരയുക",
        payslipsIntro: "നിങ്ങളുടെ ശമ്പള സ്ലിപ്പുകൾ അപ്‌ലോഡ് ചെയ്യുക – PDF, ഫയൽ, അല്ലെങ്കിൽ പേപ്പറിന്റെ ഫോട്ടോ. ഓരോ വരിയുടെയും വിശദീകരണം നിങ്ങളുടെ ഭാഷയിൽ ലഭിക്കും, അവ ഇവിടെ സേവ് ആയിരിക്കും.",
        uploadPayslip: "ശമ്പള സ്ലിപ്പുകൾ അപ്‌ലോഡ് ചെയ്യുക",
        takePhoto: "ഫോട്ടോ എടുക്കുക (പേപ്പർ സ്കാൻ ചെയ്യുക)",
        choosePhotos: "ഫോട്ടോകൾ തിരഞ്ഞെടുക്കുക – ഓരോ ഫോട്ടോയും ഒരു ശമ്പള സ്ലിപ്പ്",
        chooseFile: "ഫയലുകൾ തിരഞ്ഞെടുക്കുക (PDF, Word) – പലതും തിരഞ്ഞെടുക്കാം",
        cancel: "റദ്ദാക്കുക",
        readingPayslip: "നിങ്ങളുടെ ശമ്പള സ്ലിപ്പ് വായിക്കുന്നു…",
        readingMany: "ശമ്പള സ്ലിപ്പ് {n} / {total} വായിക്കുന്നു…",
        uploadSummary: "{total}-ൽ {ok} ശമ്പള സ്ലിപ്പുകൾ അപ്‌ലോഡ് ചെയ്തു.",
        uploadFailedList: "ഇവ വായിക്കാനായില്ല:",
        retryFailed: "ഇവ വീണ്ടും ശ്രമിക്കുക",
        tooManyFiles: "ഒരു സമയം പരമാവധി {max} ഫയലുകൾ തിരഞ്ഞെടുക്കുക.",
        myPayslips: "എന്റെ ശമ്പള സ്ലിപ്പുകൾ",
        noPayslips: "ഇതുവരെ ശമ്പള സ്ലിപ്പുകളൊന്നുമില്ല.",
        unknownMonth: "മാസം കണ്ടെത്തിയില്ല",
        gross: "മൊത്തം",
        net: "അറ്റം",
        lines: "ഓരോ വരിയുടെയും അർത്ഥം",
        checks: "പരിശോധിക്കേണ്ടവ",
        deletePayslip: "ഇല്ലാതാക്കുക",
        deleteConfirm: "ഈ ശമ്പള സ്ലിപ്പ് ഇല്ലാതാക്കണോ? വിശദീകരണവും യഥാർത്ഥ ഫയലും എന്നെന്നേക്കുമായി ഇല്ലാതാകും, പിന്നീട് തിരികെ ലഭിക്കില്ല.",
        download: "⬇ യഥാർത്ഥ ഫയൽ ഡൗൺലോഡ് ചെയ്യുക",
        noFile: "ഈ ശമ്പള സ്ലിപ്പിന്റെ യഥാർത്ഥ ഫയൽ സേവ് ചെയ്തിട്ടില്ല (ഫയലുകൾ സൂക്ഷിക്കുന്നതിന് മുമ്പ് അപ്‌ലോഡ് ചെയ്തത്).",
        tapForMore: "കൂടുതൽ വിശദീകരണത്തിന് ഒരു വരിയിൽ ടാപ്പ് ചെയ്യുക.",
        explaining: "വിശദീകരിക്കുന്നു…",
        faqTitle: "പതിവ് ചോദ്യങ്ങൾ",
        errUpload: "ശമ്പള സ്ലിപ്പ് വായിക്കാനായില്ല. വീണ്ടും ശ്രമിക്കുക.",
        errTooLarge: "ഫയൽ വളരെ വലുതാണ് (പരമാവധി 8 MB). ചെറിയ ഫയലോ കുറച്ച് ഫോട്ടോകളോ ഉപയോഗിക്കുക.",
        errNotDocument: "ഇത് ശമ്പള സ്ലിപ്പ് അല്ലെന്ന് തോന്നുന്നു. നിങ്ങളുടെ ശമ്പള സ്ലിപ്പിന്റെ ഫോട്ടോയോ ഫയലോ തിരഞ്ഞെടുക്കുക.",
    },
    ru: {
        back: "Назад",
        call: "Позвонить",
        agencyFromContract: "Из вашего договора",
        agencyName: "Агентство",
        employerName: "Работодатель",
        agencyUnknown: "Загрузите трудовой договор в юридического помощника, и данные агентства появятся здесь.",
        openAssistant: "Открыть юридического помощника",
        converterTitle: "Конвертер валют",
        converterHint: "Введите сумму в любой валюте. Нажмите на валюту, чтобы её сменить.",
        rateLine: "1 {from} = {to}",
        ratesUpdated: "Курс на {date}. У приложений и банков свой курс и комиссия.",
        ratesSource: "Курсы: ExchangeRate-API",
        ratesError: "Не удалось загрузить курсы валют.",
        retry: "Повторить",
        chooseCurrency: "Выберите валюту",
        addCurrency: "+ Добавить валюту",
        removeCurrency: "Убрать",
        search: "Поиск",
        payslipsIntro: "Загрузите расчётные листы – PDF, файл или фото бумаги. Вы получите объяснение каждой строки на своём языке, и они сохранятся здесь.",
        uploadPayslip: "Загрузить расчётные листы",
        takePhoto: "Сфотографировать (сканировать бумагу)",
        choosePhotos: "Выбрать фото – один лист на фото",
        chooseFile: "Выбрать файлы (PDF, Word) – можно несколько",
        cancel: "Отмена",
        readingPayslip: "Читаем расчётный лист…",
        readingMany: "Читаем лист {n} из {total}…",
        uploadSummary: "Загружено листов: {ok} из {total}.",
        uploadFailedList: "Не удалось прочитать:",
        retryFailed: "Повторить для них",
        tooManyFiles: "Выберите не более {max} файлов за раз.",
        myPayslips: "Мои расчётные листы",
        noPayslips: "Расчётных листов пока нет.",
        unknownMonth: "Месяц не найден",
        gross: "Брутто",
        net: "Нетто",
        lines: "Что означает каждая строка",
        checks: "Стоит проверить",
        deletePayslip: "Удалить",
        deleteConfirm: "Удалить этот расчётный лист? Объяснение и исходный файл будут удалены навсегда, восстановить их будет нельзя.",
        download: "⬇ Скачать оригинал",
        noFile: "Исходный файл этого листа не сохранён (загружен до того, как файлы начали сохраняться).",
        tapForMore: "Нажмите на строку, чтобы узнать больше.",
        explaining: "Объясняем…",
        faqTitle: "Частые вопросы",
        errUpload: "Не удалось прочитать расчётный лист. Попробуйте ещё раз.",
        errTooLarge: "Файл слишком большой (макс. 8 МБ). Используйте файл поменьше или меньше фото.",
        errNotDocument: "Это не похоже на расчётный лист. Выберите фото или файл расчётного листа.",
    },
};

/** Fill {placeholders}. */
export const fill = (text: string, values: Record<string, string>) =>
    text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
