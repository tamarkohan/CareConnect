// ── menuStrings.ts ───────────────────────────────────────────────────
// Texts of the Profile and Settings pages (from the menu) in every app language.
// Tagalog, Malayalam, Russian, Hindi and Tamil should be checked by native speakers.
// Sign-in code errors and "Test mode" come from botStrings.ts (the login screen's).
import { LangCode } from "./translations";

type Strings = {
    // Profile
    nameTitle: string;
    nameHint: string;
    noName: string;
    add: string;
    change: string;
    signInTitle: string;
    signInHint: string;
    phone: string;
    email: string;
    notAdded: string;
    sendCode: string;
    codeSentTo: string;            // {to}
    confirm: string;
    linked: string;
    alreadyUsed: string;
    alreadyYours: string;
    demoLocked: string;
    // Settings
    languageTitle: string;
    appearanceTitle: string;
    appearanceLight: string;
    appearanceDark: string;
    appearanceSystem: string;
    remindersTitle: string;
    remindersHint: string;
    remindersOnlyApp: string;
    remindersDenied: string;
    remindBody: string;            // the text of a reminder, under the task
    legalTitle: string;
    privacy: string;
    terms: string;
    disclaimer: string;
    accountTitle: string;
    deleteAccount: string;
    deleteHint: string;
    deleteConfirm: string;
    deleteDemo: string;
};

export const MENU_T: Record<LangCode, Strings> = {
    en: {
        nameTitle: "Name others see",
        nameHint: "On the caregivers list and in invitations. Each person sees it in their own alphabet.",
        noName: "No name yet",
        add: "Add",
        change: "Change",
        signInTitle: "Ways to sign in",
        signInHint: "Add both a phone number and an email, and sign in with either one – it's the same account, with all your data.",
        phone: "Phone",
        email: "Email",
        notAdded: "Not added yet",
        sendCode: "Send code",
        codeSentTo: "We sent a code to {to}. Type it here:",
        confirm: "Confirm",
        linked: "Added ✓ – you can sign in with it now.",
        alreadyUsed: "This is already used by another account.",
        alreadyYours: "This is already on your account.",
        demoLocked: "The demo account's sign-in can't be changed.",
        languageTitle: "App language",
        appearanceTitle: "Appearance",
        appearanceLight: "Light",
        appearanceDark: "Dark",
        appearanceSystem: "Same as phone",
        remindersTitle: "Task reminders",
        remindersHint: "A reminder at the time of each task that has a time, also on its repeat days.",
        remindersOnlyApp: "Reminders work in the CareConnect phone app. A web page can't remind you when it's closed.",
        remindersDenied: "Notifications are blocked for this app. Allow them in your phone's settings, then turn reminders on again.",
        remindBody: "Time for this task ⏰",
        legalTitle: "Legal",
        privacy: "Privacy policy",
        terms: "Terms of use",
        disclaimer: "Legal assistant disclaimer",
        accountTitle: "Account",
        deleteAccount: "Delete my account",
        deleteHint: "Deletes your account and everything in it for good: contract, chats, translations, payments, tasks, journal and your place on the caregivers list.",
        deleteConfirm: "Delete your account and all its data for good? This can't be undone.",
        deleteDemo: "The demo account can't be deleted.",
    },
    tl: {
        nameTitle: "Pangalang nakikita ng iba",
        nameHint: "Sa listahan ng caregivers at sa mga imbitasyon. Makikita ito ng bawat isa sa sarili nilang alpabeto.",
        noName: "Wala pang pangalan",
        add: "Idagdag",
        change: "Palitan",
        signInTitle: "Mga paraan ng pag-sign in",
        signInHint: "Magdagdag ng phone number at email, at mag-sign in gamit ang alinman – iisang account ito, kasama ang lahat ng data mo.",
        phone: "Phone",
        email: "Email",
        notAdded: "Wala pa",
        sendCode: "Ipadala ang code",
        codeSentTo: "Nagpadala kami ng code sa {to}. I-type ito dito:",
        confirm: "Kumpirmahin",
        linked: "Naidagdag ✓ – puwede ka nang mag-sign in gamit ito.",
        alreadyUsed: "Ginagamit na ito ng ibang account.",
        alreadyYours: "Nasa account mo na ito.",
        demoLocked: "Hindi mababago ang sign-in ng demo account.",
        languageTitle: "Wika ng app",
        appearanceTitle: "Itsura",
        appearanceLight: "Maliwanag",
        appearanceDark: "Madilim",
        appearanceSystem: "Kapareho ng phone",
        remindersTitle: "Paalala sa mga gawain",
        remindersHint: "Paalala sa oras ng bawat gawaing may oras, pati sa mga araw na inuulit ito.",
        remindersOnlyApp: "Gumagana ang mga paalala sa CareConnect phone app. Hindi makapagpaalala ang web page kapag sarado ito.",
        remindersDenied: "Naka-block ang notifications para sa app na ito. Payagan ito sa settings ng phone mo, saka i-on ulit ang mga paalala.",
        remindBody: "Oras na para sa gawaing ito ⏰",
        legalTitle: "Legal",
        privacy: "Privacy policy",
        terms: "Mga tuntunin ng paggamit",
        disclaimer: "Paalala ng legal assistant",
        accountTitle: "Account",
        deleteAccount: "Burahin ang account ko",
        deleteHint: "Buburahin nang tuluyan ang account mo at lahat ng laman nito: kontrata, chat, salin, bayad, gawain, talaarawan at ang puwesto mo sa listahan ng caregivers.",
        deleteConfirm: "Burahin nang tuluyan ang account mo at lahat ng data nito? Hindi na ito maibabalik.",
        deleteDemo: "Hindi mabubura ang demo account.",
    },
    ml: {
        nameTitle: "മറ്റുള്ളവർ കാണുന്ന പേര്",
        nameHint: "കെയർഗിവർമാരുടെ ലിസ്റ്റിലും ക്ഷണങ്ങളിലും. ഓരോരുത്തരും അവരുടെ ലിപിയിൽ കാണും.",
        noName: "ഇതുവരെ പേരില്ല",
        add: "ചേർക്കുക",
        change: "മാറ്റുക",
        signInTitle: "സൈൻ ഇൻ ചെയ്യാനുള്ള വഴികൾ",
        signInHint: "ഫോൺ നമ്പറും ഇമെയിലും ചേർക്കുക, ഏതുകൊണ്ടും സൈൻ ഇൻ ചെയ്യാം – നിങ്ങളുടെ എല്ലാ വിവരങ്ങളുമുള്ള ഒരേ അക്കൗണ്ട്.",
        phone: "ഫോൺ",
        email: "ഇമെയിൽ",
        notAdded: "ഇതുവരെ ചേർത്തിട്ടില്ല",
        sendCode: "കോഡ് അയയ്ക്കുക",
        codeSentTo: "{to} എന്നതിലേക്ക് ഒരു കോഡ് അയച്ചു. അത് ഇവിടെ ടൈപ്പ് ചെയ്യുക:",
        confirm: "സ്ഥിരീകരിക്കുക",
        linked: "ചേർത്തു ✓ – ഇനി ഇതുപയോഗിച്ചും സൈൻ ഇൻ ചെയ്യാം.",
        alreadyUsed: "ഇത് മറ്റൊരു അക്കൗണ്ട് ഉപയോഗിക്കുന്നുണ്ട്.",
        alreadyYours: "ഇത് ഇതിനകം നിങ്ങളുടെ അക്കൗണ്ടിലുണ്ട്.",
        demoLocked: "ഡെമോ അക്കൗണ്ടിന്റെ സൈൻ ഇൻ മാറ്റാൻ കഴിയില്ല.",
        languageTitle: "ആപ്പിന്റെ ഭാഷ",
        appearanceTitle: "രൂപം",
        appearanceLight: "ലൈറ്റ്",
        appearanceDark: "ഡാർക്ക്",
        appearanceSystem: "ഫോണിലേതുപോലെ",
        remindersTitle: "ടാസ്ക് ഓർമ്മപ്പെടുത്തലുകൾ",
        remindersHint: "സമയമുള്ള ഓരോ ടാസ്ക്കിനും ആ സമയത്ത് ഒരു ഓർമ്മപ്പെടുത്തൽ, ആവർത്തിക്കുന്ന ദിവസങ്ങളിലും.",
        remindersOnlyApp: "ഓർമ്മപ്പെടുത്തലുകൾ CareConnect ഫോൺ ആപ്പിലാണ് പ്രവർത്തിക്കുന്നത്. വെബ് പേജ് അടച്ചിരിക്കുമ്പോൾ അതിന് ഓർമ്മിപ്പിക്കാൻ കഴിയില്ല.",
        remindersDenied: "ഈ ആപ്പിന് നോട്ടിഫിക്കേഷനുകൾ തടഞ്ഞിരിക്കുന്നു. ഫോണിന്റെ സെറ്റിംഗ്സിൽ അനുവദിച്ച്, വീണ്ടും ഓർമ്മപ്പെടുത്തലുകൾ ഓണാക്കുക.",
        remindBody: "ഈ ടാസ്ക്കിനുള്ള സമയമായി ⏰",
        legalTitle: "നിയമപരം",
        privacy: "സ്വകാര്യതാ നയം",
        terms: "ഉപയോഗ നിബന്ധനകൾ",
        disclaimer: "ലീഗൽ അസിസ്റ്റന്റ് മുന്നറിയിപ്പ്",
        accountTitle: "അക്കൗണ്ട്",
        deleteAccount: "എന്റെ അക്കൗണ്ട് ഇല്ലാതാക്കുക",
        deleteHint: "നിങ്ങളുടെ അക്കൗണ്ടും അതിലുള്ളതെല്ലാം എന്നെന്നേക്കുമായി ഇല്ലാതാക്കും: കരാർ, ചാറ്റുകൾ, വിവർത്തനങ്ങൾ, പേയ്‌മെന്റുകൾ, ടാസ്ക്കുകൾ, ജേർണൽ, കെയർഗിവർ ലിസ്റ്റിലെ നിങ്ങളുടെ സ്ഥാനം.",
        deleteConfirm: "നിങ്ങളുടെ അക്കൗണ്ടും എല്ലാ വിവരങ്ങളും എന്നെന്നേക്കുമായി ഇല്ലാതാക്കണോ? ഇത് തിരികെ ലഭിക്കില്ല.",
        deleteDemo: "ഡെമോ അക്കൗണ്ട് ഇല്ലാതാക്കാൻ കഴിയില്ല.",
    },
    ru: {
        nameTitle: "Имя, которое видят другие",
        nameHint: "В списке сиделок и в приглашениях. Каждый видит его своими буквами.",
        noName: "Имя ещё не указано",
        add: "Добавить",
        change: "Изменить",
        signInTitle: "Способы входа",
        signInHint: "Добавьте и телефон, и email – входите с любым из них: это один и тот же аккаунт со всеми вашими данными.",
        phone: "Телефон",
        email: "Email",
        notAdded: "Не добавлен",
        sendCode: "Отправить код",
        codeSentTo: "Мы отправили код на {to}. Введите его здесь:",
        confirm: "Подтвердить",
        linked: "Добавлено ✓ – теперь можно входить и с ним.",
        alreadyUsed: "Это уже используется другим аккаунтом.",
        alreadyYours: "Это уже есть в вашем аккаунте.",
        demoLocked: "Вход в демо-аккаунт изменить нельзя.",
        languageTitle: "Язык приложения",
        appearanceTitle: "Оформление",
        appearanceLight: "Светлое",
        appearanceDark: "Тёмное",
        appearanceSystem: "Как на телефоне",
        remindersTitle: "Напоминания о задачах",
        remindersHint: "Напоминание во время каждой задачи со временем, и в её дни повтора.",
        remindersOnlyApp: "Напоминания работают в приложении CareConnect на телефоне. Веб-страница не может напомнить, когда она закрыта.",
        remindersDenied: "Уведомления для этого приложения запрещены. Разрешите их в настройках телефона и снова включите напоминания.",
        remindBody: "Время для этой задачи ⏰",
        legalTitle: "Правовая информация",
        privacy: "Политика конфиденциальности",
        terms: "Условия использования",
        disclaimer: "Предупреждение юридического помощника",
        accountTitle: "Аккаунт",
        deleteAccount: "Удалить мой аккаунт",
        deleteHint: "Ваш аккаунт и всё в нём будут удалены навсегда: договор, чаты, переводы, выплаты, задачи, дневник и ваше место в списке сиделок.",
        deleteConfirm: "Удалить аккаунт и все данные навсегда? Это нельзя отменить.",
        deleteDemo: "Демо-аккаунт удалить нельзя.",
    },
    hi: {
        nameTitle: "दूसरों को दिखने वाला नाम",
        nameHint: "केयरगिवर की सूची और निमंत्रणों में। हर किसी को यह उसकी अपनी लिपि में दिखता है।",
        noName: "अभी कोई नाम नहीं",
        add: "जोड़ें",
        change: "बदलें",
        signInTitle: "साइन इन करने के तरीके",
        signInHint: "फ़ोन नंबर और ईमेल दोनों जोड़ें, और किसी से भी साइन इन करें – यह आपके सारे डेटा वाला एक ही अकाउंट है।",
        phone: "फ़ोन",
        email: "ईमेल",
        notAdded: "अभी नहीं जोड़ा",
        sendCode: "कोड भेजें",
        codeSentTo: "हमने {to} पर एक कोड भेजा है। उसे यहाँ लिखें:",
        confirm: "पक्का करें",
        linked: "जुड़ गया ✓ – अब आप इससे भी साइन इन कर सकते हैं।",
        alreadyUsed: "यह पहले से किसी दूसरे अकाउंट में इस्तेमाल हो रहा है।",
        alreadyYours: "यह पहले से आपके अकाउंट में है।",
        demoLocked: "डेमो अकाउंट का साइन इन नहीं बदला जा सकता।",
        languageTitle: "ऐप की भाषा",
        appearanceTitle: "रूप",
        appearanceLight: "हल्का",
        appearanceDark: "गहरा",
        appearanceSystem: "फ़ोन जैसा",
        remindersTitle: "काम की याद",
        remindersHint: "समय वाले हर काम के समय पर याद दिलाना, दोहराने वाले दिनों पर भी।",
        remindersOnlyApp: "याद दिलाना CareConnect फ़ोन ऐप में काम करता है। वेब पेज बंद होने पर याद नहीं दिला सकता।",
        remindersDenied: "इस ऐप के लिए नोटिफ़िकेशन बंद हैं। फ़ोन की सेटिंग में इन्हें चालू करें, फिर याद दिलाना दोबारा चालू करें।",
        remindBody: "इस काम का समय हो गया ⏰",
        legalTitle: "कानूनी जानकारी",
        privacy: "गोपनीयता नीति",
        terms: "इस्तेमाल की शर्तें",
        disclaimer: "कानूनी सहायक की सूचना",
        accountTitle: "अकाउंट",
        deleteAccount: "मेरा अकाउंट मिटाएँ",
        deleteHint: "आपका अकाउंट और उसमें सब कुछ हमेशा के लिए मिट जाएगा: अनुबंध, चैट, अनुवाद, भुगतान, काम, डायरी और केयरगिवर सूची में आपकी जगह।",
        deleteConfirm: "अपना अकाउंट और सारा डेटा हमेशा के लिए मिटाएँ? यह वापस नहीं होगा।",
        deleteDemo: "डेमो अकाउंट मिटाया नहीं जा सकता।",
    },
    ta: {
        nameTitle: "மற்றவர்கள் பார்க்கும் பெயர்",
        nameHint: "பராமரிப்பாளர் பட்டியலிலும் அழைப்புகளிலும். ஒவ்வொருவரும் தங்கள் எழுத்தில் பார்ப்பார்கள்.",
        noName: "இன்னும் பெயர் இல்லை",
        add: "சேர்",
        change: "மாற்று",
        signInTitle: "உள்நுழைவு வழிகள்",
        signInHint: "தொலைபேசி எண்ணையும் மின்னஞ்சலையும் சேர்த்து, எதன் மூலமும் உள்நுழையுங்கள் – உங்கள் எல்லாத் தரவுகளுடனும் ஒரே கணக்கு.",
        phone: "தொலைபேசி",
        email: "மின்னஞ்சல்",
        notAdded: "இன்னும் சேர்க்கவில்லை",
        sendCode: "குறியீட்டை அனுப்பு",
        codeSentTo: "{to}-க்கு ஒரு குறியீட்டை அனுப்பினோம். அதை இங்கே தட்டச்சு செய்யுங்கள்:",
        confirm: "உறுதிசெய்",
        linked: "சேர்க்கப்பட்டது ✓ – இனி இதன் மூலமும் உள்நுழையலாம்.",
        alreadyUsed: "இது ஏற்கனவே வேறொரு கணக்கில் பயன்படுத்தப்படுகிறது.",
        alreadyYours: "இது ஏற்கனவே உங்கள் கணக்கில் உள்ளது.",
        demoLocked: "டெமோ கணக்கின் உள்நுழைவை மாற்ற முடியாது.",
        languageTitle: "ஆப்பின் மொழி",
        appearanceTitle: "தோற்றம்",
        appearanceLight: "வெளிர்",
        appearanceDark: "இருள்",
        appearanceSystem: "தொலைபேசியைப் போல",
        remindersTitle: "பணி நினைவூட்டல்கள்",
        remindersHint: "நேரம் உள்ள ஒவ்வொரு பணிக்கும் அந்த நேரத்தில் நினைவூட்டல், மீண்டும் வரும் நாட்களிலும்.",
        remindersOnlyApp: "நினைவூட்டல்கள் CareConnect தொலைபேசி ஆப்பில் வேலை செய்யும். இணையப் பக்கம் மூடியிருக்கும்போது நினைவூட்ட முடியாது.",
        remindersDenied: "இந்த ஆப்பிற்கு அறிவிப்புகள் தடுக்கப்பட்டுள்ளன. தொலைபேசி அமைப்புகளில் அனுமதித்து, மீண்டும் நினைவூட்டல்களை இயக்குங்கள்.",
        remindBody: "இந்தப் பணிக்கான நேரம் வந்துவிட்டது ⏰",
        legalTitle: "சட்டத் தகவல்",
        privacy: "தனியுரிமைக் கொள்கை",
        terms: "பயன்பாட்டு விதிமுறைகள்",
        disclaimer: "சட்ட உதவியாளர் அறிவிப்பு",
        accountTitle: "கணக்கு",
        deleteAccount: "என் கணக்கை நீக்கு",
        deleteHint: "உங்கள் கணக்கும் அதிலுள்ள அனைத்தும் நிரந்தரமாக நீக்கப்படும்: ஒப்பந்தம், அரட்டைகள், மொழிபெயர்ப்புகள், சம்பளங்கள், பணிகள், நாட்குறிப்பு, பராமரிப்பாளர் பட்டியலில் உங்கள் இடம்.",
        deleteConfirm: "உங்கள் கணக்கையும் எல்லாத் தரவுகளையும் நிரந்தரமாக நீக்கவா? இதைத் திரும்பப் பெற முடியாது.",
        deleteDemo: "டெமோ கணக்கை நீக்க முடியாது.",
    },
};
