// ── tasksJournalStrings.ts ───────────────────────────────────────────
// Texts of the Tasks and Journal pages (adding, completing, sharing and deleting)
// in every app language. Tagalog, Malayalam, Russian, Hindi and Tamil should be
// checked by native speakers. Headings and the example texts are in translations.ts.
import { LangCode } from "./translations";

type Strings = {
    // Tasks
    addTask: string;
    newTask: string;             // placeholder of the task text
    time: string;
    timeHint: string;            // placeholder of the time
    badTime: string;
    save: string;
    cancel: string;
    noTasks: string;
    completed: string;           // {n}
    hideCompleted: string;
    noCompleted: string;
    doneOn: string;              // {date}
    markDone: string;            // for screen readers
    markNotDone: string;
    deleteTaskConfirm: string;
    tooManyTasks: string;
    // Journal
    deleteEntryConfirm: string;
    noEntries: string;
    journalFull: string;
    // Both
    example: string;
    share: string;
    copied: string;
    delete: string;
    loading: string;
    loadError: string;
    retry: string;
    saveError: string;
};

export const TJ_T: Record<LangCode, Strings> = {
    en: {
        addTask: "+ Add task",
        newTask: "What needs to be done?",
        time: "Time (optional)",
        timeHint: "e.g. 8:30 or 14:00",
        badTime: "Write the time like 8:30 or 14:00, or leave it empty.",
        save: "Save",
        cancel: "Cancel",
        noTasks: "Nothing to do right now. Tap “+ Add task” to add one.",
        completed: "Completed tasks ({n})",
        hideCompleted: "Hide completed tasks",
        noCompleted: "No completed tasks yet. Tick a task when it's done.",
        doneOn: "Done {date}",
        markDone: "Mark as done",
        markNotDone: "Mark as not done",
        deleteTaskConfirm: "Delete this task?",
        tooManyTasks: "You have 100 open tasks. Tick or delete some first.",
        deleteEntryConfirm: "Delete this entry? It can't be brought back.",
        noEntries: "No entries yet. Write your first one above.",
        journalFull: "Your journal is full (1000 entries). Delete some old entries first.",
        example: "Example",
        share: "Share",
        copied: "Copied ✓",
        delete: "Delete",
        loading: "Loading…",
        loadError: "Couldn't load. Check your internet connection.",
        retry: "Try again",
        saveError: "Couldn't save. Please try again.",
    },
    tl: {
        addTask: "+ Magdagdag ng gawain",
        newTask: "Ano ang kailangang gawin?",
        time: "Oras (hindi kailangan)",
        timeHint: "hal. 8:30 o 14:00",
        badTime: "Isulat ang oras tulad ng 8:30 o 14:00, o iwanang blangko.",
        save: "I-save",
        cancel: "Kanselahin",
        noTasks: "Wala pang gawain. Pindutin ang “+ Magdagdag ng gawain”.",
        completed: "Mga natapos na gawain ({n})",
        hideCompleted: "Itago ang mga natapos",
        noCompleted: "Wala pang natapos na gawain. Lagyan ng tsek ang gawain kapag tapos na.",
        doneOn: "Natapos {date}",
        markDone: "Markahan bilang tapos",
        markNotDone: "Markahan bilang hindi pa tapos",
        deleteTaskConfirm: "Burahin ang gawaing ito?",
        tooManyTasks: "May 100 gawain ka pang hindi tapos. Tapusin o burahin muna ang ilan.",
        deleteEntryConfirm: "Burahin ang entry na ito? Hindi na ito maibabalik.",
        noEntries: "Wala pang entry. Isulat ang una mo sa itaas.",
        journalFull: "Puno na ang iyong talaarawan (1000 entry). Burahin muna ang ilang luma.",
        example: "Halimbawa",
        share: "Ibahagi",
        copied: "Nakopya ✓",
        delete: "Burahin",
        loading: "Naglo-load…",
        loadError: "Hindi ma-load. Tingnan ang iyong internet.",
        retry: "Subukan ulit",
        saveError: "Hindi na-save. Pakisubukan ulit.",
    },
    ml: {
        addTask: "+ ടാസ്ക് ചേർക്കുക",
        newTask: "എന്താണ് ചെയ്യേണ്ടത്?",
        time: "സമയം (നിർബന്ധമില്ല)",
        timeHint: "ഉദാ. 8:30 അല്ലെങ്കിൽ 14:00",
        badTime: "സമയം 8:30 അല്ലെങ്കിൽ 14:00 എന്നതുപോലെ എഴുതുക, അല്ലെങ്കിൽ ഒഴിച്ചിടുക.",
        save: "സേവ് ചെയ്യുക",
        cancel: "റദ്ദാക്കുക",
        noTasks: "ഇപ്പോൾ ടാസ്ക്കുകൾ ഒന്നുമില്ല. “+ ടാസ്ക് ചേർക്കുക” അമർത്തുക.",
        completed: "പൂർത്തിയായ ടാസ്ക്കുകൾ ({n})",
        hideCompleted: "പൂർത്തിയായവ മറയ്ക്കുക",
        noCompleted: "ഇതുവരെ പൂർത്തിയായ ടാസ്ക്കുകൾ ഇല്ല. ചെയ്തു കഴിഞ്ഞാൽ ടിക്ക് ചെയ്യുക.",
        doneOn: "പൂർത്തിയായത് {date}",
        markDone: "പൂർത്തിയായി എന്ന് അടയാളപ്പെടുത്തുക",
        markNotDone: "പൂർത്തിയായിട്ടില്ല എന്ന് അടയാളപ്പെടുത്തുക",
        deleteTaskConfirm: "ഈ ടാസ്ക് ഇല്ലാതാക്കണോ?",
        tooManyTasks: "പൂർത്തിയാകാത്ത 100 ടാസ്ക്കുകൾ ഉണ്ട്. ആദ്യം ചിലത് ടിക്ക് ചെയ്യുകയോ ഇല്ലാതാക്കുകയോ ചെയ്യുക.",
        deleteEntryConfirm: "ഈ എൻട്രി ഇല്ലാതാക്കണോ? ഇത് പിന്നീട് തിരികെ ലഭിക്കില്ല.",
        noEntries: "ഇതുവരെ എൻട്രികൾ ഇല്ല. ആദ്യത്തേത് മുകളിൽ എഴുതുക.",
        journalFull: "നിങ്ങളുടെ ജേർണൽ നിറഞ്ഞു (1000 എൻട്രികൾ). ആദ്യം ചില പഴയവ ഇല്ലാതാക്കുക.",
        example: "ഉദാഹരണം",
        share: "പങ്കിടുക",
        copied: "കോപ്പി ചെയ്തു ✓",
        delete: "ഇല്ലാതാക്കുക",
        loading: "ലോഡ് ചെയ്യുന്നു…",
        loadError: "ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിക്കുക.",
        retry: "വീണ്ടും ശ്രമിക്കുക",
        saveError: "സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.",
    },
    ru: {
        addTask: "+ Добавить задачу",
        newTask: "Что нужно сделать?",
        time: "Время (необязательно)",
        timeHint: "напр. 8:30 или 14:00",
        badTime: "Напишите время как 8:30 или 14:00 или оставьте пустым.",
        save: "Сохранить",
        cancel: "Отмена",
        noTasks: "Сейчас задач нет. Нажмите «+ Добавить задачу».",
        completed: "Выполненные задачи ({n})",
        hideCompleted: "Скрыть выполненные",
        noCompleted: "Выполненных задач пока нет. Отметьте задачу, когда она сделана.",
        doneOn: "Выполнено {date}",
        markDone: "Отметить как выполненную",
        markNotDone: "Отметить как невыполненную",
        deleteTaskConfirm: "Удалить эту задачу?",
        tooManyTasks: "У вас 100 невыполненных задач. Сначала отметьте или удалите некоторые.",
        deleteEntryConfirm: "Удалить эту запись? Её нельзя будет вернуть.",
        noEntries: "Записей пока нет. Напишите первую выше.",
        journalFull: "Дневник заполнен (1000 записей). Сначала удалите старые записи.",
        example: "Пример",
        share: "Поделиться",
        copied: "Скопировано ✓",
        delete: "Удалить",
        loading: "Загрузка…",
        loadError: "Не удалось загрузить. Проверьте подключение к интернету.",
        retry: "Повторить",
        saveError: "Не удалось сохранить. Попробуйте ещё раз.",
    },
    hi: {
        addTask: "+ नया काम जोड़ें",
        newTask: "क्या करना है?",
        time: "समय (ज़रूरी नहीं)",
        timeHint: "जैसे 8:30 या 14:00",
        badTime: "समय 8:30 या 14:00 की तरह लिखें, या खाली छोड़ दें।",
        save: "सहेजें",
        cancel: "रद्द करें",
        noTasks: "अभी कोई काम नहीं है। “+ नया काम जोड़ें” दबाएँ।",
        completed: "पूरे हुए काम ({n})",
        hideCompleted: "पूरे हुए काम छिपाएँ",
        noCompleted: "अभी तक कोई काम पूरा नहीं हुआ। काम हो जाने पर उस पर टिक करें।",
        doneOn: "पूरा हुआ {date}",
        markDone: "पूरा हुआ मार्क करें",
        markNotDone: "अधूरा मार्क करें",
        deleteTaskConfirm: "यह काम मिटाएँ?",
        tooManyTasks: "आपके 100 काम बाकी हैं। पहले कुछ पर टिक करें या उन्हें मिटाएँ।",
        deleteEntryConfirm: "यह बात मिटाएँ? यह वापस नहीं मिलेगी।",
        noEntries: "अभी कुछ नहीं लिखा गया। ऊपर अपनी पहली बात लिखें।",
        journalFull: "आपकी डायरी भर गई है (1000 बातें)। पहले कुछ पुरानी बातें मिटाएँ।",
        example: "उदाहरण",
        share: "शेयर करें",
        copied: "कॉपी हो गया ✓",
        delete: "मिटाएँ",
        loading: "लोड हो रहा है…",
        loadError: "लोड नहीं हो सका। अपना इंटरनेट कनेक्शन देखें।",
        retry: "फिर कोशिश करें",
        saveError: "सहेजा नहीं जा सका। फिर कोशिश करें।",
    },
    ta: {
        addTask: "+ புதிய பணி சேர்",
        newTask: "என்ன செய்ய வேண்டும்?",
        time: "நேரம் (கட்டாயமில்லை)",
        timeHint: "எ.கா. 8:30 அல்லது 14:00",
        badTime: "நேரத்தை 8:30 அல்லது 14:00 போல எழுதுங்கள், அல்லது காலியாக விடுங்கள்.",
        save: "சேமி",
        cancel: "ரத்து",
        noTasks: "இப்போது எந்தப் பணியும் இல்லை. “+ புதிய பணி சேர்” என்பதை அழுத்துங்கள்.",
        completed: "முடிந்த பணிகள் ({n})",
        hideCompleted: "முடிந்த பணிகளை மறை",
        noCompleted: "இன்னும் முடிந்த பணிகள் இல்லை. பணி முடிந்ததும் டிக் செய்யுங்கள்.",
        doneOn: "முடிந்தது {date}",
        markDone: "முடிந்ததாகக் குறி",
        markNotDone: "முடியவில்லை எனக் குறி",
        deleteTaskConfirm: "இந்தப் பணியை நீக்கவா?",
        tooManyTasks: "முடிக்காத 100 பணிகள் உள்ளன. முதலில் சிலவற்றை டிக் செய்யுங்கள் அல்லது நீக்குங்கள்.",
        deleteEntryConfirm: "இந்தப் பதிவை நீக்கவா? இதைத் திரும்பப் பெற முடியாது.",
        noEntries: "இன்னும் பதிவுகள் இல்லை. உங்கள் முதல் பதிவை மேலே எழுதுங்கள்.",
        journalFull: "உங்கள் நாட்குறிப்பு நிரம்பிவிட்டது (1000 பதிவுகள்). முதலில் சில பழைய பதிவுகளை நீக்குங்கள்.",
        example: "உதாரணம்",
        share: "பகிர்",
        copied: "நகலெடுக்கப்பட்டது ✓",
        delete: "நீக்கு",
        loading: "ஏற்றுகிறது…",
        loadError: "ஏற்ற முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்.",
        retry: "மீண்டும் முயற்சி",
        saveError: "சேமிக்க முடியவில்லை. மீண்டும் முயற்சி செய்யுங்கள்.",
    },
};
