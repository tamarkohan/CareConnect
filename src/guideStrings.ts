// ── guideStrings.ts ──────────────────────────────────────────────────
// Texts of the short welcome guide shown right after signing in (and from
// Menu → App Guide). It explains the buttons of the bottom navigation bar.
// The button names themselves come from translations.ts (navHome, …).
// Tagalog, Malayalam, Russian, Hindi and Tamil should be checked by native speakers.
import { LangCode } from "./translations";

type Strings = {
    title: string;
    intro: string;
    home: string;
    translator: string;
    assistant: string;
    community: string;
    tasks: string;
    journal: string;
    gotIt: string;
};

export const GUIDE_T: Record<LangCode, Strings> = {
    en: {
        title: "Welcome to CareConnect",
        intro: "The buttons at the bottom of the screen take you to:",
        home: "Emergency numbers, your agency and useful guides: safety, transport, payslips and sending money home.",
        translator: "Translate between your language and Hebrew – type or speak.",
        assistant: "Ask about your rights at work and about your contract.",
        community: "Meet caregivers in your city, find places to pray and support groups.",
        tasks: "Your daily to-do list for work, with times and reminders.",
        journal: "Your private diary – write down your day.",
        gotIt: "Got it",
    },
    tl: {
        title: "Maligayang pagdating sa CareConnect",
        intro: "Ang mga button sa ibaba ng screen ay magdadala sa iyo sa:",
        home: "Mga emergency number, ang iyong agency at mga gabay: kaligtasan, transportasyon, payslip at pagpapadala ng pera.",
        translator: "Isalin sa pagitan ng iyong wika at Hebrew – mag-type o magsalita.",
        assistant: "Magtanong tungkol sa iyong mga karapatan sa trabaho at sa iyong kontrata.",
        community: "Makilala ang mga caregiver sa iyong lungsod, maghanap ng simbahan at mga support group.",
        tasks: "Ang listahan ng iyong mga gawain sa araw-araw, may oras at paalala.",
        journal: "Ang iyong pribadong talaarawan – isulat ang iyong araw.",
        gotIt: "Sige",
    },
    ml: {
        title: "CareConnect-ലേക്ക് സ്വാഗതം",
        intro: "സ്ക്രീനിന്റെ താഴെയുള്ള ബട്ടണുകൾ നിങ്ങളെ കൊണ്ടുപോകുന്നത്:",
        home: "അടിയന്തര നമ്പറുകൾ, നിങ്ങളുടെ ഏജൻസി, ഉപയോഗപ്രദമായ ഗൈഡുകൾ: സുരക്ഷ, യാത്ര, ശമ്പള സ്ലിപ്പ്, നാട്ടിലേക്ക് പണം അയയ്ക്കൽ.",
        translator: "നിങ്ങളുടെ ഭാഷയ്ക്കും ഹീബ്രുവിനും ഇടയിൽ വിവർത്തനം ചെയ്യുക – ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ സംസാരിക്കുക.",
        assistant: "ജോലിയിലെ നിങ്ങളുടെ അവകാശങ്ങളെക്കുറിച്ചും കരാറിനെക്കുറിച്ചും ചോദിക്കുക.",
        community: "നിങ്ങളുടെ നഗരത്തിലെ കെയർഗിവർമാരെ കാണുക, പ്രാർത്ഥനാ സ്ഥലങ്ങളും സഹായ ഗ്രൂപ്പുകളും കണ്ടെത്തുക.",
        tasks: "ജോലിക്കുള്ള ദിവസേനയുള്ള ടാസ്ക് ലിസ്റ്റ്, സമയവും ഓർമ്മപ്പെടുത്തലുകളും സഹിതം.",
        journal: "നിങ്ങളുടെ സ്വകാര്യ ഡയറി – നിങ്ങളുടെ ദിവസം എഴുതുക.",
        gotIt: "ശരി",
    },
    ru: {
        title: "Добро пожаловать в CareConnect",
        intro: "Кнопки внизу экрана ведут в разделы:",
        home: "Экстренные номера, ваше агентство и полезные справки: безопасность, транспорт, расчётные листы и денежные переводы.",
        translator: "Перевод между вашим языком и ивритом – текстом или голосом.",
        assistant: "Вопросы о ваших правах на работе и о вашем договоре.",
        community: "Знакомства с сиделками в вашем городе, места молитвы и группы поддержки.",
        tasks: "Ваш список дел на день, со временем и напоминаниями.",
        journal: "Ваш личный дневник – запишите, как прошёл день.",
        gotIt: "Понятно",
    },
    hi: {
        title: "CareConnect में आपका स्वागत है",
        intro: "स्क्रीन के नीचे के बटन आपको यहाँ ले जाते हैं:",
        home: "आपातकालीन नंबर, आपकी एजेंसी और काम की जानकारी: सुरक्षा, यातायात, वेतन पर्ची और घर पैसे भेजना।",
        translator: "अपनी भाषा और हिब्रू के बीच अनुवाद करें – लिखकर या बोलकर।",
        assistant: "काम पर अपने अधिकारों और अपने अनुबंध के बारे में पूछें।",
        community: "अपने शहर के देखभाल करने वालों से मिलें, प्रार्थना स्थल और सहायता समूह खोजें।",
        tasks: "काम के लिए आपकी रोज़ की सूची, समय और याद दिलाने के साथ।",
        journal: "आपकी निजी डायरी – अपना दिन लिखें।",
        gotIt: "समझ गया",
    },
    ta: {
        title: "CareConnect-க்கு வரவேற்கிறோம்",
        intro: "திரையின் கீழே உள்ள பொத்தான்கள் உங்களை அழைத்துச் செல்லும் இடங்கள்:",
        home: "அவசர எண்கள், உங்கள் ஏஜென்சி மற்றும் பயனுள்ள வழிகாட்டிகள்: பாதுகாப்பு, போக்குவரத்து, சம்பளச் சீட்டு, ஊருக்குப் பணம் அனுப்புதல்.",
        translator: "உங்கள் மொழிக்கும் ஹீப்ருவுக்கும் இடையே மொழிபெயர்க்கவும் – தட்டச்சு செய்யவும் அல்லது பேசவும்.",
        assistant: "வேலையில் உங்கள் உரிமைகள் மற்றும் உங்கள் ஒப்பந்தம் பற்றிக் கேளுங்கள்.",
        community: "உங்கள் நகரத்தில் உள்ள பராமரிப்பாளர்களைச் சந்திக்கவும், வழிபாட்டுத் தலங்கள் மற்றும் உதவிக் குழுக்களைக் கண்டறியவும்.",
        tasks: "வேலைக்கான உங்கள் தினசரிப் பணிப் பட்டியல், நேரம் மற்றும் நினைவூட்டல்களுடன்.",
        journal: "உங்கள் தனிப்பட்ட நாட்குறிப்பு – உங்கள் நாளை எழுதுங்கள்.",
        gotIt: "சரி",
    },
};
