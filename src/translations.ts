// ── translations.ts ─────────────────────────────────────────────────
// Central translation file for CareConnect Israel
// Covers all screens in all 6 supported languages (English, Tagalog,
// Malayalam, Russian, Hindi, Tamil). Hindi and Tamil texts should be checked
// by native speakers.

export type LangCode = "en" | "tl" | "ml" | "ru" | "hi" | "ta";

export const LANGUAGES: { code: LangCode; label: string; nativeLabel: string }[] = [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "tl", label: "Tagalog", nativeLabel: "Tagalog" },
    { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
    { code: "ru", label: "Russian", nativeLabel: "Русский" },
    { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
    { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
];

// ── Manual date/time formatting ────────────────────────────────────
// NOTE: We deliberately do NOT use Intl.RelativeTimeFormat /
// Intl.DateTimeFormat here. Hermes on iOS ships without full ICU data
// by default, and calling those constructors throws
// "Cannot read property 'prototype' of undefined" at runtime instead
// of failing gracefully. These hand-rolled formatters give the same
// output with zero engine/ICU dependency.

const MONTHS_SHORT: Record<LangCode, string[]> = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    tl: ["Ene", "Peb", "Mar", "Abr", "May", "Hun", "Hul", "Ago", "Set", "Okt", "Nob", "Dis"],
    ml: ["ജനു", "ഫെബ്ര", "മാർ", "ഏപ്രി", "മേയ്", "ജൂൺ", "ജൂലൈ", "ഓഗ", "സെപ്റ്റ", "ഒക്ടോ", "നവം", "ഡിസം"],
    ru: ["янв", "февр", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "нояб", "дек"],
    hi: ["जन", "फ़र", "मार्च", "अप्रै", "मई", "जून", "जुला", "अग", "सित", "अक्टू", "नव", "दिस"],
    ta: ["ஜன", "பிப்", "மார்", "ஏப்", "மே", "ஜூன்", "ஜூலை", "ஆக", "செப்", "அக்", "நவ", "டிச"],
};

const MONTHS_FULL: Record<LangCode, string[]> = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    tl: ["Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo", "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"],
    ml: ["ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ", "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്ടോബർ", "നവംബർ", "ഡിസംബർ"],
    ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
    hi: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
    ta: ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"],
};

const WEEKDAYS_FULL: Record<LangCode, string[]> = {
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    tl: ["Linggo", "Lunes", "Martes", "Miyerkules", "Huwebes", "Biyernes", "Sabado"],
    ml: ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"],
    ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    hi: ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
    ta: ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"],
};

function pluralRu(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
}

/**
 * "2 hours ago" / "Yesterday" / "4 days ago", localized to `lang`.
 * Pass a real Date (e.g. `new Date(item.timestamp)`); never hardcode
 * relative-time strings in components.
 */
export function formatRelativeTime(date: Date, lang: LangCode): string {
    const diffMs = Math.max(0, Date.now() - date.getTime());
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) {
        return { en: "Just now", tl: "Ngayon lang", ml: "ഇപ്പോൾ", ru: "Только что", hi: "अभी", ta: "இப்போது" }[lang];
    }
    if (diffMin < 60) {
        if (lang === "en") return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
        if (lang === "tl") return `${diffMin} minuto ang nakalipas`;
        if (lang === "ml") return `${diffMin} മിനിറ്റ് മുമ്പ്`;
        if (lang === "hi") return `${diffMin} मिनट पहले`;
        if (lang === "ta") return `${diffMin} நிமிடங்களுக்கு முன்`;
        return `${diffMin} ${pluralRu(diffMin, "минуту", "минуты", "минут")} назад`;
    }
    if (diffHour < 24) {
        if (lang === "en") return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
        if (lang === "tl") return `${diffHour} oras ang nakalipas`;
        if (lang === "ml") return `${diffHour} മണിക്കൂർ മുമ്പ്`;
        if (lang === "hi") return `${diffHour} घंटे पहले`;
        if (lang === "ta") return `${diffHour} மணி நேரத்திற்கு முன்`;
        return `${diffHour} ${pluralRu(diffHour, "час", "часа", "часов")} назад`;
    }
    if (diffDay === 1) {
        return { en: "Yesterday", tl: "Kahapon", ml: "ഇന്നലെ", ru: "Вчера", hi: "कल", ta: "நேற்று" }[lang];
    }
    if (lang === "en") return `${diffDay} days ago`;
    if (lang === "tl") return `${diffDay} araw ang nakalipas`;
    if (lang === "ml") return `${diffDay} ദിവസം മുമ്പ്`;
    if (lang === "hi") return `${diffDay} दिन पहले`;
    if (lang === "ta") return `${diffDay} நாட்களுக்கு முன்`;
    return `${diffDay} ${pluralRu(diffDay, "день", "дня", "дней")} назад`;
}

/**
 * "Oct 24 · 8:30 PM" (or "24 окт · 20:30" for Russian), localized to `lang`.
 */
export function formatEntryDateTime(date: Date, lang: LangCode): string {
    const month = MONTHS_SHORT[lang][date.getMonth()];
    const day = date.getDate();
    const hours24 = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    let timePart: string;
    if (lang === "ru") {
        timePart = `${hours24.toString().padStart(2, "0")}:${minutes}`;
    } else {
        const period = hours24 >= 12 ? "PM" : "AM";
        const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
        timePart = `${hours12}:${minutes} ${period}`;
    }

    const datePart = lang === "ru" ? `${day} ${month}` : `${month} ${day}`;
    return `${datePart} · ${timePart}`;
}

/** "Tuesday, May 5" style heading, localized to `lang`. */
export function formatLongDate(date: Date, lang: LangCode): string {
    const weekday = WEEKDAYS_FULL[lang][date.getDay()];
    const month = MONTHS_FULL[lang][date.getMonth()];
    const day = date.getDate();
    return lang === "ru" ? `${weekday}, ${day} ${month}` : `${weekday}, ${month} ${day}`;
}
// ── Per-screen translation maps ──────────────────────────────────────

export const T: Record<LangCode, {
    // ── Menu / shared ──
    menu: string;
    settings: string;
    profile: string;
    helpCenter: string;
    logout: string;
    appTitle: string;

    // ── Bottom nav ──
    navHome: string;
    navTranslator: string;
    navAssistant: string;
    navCommunity: string;
    navTasks: string;
    navJournal: string;

    // ── Home ──
    goodMorning: string;
    essentialTools: string;
    myAgency: string;
    arrivalGuides: string;
    safetyShelters: string;
    migrationSupport: string;
    publicTransport: string;
    remittanceApps: string;
    faqElderly: string;
    aboutUs: string;
    payslips: string;
    wordOfDay: string;
    thankYou: string;

    // ── Login ──
    tagline: string;
    phone: string;
    email: string;
    phoneLabel: string;
    emailLabel: string;
    phonePh: string;
    emailPh: string;
    hint: string;
    cta: string;
    terms: string;
    termsLink: string;
    and: string;
    privLink: string;

    // ── Translator ──
    translatorHeading: string;
    translatorSub: string;
    infoCardText: string;
    infoCardHighlight: string;
    speakTranslate: string;
    writeAny: string;
    scanPhoto: string;
    speakShort: string;
    writeShort: string;
    scanShort: string;
    recentTranslations: string;
    catMedical: string;
    catSlang: string;
    catTransit: string;

    // ── Assistant ──
    assistantHeading: string;
    assistantSub: string;
    uploadTitle: string;
    uploadDesc: string;
    contractUploaded: string;
    contractStoredNote: string;
    removeContract: string;
    sourcesLabel: string;
    typeMessage: string;
    initUserMsg: string;
    initBotText: string;
    initBotHighlight: string;
    initBotSuffix: string;
    botReply: string;

    // ── Community ──
    communityHeading: string;
    communitySearch: string;
    localNetworks: string;
    learnInfluencers: string;
    nearYou: string;
    seeMore: string;
    popularReligious: string;
    locationEnabled: string;
    goToChats: string;
    goToClinics: string;
    goToTransport: string;
    mapView: string;
    caregivers: string;
    clinics: string;
    taxis: string;
    atms: string;
    actionChat: string;
    actionInfo: string;
    dist100m: string;
    dist500m: string;
    dist1km: string;
    religiousSiteTag: string;
    moovitLabel: string;
    networkTypeWhatsapp: string;
    networkTypeCommunity: string;
    districtNorthern: string;
    districtHaifa: string;
    districtJerusalem: string;
    taxiStopLabel: string;

    // ── Tasks ──
    tasksHeading: string;
    tasksSub: string;
    reminder: string;
    reminderBody: string;
    manageTasks: string;
    pending: string;
    task1: string;
    task2: string;
    task3: string;
    task4: string;
    task5: string;

    // ── Journal ──
    journalHeading: string;
    journalSub: string;
    burdenBook: string;
    burdenBookSub: string;
    gratitudeBook: string;
    gratitudeBookSub: string;
    howFeeling: string;
    wantRelease: string;
    gratefulFor: string;
    saveEntry: string;
    recentEntries: string;
    burdenBookLabel: string;
    gratitudeBookLabel: string;
    journalEntry1: string;
    journalEntry2: string;
}> = {
    en: {
        menu: "Menu",
        settings: "Settings",
        profile: "Profile",
        helpCenter: "Help Center",
        logout: "Logout",
        appTitle: "CareConnect Israel",
        navHome: "Home",
        navTranslator: "Translator",
        navAssistant: "Assistant",
        navCommunity: "Community",
        navTasks: "Tasks",
        navJournal: "Journal",
        goodMorning: "Good morning, Rohit",
        essentialTools: "Essential Tools",
        myAgency: "My Agency",
        arrivalGuides: "Arrival Guides",
        safetyShelters: "Safety & Shelters",
        migrationSupport: "Visa & Migration (PIBA)",
        publicTransport: "Public Transportation Use",
        remittanceApps: "Remittance Applications",
        faqElderly: "FAQs for Caring\nfor Elderly Clients",
        aboutUs: "About Us",
        payslips: "Payments",
        wordOfDay: "WORD OF THE DAY",
        thankYou: "Thank you",
        tagline: "Your supportive companion in Israel.",
        phone: "Phone",
        email: "Email",
        phoneLabel: "Phone Number",
        emailLabel: "Email",
        phonePh: "50-123-4567",
        emailPh: "account@example.com",
        hint: "We'll send a secure code to verify it's you. No password needed.",
        cta: "Continue →",
        terms: "By continuing, you agree to our ",
        termsLink: "Terms of Service",
        and: " and ",
        privLink: "Privacy Policy",
        translatorHeading: "Contextual Translator",
        translatorSub: "Made especially for you.",
        infoCardText: "Unlike standard apps, our AI understands context. Perfect for Israeli slang, complex medical terms and reading handwritten notes.",
        infoCardHighlight: "HIGH-QUALITY AUDIO FOR MALAYALAM, HINDI & TAGALOG",
        speakTranslate: "Speak to Translate",
        writeAny: "Write in any language",
        scanPhoto: "Scan or Take Photo",
        speakShort: "Speak",
        writeShort: "Write",
        scanShort: "Scan / Photo",
        recentTranslations: "Recent Translations",
        catMedical: "Medical",
        catSlang: "Slang",
        catTransit: "Transit",
        assistantHeading: "Legal & Contract Bot",
        assistantSub: "Ask me anything about your rights.",
        uploadTitle: "Upload or Scan Your\nEmployment Contract",
        uploadDesc: "Privately scan your contract to ask the AI about your legal rights, weekly rest days, and what your employer can or cannot demand. Your data is strictly confidential.",
        contractUploaded: "✓ Contract uploaded",
        contractStoredNote: "🔒 Your contract is stored encrypted and deleted automatically after 90 days.",
        removeContract: "Remove my contract",
        sourcesLabel: "Sources",
        typeMessage: "Type a message...",
        communityHeading: "Connect with others and explore essential locations.",
        communitySearch: "Find places (Religious sites, transit)...",
        localNetworks: "Local Support Networks",
        learnInfluencers: "Learn from Influencers",
        nearYou: "Near You:",
        seeMore: "See more...",
        popularReligious: "Popular Religious Places",
        locationEnabled: "Location sharing enabled to see nearby caregivers, medical care, taxi stops and more.",
        goToChats: "Go to all chats",
        goToClinics: "Go to all Clinics",
        goToTransport: "Go to all transport information",
        mapView: "Map View",
        caregivers: "Caregivers",
        clinics: "Clinics",
        taxis: "Taxis",
        atms: "ATMs & banks",
        actionChat: "Chat",
        actionInfo: "Info & Directions",
        dist100m: "100m away",
        dist500m: "500m away",
        dist1km: "1km away",
        religiousSiteTag: "Religious Site",
        moovitLabel: "Moovit/Google Maps",
        networkTypeWhatsapp: "WhatsApp Group",
        networkTypeCommunity: "Community Center",
        districtNorthern: "Northern District",
        districtHaifa: "Haifa District",
        districtJerusalem: "Jerusalem District",
        taxiStopLabel: "Taxi Stop",
        tasksHeading: "Today's Tasks",
        tasksSub: "Tuesday, May 5",
        reminder: "Reminder: ",
        reminderBody: "You've been working for 4 hours. Try to take a 10-minute rest or short walk if your patient is resting.",
        manageTasks: "Manage Tasks",
        pending: "pending",
        journalHeading: "Digital Journal",
        journalSub: "A private space to release stress and record moments of gratitude.",
        burdenBook: "Burden Book",
        burdenBookSub: "(Vent & release)",
        gratitudeBook: "Gratitude Book",
        gratitudeBookSub: "(Positive moments)",
        howFeeling: "HOW ARE YOU FEELING?",
        wantRelease: "I want to release...",
        gratefulFor: "I am grateful for...",
        saveEntry: "Save Entry",
        recentEntries: "Recent Entries",
        burdenBookLabel: "Burden Book",
        gratitudeBookLabel: "Gratitude Book",
        initUserMsg: "Can my employer ask me to clean the entire family's house?",
        initBotText: "Based on Israeli labor laws and your uploaded contract, you are ",
        initBotHighlight: "only required to clean for your specific patient",
        initBotSuffix: ", not the entire household.",
        botReply: "I'm reviewing your question based on Israeli labor laws. Please note that I'm an AI assistant and this is not legal advice. For your specific situation, I recommend consulting a licensed labor attorney.",
        journalEntry1: "Today was really hard. The language barrier made a simple doctor's visit incredibly stressful.",
        journalEntry2: "I am grateful for a quiet morning and the successful completion of Mr. Cohen's physical therapy routine without any pain.",
        task1: "Take morning medication",
        task2: "Breakfast meal",
        task3: "Call employer re-schedule",
        task4: "Go for a walk",
        task5: "Take afternoon medication",
    },

    tl: {
        menu: "Menu",
        settings: "Mga Setting",
        profile: "Profile",
        helpCenter: "Help Center",
        logout: "Mag-logout",
        appTitle: "CareConnect Israel",
        navHome: "Home",
        navTranslator: "Tagasalin",
        navAssistant: "Katulong",
        navCommunity: "Komunidad",
        navTasks: "Gawain",
        navJournal: "Talaarawan",
        goodMorning: "Magandang umaga, Rohit",
        essentialTools: "Mahahalagang Kagamitan",
        myAgency: "Aking Ahensya",
        arrivalGuides: "Gabay sa Pagdating",
        safetyShelters: "Kaligtasan at Tirahan",
        migrationSupport: "Visa at Migrasyon (PIBA)",
        publicTransport: "Paggamit ng Pampublikong Sasakyan",
        remittanceApps: "Mga App sa Remittance",
        faqElderly: "FAQ para sa Pag-aalaga\nng Matatandang Kliyente",
        aboutUs: "Tungkol sa Amin",
        payslips: "Sahod at Bayad",
        wordOfDay: "SALITA NG ARAW",
        thankYou: "Salamat",
        tagline: "Ang iyong maaasahang katulong sa Israel.",
        phone: "Telepono",
        email: "Email",
        phoneLabel: "Numero ng Telepono",
        emailLabel: "Email",
        phonePh: "50-123-4567",
        emailPh: "account@example.com",
        hint: "Magpapadala kami ng secure code upang kumpirmahin na ikaw ito. Hindi na kailangan ng password.",
        cta: "Magpatuloy →",
        terms: "Sa pagpapatuloy, sumasang-ayon ka sa aming ",
        termsLink: "Mga Tuntunin ng Serbisyo",
        and: " at ",
        privLink: "Patakaran sa Privacy",
        translatorHeading: "Kontekstuwal na Tagasalin",
        translatorSub: "Ginawa lalo na para sa iyo.",
        infoCardText: "Hindi tulad ng karaniwang mga app, nauunawaan ng aming AI ang konteksto. Perpekto para sa Israeli slang, kumplikadong medikal na termino at pagbabasa ng sulat-kamay.",
        infoCardHighlight: "MATAAS NA KALIDAD NA AUDIO PARA SA MALAYALAM, HINDI AT TAGALOG",
        speakTranslate: "Magsalita para Isalin",
        writeAny: "Sumulat sa anumang wika",
        scanPhoto: "I-scan o Kumuha ng Larawan",
        speakShort: "Magsalita",
        writeShort: "Sumulat",
        scanShort: "I-scan / Picture",
        recentTranslations: "Mga Kamakailang Pagsasalin",
        catMedical: "Medikal",
        catSlang: "Slang",
        catTransit: "Transportasyon",
        assistantHeading: "Legal at Kontrata Bot",
        assistantSub: "Tanungin ako tungkol sa iyong mga karapatan.",
        uploadTitle: "I-upload o I-scan ang Iyong\nKasunduan sa Trabaho",
        uploadDesc: "Pribadong i-scan ang iyong kontrata upang tanungin ang AI tungkol sa iyong mga legal na karapatan, lingguhang pahinga, at kung ano ang maaari o hindi maaaring hilingin ng iyong employer. Ang iyong data ay mahigpit na kumpidensyal.",
        contractUploaded: "✓ Na-upload ang kontrata",
        contractStoredNote: "🔒 Naka-encrypt ang iyong kontrata at awtomatikong buburahin pagkalipas ng 90 araw.",
        removeContract: "Burahin ang aking kontrata",
        sourcesLabel: "Mga pinagkunan",
        typeMessage: "Mag-type ng mensahe...",
        communityHeading: "Kumonekta sa iba at tuklasin ang mahahalagang lugar.",
        communitySearch: "Maghanap ng lugar (Relihiyosong lugar, transit)...",
        localNetworks: "Lokal na Suporta",
        learnInfluencers: "Matuto mula sa mga Influencer",
        nearYou: "Malapit sa Iyo:",
        seeMore: "Tingnan pa...",
        popularReligious: "Mga Sikat na Relihiyosong Lugar",
        locationEnabled: "Pinagana ang pagbabahagi ng lokasyon upang makita ang mga caregiver, medikal na pag-aalaga, hintuan ng taksi at marami pa.",
        goToChats: "Pumunta sa lahat ng chat",
        goToClinics: "Pumunta sa lahat ng Klinika",
        goToTransport: "Pumunta sa lahat ng impormasyon sa transportasyon",
        mapView: "Mapa",
        caregivers: "Mga Caregiver",
        clinics: "Mga Klinika",
        taxis: "Mga Taksi",
        atms: "ATM at bangko",
        actionChat: "Chat",
        actionInfo: "Impormasyon at Direksyon",
        dist100m: "100m ang layo",
        dist500m: "500m ang layo",
        dist1km: "1km ang layo",
        religiousSiteTag: "Relihiyosong Lugar",
        moovitLabel: "Moovit/Google Maps",
        networkTypeWhatsapp: "WhatsApp Group",
        networkTypeCommunity: "Sentro ng Komunidad",
        districtNorthern: "Hilagang Distrito",
        districtHaifa: "Distrito ng Haifa",
        districtJerusalem: "Distrito ng Jerusalem",
        taxiStopLabel: "Hintuan ng Taksi",
        tasksHeading: "Mga Gawain Ngayon",
        tasksSub: "Martes, Mayo 5",
        reminder: "Paalala: ",
        reminderBody: "Apat na oras ka nang nagtatrabaho. Subukan na mag-pahinga ng 10 minuto o maikling lakad kung nagpapahinga ang iyong pasyente.",
        manageTasks: "Pamahalaan ang Gawain",
        pending: "nakabinbin",
        journalHeading: "Digital na Talaarawan",
        journalSub: "Isang pribadong espasyo para mag-release ng stress at itala ang mga sandali ng pasasalamat.",
        burdenBook: "Burden Book",
        burdenBookSub: "(Magsalita at mag-release)",
        gratitudeBook: "Gratitude Book",
        gratitudeBookSub: "(Mga positibong sandali)",
        howFeeling: "PAANO KA NAKAKARAMDAM?",
        wantRelease: "Gusto kong palayain...",
        gratefulFor: "Nagpapasalamat ako para sa...",
        saveEntry: "I-save ang Entry",
        recentEntries: "Mga Kamakailang Entry",
        burdenBookLabel: "Burden Book",
        gratitudeBookLabel: "Gratitude Book",
        initUserMsg: "Maaari bang hilingin ng aking employer na linisin ang buong bahay ng pamilya?",
        initBotText: "Batay sa batas paggawa ng Israel at sa iyong na-upload na kontrata, ikaw ay ",
        initBotHighlight: "kailangan lamang maglinis para sa iyong espesipikong pasyente",
        initBotSuffix: ", hindi ang buong sambahayan.",
        botReply: "Sinusuri ko ang iyong tanong batay sa batas paggawa ng Israel. Pakitandaan na ako ay isang AI assistant at hindi ito legal na payo. Para sa iyong partikular na sitwasyon, inirerekomenda ko na kumonsulta sa isang lisensyadong abogado sa paggawa.",
        journalEntry1: "Talagang mahirap ngayon. Ang hadlang sa wika ay nagpahirap sa isang simpleng pagbisita sa doktor.",
        journalEntry2: "Nagpapasalamat ako para sa isang tahimik na umaga at sa matagumpay na pagsasagawa ng physical therapy routine ni Mr. Cohen nang walang sakit.",
        task1: "Uminom ng gamot sa umaga",
        task2: "Almusal",
        task3: "Tumawag sa employer para mag-reschedule",
        task4: "Maglakad",
        task5: "Uminom ng gamot sa hapon",
    },

    ml: {
        menu: "മെനു",
        settings: "ക്രമീകരണങ്ങൾ",
        profile: "പ്രൊഫൈൽ",
        helpCenter: "സഹായ കേന്ദ്രം",
        logout: "ലോഗ്ഔട്ട്",
        appTitle: "കെയർകണക്ട് ഇസ്രായേൽ",
        navHome: "ഹോം",
        navTranslator: "വിവർത്തകൻ",
        navAssistant: "സഹായി",
        navCommunity: "കമ്മ്യൂണിറ്റി",
        navTasks: "ടാസ്ക്കുകൾ",
        navJournal: "ജേർണൽ",
        goodMorning: "സുപ്രഭാതം, Rohit",
        essentialTools: "അത്യാവശ്യ ഉപകരണങ്ങൾ",
        myAgency: "എന്റെ ഏജൻസി",
        arrivalGuides: "വരവ് ഗൈഡുകൾ",
        safetyShelters: "സുരക്ഷയും അഭയവും",
        migrationSupport: "വിസയും കുടിയേറ്റവും (PIBA)",
        publicTransport: "പൊതു ഗതാഗതം ഉപയോഗം",
        remittanceApps: "റെമിറ്റൻസ് ആപ്ലിക്കേഷനുകൾ",
        faqElderly: "മുതിർന്ന ക്ലയന്റുകളുടെ\nസേവനത്തിനുള്ള FAQ",
        aboutUs: "ഞങ്ങളെ കുറിച്ച്",
        payslips: "പേയ്‌മെന്റുകൾ",
        wordOfDay: "ദിവസത്തിന്റെ വാക്ക്",
        thankYou: "നന്ദി",
        tagline: "ഇസ്രായേലിൽ നിങ്ങളുടെ വിശ്വസ്ത സഹചാരി.",
        phone: "ഫോൺ",
        email: "ഇമെയിൽ",
        phoneLabel: "ഫോൺ നമ്പർ",
        emailLabel: "ഇമെയിൽ",
        phonePh: "50-123-4567",
        emailPh: "account@example.com",
        hint: "നിങ്ങളാണെന്ന് സ്ഥിരീകരിക്കാൻ ഞങ്ങൾ ഒരു സുരക്ഷിത കോഡ് അയക്കും. പാസ്‌വേഡ് ആവശ്യമില്ല.",
        cta: "തുടരുക →",
        terms: "തുടർന്നാൽ, നിങ്ങൾ ഞങ്ങളുടെ ",
        termsLink: "സേവന നിബന്ധനകൾ",
        and: " ഉം ",
        privLink: "സ്വകാര്യതാ നയം",
        translatorHeading: "സന്ദർഭ വിവർത്തകൻ",
        translatorSub: "പ്രത്യേകമായി നിങ്ങൾക്ക് വേണ്ടി.",
        infoCardText: "സ്റ്റാൻഡേർഡ് ആപ്പുകളിൽ നിന്ന് വ്യത്യസ്തമായി, ഞങ്ങളുടെ AI സന്ദർഭം മനസ്സിലാക്കുന്നു. ഇസ്രായേലി ഭാഷ, സങ്കീർണ്ണ മെഡിക്കൽ പദങ്ങൾ, കൈയക്ഷര കുറിപ്പുകൾ എന്നിവ വായിക്കാൻ മികച്ചത്.",
        infoCardHighlight: "മലയാളം, ഹിന്ദി, തഗലോഗ് ഭാഷകൾക്ക് ഉയർന്ന നിലവാരത്തിലുള്ള ഓഡിയോ",
        speakTranslate: "സംസാരിച്ച് വിവർത്തനം ചെയ്യുക",
        writeAny: "ഏത് ഭാഷയിലും എഴുതുക",
        scanPhoto: "സ്കാൻ ചെയ്യുക അല്ലെങ്കിൽ ഫോട്ടോ എടുക്കുക",
        speakShort: "സംസാരിക്കുക",
        writeShort: "എഴുതുക",
        scanShort: "സ്കാൻ / ഫോട്ടോ",
        recentTranslations: "സമീപകാല വിവർത്തനങ്ങൾ",
        catMedical: "മെഡിക്കൽ",
        catSlang: "സ്ലാങ്",
        catTransit: "ട്രാൻസിറ്റ്",
        assistantHeading: "നിയമ & കരാർ ബോട്ട്",
        assistantSub: "നിങ്ങളുടെ അവകാശങ്ങളെക്കുറിച്ച് ചോദിക്കൂ.",
        uploadTitle: "നിങ്ങളുടെ തൊഴിൽ കരാർ\nഅപ്ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ സ്കാൻ ചെയ്യുക",
        uploadDesc: "AI-നോട് നിങ്ങളുടെ നിയമപരമായ അവകാശങ്ങൾ, ആഴ്ചയിലെ വിശ്രമ ദിവസങ്ങൾ, തൊഴിലുടമ ആവശ്യപ്പെടാൻ കഴിയുന്നതും ഇല്ലാത്തതും ചോദിക്കാൻ നിങ്ങളുടെ കരാർ സ്വകാര്യമായി സ്കാൻ ചെയ്യുക. നിങ്ങളുടെ ഡേറ്റ കർശനമായി രഹസ്യമാണ്.",
        contractUploaded: "✓ കരാർ അപ്ലോഡ് ചെയ്തു",
        contractStoredNote: "🔒 നിങ്ങളുടെ കരാർ എൻക്രിപ്റ്റ് ചെയ്ത് സൂക്ഷിക്കുന്നു, 90 ദിവസത്തിന് ശേഷം സ്വയം ഇല്ലാതാക്കും.",
        removeContract: "എന്റെ കരാർ നീക്കം ചെയ്യുക",
        sourcesLabel: "ഉറവിടങ്ങൾ",
        typeMessage: "ഒരു സന്ദേശം ടൈപ്പ് ചെയ്യുക...",
        communityHeading: "മറ്റുള്ളവരുമായി ബന്ധപ്പെടുകയും അത്യാവശ്യ സ്ഥലങ്ങൾ കണ്ടുപിടിക്കുകയും ചെയ്യുക.",
        communitySearch: "സ്ഥലങ്ങൾ കണ്ടെത്തുക (മതപരമായ സ്ഥലങ്ങൾ, ഗതാഗതം)...",
        localNetworks: "പ്രാദേശിക സഹായ നെറ്റ്‌വർക്കുകൾ",
        learnInfluencers: "ഇൻഫ്ലുവൻസർമാരിൽ നിന്ന് പഠിക്കൂ",
        nearYou: "നിങ്ങളുടെ സമീപം:",
        seeMore: "കൂടുതൽ കാണുക...",
        popularReligious: "പ്രശസ്ത മതപരമായ സ്ഥലങ്ങൾ",
        locationEnabled: "അടുത്തുള്ള കെയർഗിവർമാർ, മെഡിക്കൽ കെയർ, ടാക്സി സ്റ്റോപ്പുകൾ എന്നിവ കാണാൻ ലൊക്കേഷൻ പങ്കിടൽ പ്രവർത്തനക്ഷമമാക്കി.",
        goToChats: "എല്ലാ ചാറ്റുകളിലേക്ക് പോകുക",
        goToClinics: "എല്ലാ ക്ലിനിക്കുകളിലേക്ക് പോകുക",
        goToTransport: "എല്ലാ ഗതാഗത വിവരങ്ങളിലേക്ക് പോകുക",
        mapView: "ഭൂപട കാഴ്ച",
        caregivers: "കെയർഗിവർമാർ",
        clinics: "ക്ലിനിക്കുകൾ",
        taxis: "ടാക്സികൾ",
        atms: "എടിഎം / ബാങ്ക്",
        actionChat: "ചാറ്റ്",
        actionInfo: "വിവരവും വഴിയും",
        dist100m: "100 മീറ്റർ അകലെ",
        dist500m: "500 മീറ്റർ അകലെ",
        dist1km: "1 കിലോമീറ്റർ അകലെ",
        religiousSiteTag: "മതപരമായ സ്ഥലം",
        moovitLabel: "Moovit/Google Maps",
        networkTypeWhatsapp: "വാട്സ്ആപ്പ് ഗ്രൂപ്പ്",
        networkTypeCommunity: "കമ്മ്യൂണിറ്റി സെന്റർ",
        districtNorthern: "വടക്കൻ ജില്ല",
        districtHaifa: "ഹൈഫ ജില്ല",
        districtJerusalem: "ജറുസലേം ജില്ല",
        taxiStopLabel: "ടാക്സി സ്റ്റോപ്പ്",
        tasksHeading: "ഇന്നത്തെ ടാസ്ക്കുകൾ",
        tasksSub: "ചൊവ്വ, മേയ് 5",
        reminder: "ഓർമ്മപ്പെടുത്തൽ: ",
        reminderBody: "നിങ്ങൾ 4 മണിക്കൂർ ജോലി ചെയ്തു. രോഗി വിശ്രമിക്കുകയാണെങ്കിൽ 10 മിനിറ്റ് വിശ്രമിക്കാനോ ഹ്രസ്വ നടത്തം നടക്കാനോ ശ്രമിക്കുക.",
        manageTasks: "ടാസ്ക്കുകൾ നിയന്ത്രിക്കുക",
        pending: "കാത്തിരിക്കുന്നു",
        journalHeading: "ഡിജിറ്റൽ ജേർണൽ",
        journalSub: "സ്ട്രസ് ഒഴിവാക്കാനും നന്ദിയുടെ നിമിഷങ്ങൾ രേഖപ്പെടുത്താനുമുള്ള ഒരു സ്വകാര്യ ഇടം.",
        burdenBook: "ഭാര പുസ്തകം",
        burdenBookSub: "(വ്യക്തമാക്കൽ & മോചനം)",
        gratitudeBook: "നന്ദി പുസ്തകം",
        gratitudeBookSub: "(നല്ല നിമിഷങ്ങൾ)",
        howFeeling: "നിങ്ങൾ എങ്ങനെ അനുഭവിക്കുന്നു?",
        wantRelease: "ഞാൻ മോചിപ്പിക്കാൻ ആഗ്രഹിക്കുന്നു...",
        gratefulFor: "ഞാൻ കൃതജ്ഞതയുള്ളത്...",
        saveEntry: "എൻട്രി സേവ് ചെയ്യുക",
        recentEntries: "സമീപകാല എൻട്രികൾ",
        burdenBookLabel: "ഭാര പുസ്തകം",
        gratitudeBookLabel: "നന്ദി പുസ്തകം",
        initUserMsg: "എന്റെ തൊഴിലുടമയ്ക്ക് കുടുംബത്തിന്റെ മുഴുവൻ വീടും വൃത്തിയാക്കാൻ ആവശ്യപ്പെടാമോ?",
        initBotText: "ഇസ്രായേൽ തൊഴിൽ നിയമങ്ങളും നിങ്ങൾ അപ്ലോഡ് ചെയ്ത കരാറും അനുസരിച്ച്, നിങ്ങൾ ",
        initBotHighlight: "നിങ്ങളുടെ നിർദ്ദിഷ്ട രോഗിക്ക് മാത്രം വൃത്തിയാക്കൽ ആവശ്യമാണ്",
        initBotSuffix: ", മുഴുവൻ വീട്ടിലേക്കല്ല.",
        botReply: "ഇസ്രായേൽ തൊഴിൽ നിയമങ്ങളുടെ അടിസ്ഥാനത്തിൽ ഞാൻ നിങ്ങളുടെ ചോദ്യം അവലോകനം ചെയ്യുന്നു. ഞാൻ ഒരു AI അസിസ്റ്റന്റ് ആണെന്നും ഇത് നിയമ ഉപദേശമല്ലെന്നും ദയവായി ശ്രദ്ധിക്കുക. നിങ്ങളുടെ നിർദ്ദിഷ്ട സാഹചര്യത്തിൽ, ഒരു ലൈസൻസ്ഡ് തൊഴിൽ അഭിഭാഷകനെ സമീപിക്കാൻ ഞാൻ ശുപാർശ ചെയ്യുന്നു.",
        journalEntry1: "ഇന്ന് ശരിക്കും ബുദ്ധിമുട്ടായിരുന്നു. ഭാഷാ തടസ്സം ഒരു ലളിതമായ ഡോക്ടർ സന്ദർശനം വളരെ സമ്മർദ്ദകരമാക്കി.",
        journalEntry2: "ഒരു ശാന്തമായ രാവിലെയും Mr. Cohen-ന്റെ ഫിസിക്കൽ തെറാപ്പി റൂട്ടീൻ വേദനയില്ലാതെ വിജയകരമായി പൂർത്തിയാക്കിയതിനും ഞാൻ നന്ദിയുള്ളവൻ.",
        task1: "രാവിലെ മരുന്ന് കഴിക്കുക",
        task2: "പ്രഭാത ഭക്ഷണം",
        task3: "തൊഴിലുടമയെ വിളിച്ച് ഷെഡ്യൂൾ മാറ്റുക",
        task4: "നടക്കാൻ പോകുക",
        task5: "ഉച്ചതിരിഞ്ഞ് മരുന്ന് കഴിക്കുക",
    },

    ru: {
        menu: "Меню",
        settings: "Настройки",
        profile: "Профиль",
        helpCenter: "Центр помощи",
        logout: "Выйти",
        appTitle: "CareConnect Израиль",
        navHome: "Главная",
        navTranslator: "Переводчик",
        navAssistant: "Помощник",
        navCommunity: "Сообщество",
        navTasks: "Задачи",
        navJournal: "Дневник",
        goodMorning: "Доброе утро, Rohit",
        essentialTools: "Основные инструменты",
        myAgency: "Моё агентство",
        arrivalGuides: "Гиды по прибытию",
        safetyShelters: "Безопасность и убежища",
        migrationSupport: "Виза и миграция (PIBA)",
        publicTransport: "Использование общественного транспорта",
        remittanceApps: "Приложения для денежных переводов",
        faqElderly: "FAQ по уходу\nза пожилыми клиентами",
        aboutUs: "О нас",
        payslips: "Оплата",
        wordOfDay: "СЛОВО ДНЯ",
        thankYou: "Спасибо",
        tagline: "Ваш надёжный спутник в Израиле.",
        phone: "Телефон",
        email: "Эл. почта",
        phoneLabel: "Телефон",
        emailLabel: "Эл. почта",
        phonePh: "50-123-4567",
        emailPh: "account@example.com",
        hint: "Мы отправим вам код безопасности для подтверждения личности.",
        cta: "Продолжить →",
        terms: "Продолжая, вы соглашаетесь с нашими ",
        termsLink: "Условиями обслуживания",
        and: " и ",
        privLink: "Политикой конфиденциальности",
        translatorHeading: "Контекстуальный переводчик",
        translatorSub: "Создан специально для вас.",
        infoCardText: "В отличие от стандартных приложений, наш ИИ понимает контекст. Идеально для израильского сленга, медицинских терминов и чтения рукописных заметок.",
        infoCardHighlight: "ВЫСОКОКАЧЕСТВЕННОЕ АУДИО ДЛЯ МАЛАЯЛАМ, ХИНДИ И ТАГАЛОГ",
        speakTranslate: "Говорить для перевода",
        writeAny: "Писать на любом языке",
        scanPhoto: "Сканировать или сфотографировать",
        speakShort: "Сказать",
        writeShort: "Написать",
        scanShort: "Скан / фото",
        recentTranslations: "Недавние переводы",
        catMedical: "Медицинское",
        catSlang: "Сленг",
        catTransit: "Транспорт",
        assistantHeading: "Юридический бот",
        assistantSub: "Спросите о своих правах.",
        uploadTitle: "Загрузить или отсканировать\nваш трудовой договор",
        uploadDesc: "Приватно отсканируйте ваш контракт, чтобы спросить ИИ о ваших правах, выходных днях и требованиях работодателя. Ваши данные строго конфиденциальны.",
        contractUploaded: "✓ Контракт загружен",
        contractStoredNote: "🔒 Ваш договор хранится в зашифрованном виде и автоматически удаляется через 90 дней.",
        removeContract: "Удалить мой договор",
        sourcesLabel: "Источники",
        typeMessage: "Написать сообщение...",
        communityHeading: "Общайтесь с другими и исследуйте важные места.",
        communitySearch: "Найти места (религиозные сайты, транспорт)...",
        localNetworks: "Местные сети поддержки",
        learnInfluencers: "Учитесь у инфлюенсеров",
        nearYou: "Рядом с вами:",
        seeMore: "Смотреть ещё...",
        popularReligious: "Популярные религиозные места",
        locationEnabled: "Включено совместное использование геолокации для просмотра ближайших сиделок, медицинской помощи, стоянок такси и многого другого.",
        goToChats: "Перейти ко всем чатам",
        goToClinics: "Перейти ко всем клиникам",
        goToTransport: "Перейти ко всей транспортной информации",
        mapView: "Карта",
        caregivers: "Сиделки",
        clinics: "Клиники",
        taxis: "Такси",
        atms: "Банкоматы и банки",
        actionChat: "Чат",
        actionInfo: "Инфо и маршрут",
        dist100m: "В 100 м",
        dist500m: "В 500 м",
        dist1km: "В 1 км",
        religiousSiteTag: "Религиозное место",
        moovitLabel: "Moovit/Google Карты",
        networkTypeWhatsapp: "Группа WhatsApp",
        networkTypeCommunity: "Общественный центр",
        districtNorthern: "Северный округ",
        districtHaifa: "Округ Хайфа",
        districtJerusalem: "Иерусалимский округ",
        taxiStopLabel: "Стоянка такси",
        tasksHeading: "Задачи на сегодня",
        tasksSub: "Вторник, 5 мая",
        reminder: "Напоминание: ",
        reminderBody: "Вы работаете 4 часа. Постарайтесь отдохнуть 10 минут или прогуляться, если ваш пациент отдыхает.",
        manageTasks: "Управление задачами",
        pending: "ожидающих",
        journalHeading: "Цифровой дневник",
        journalSub: "Личное пространство для снятия стресса и записи моментов благодарности.",
        burdenBook: "Книга тягот",
        burdenBookSub: "(Выразить и освободиться)",
        gratitudeBook: "Книга благодарности",
        gratitudeBookSub: "(Позитивные моменты)",
        howFeeling: "КАК ВЫ СЕБЯ ЧУВСТВУЕТЕ?",
        wantRelease: "Я хочу освободиться...",
        gratefulFor: "Я благодарен за...",
        saveEntry: "Сохранить запись",
        recentEntries: "Последние записи",
        burdenBookLabel: "Книга тягот",
        gratitudeBookLabel: "Книга благодарности",
        initUserMsg: "Может ли мой работодатель попросить меня убирать весь дом семьи?",
        initBotText: "На основе израильского трудового законодательства и вашего загруженного контракта, вы ",
        initBotHighlight: "обязаны убирать только для вашего конкретного пациента",
        initBotSuffix: ", а не весь дом.",
        botReply: "Я изучаю ваш вопрос на основе израильского трудового законодательства. Обратите внимание, что я являюсь ИИ-ассистентом, и это не является юридической консультацией. Для вашей конкретной ситуации рекомендую обратиться к лицензированному юристу по трудовым вопросам.",
        journalEntry1: "Сегодня было очень тяжело. Языковой барьер сделал простой визит к врачу невероятно стрессовым.",
        journalEntry2: "Я благодарен за тихое утро и успешное завершение процедуры физиотерапии Mr. Cohen без какой-либо боли.",
        task1: "Принять утренние лекарства",
        task2: "Завтрак",
        task3: "Позвонить работодателю для переноса",
        task4: "Прогуляться",
        task5: "Принять дневные лекарства",
    },
    hi: {
        menu: "मेनू",
        settings: "सेटिंग्स",
        profile: "प्रोफ़ाइल",
        helpCenter: "सहायता केंद्र",
        logout: "लॉग आउट",
        appTitle: "CareConnect Israel",
        navHome: "होम",
        navTranslator: "अनुवादक",
        navAssistant: "सहायक",
        navCommunity: "समुदाय",
        navTasks: "काम",
        navJournal: "डायरी",
        goodMorning: "सुप्रभात, Rohit",
        essentialTools: "ज़रूरी टूल",
        myAgency: "मेरी एजेंसी",
        arrivalGuides: "आगमन गाइड",
        safetyShelters: "सुरक्षा और शेल्टर",
        migrationSupport: "वीज़ा और प्रवासन (PIBA)",
        publicTransport: "सार्वजनिक परिवहन",
        remittanceApps: "पैसे भेजने के ऐप",
        faqElderly: "बुज़ुर्गों की देखभाल\nके सवाल-जवाब",
        aboutUs: "हमारे बारे में",
        payslips: "भुगतान",
        wordOfDay: "आज का शब्द",
        thankYou: "धन्यवाद",
        tagline: "इज़राइल में आपका सहायक साथी।",
        phone: "फ़ोन",
        email: "ईमेल",
        phoneLabel: "फ़ोन नंबर",
        emailLabel: "ईमेल",
        phonePh: "50-123-4567",
        emailPh: "account@example.com",
        hint: "आपकी पहचान की पुष्टि के लिए हम एक सुरक्षित कोड भेजेंगे। पासवर्ड की ज़रूरत नहीं।",
        cta: "जारी रखें →",
        terms: "जारी रखकर आप हमारी ",
        termsLink: "सेवा की शर्तों",
        and: " और ",
        privLink: "गोपनीयता नीति",
        translatorHeading: "संदर्भ समझने वाला अनुवादक",
        translatorSub: "खास आपके लिए बनाया गया।",
        infoCardText: "आम ऐप्स के विपरीत, हमारा AI संदर्भ समझता है। इज़राइली बोलचाल, कठिन मेडिकल शब्दों और हाथ से लिखे नोट्स के लिए बढ़िया।",
        infoCardHighlight: "मलयालम, हिंदी और तगालोग के लिए अच्छी आवाज़",
        speakTranslate: "बोलकर अनुवाद करें",
        writeAny: "किसी भी भाषा में लिखें",
        scanPhoto: "स्कैन करें या फ़ोटो लें",
        speakShort: "बोलें",
        writeShort: "लिखें",
        scanShort: "स्कैन / फ़ोटो",
        recentTranslations: "हाल के अनुवाद",
        catMedical: "मेडिकल",
        catSlang: "बोलचाल",
        catTransit: "परिवहन",
        assistantHeading: "कानूनी और अनुबंध सहायक",
        assistantSub: "अपने अधिकारों के बारे में कुछ भी पूछें।",
        uploadTitle: "अपना रोज़गार अनुबंध\nअपलोड या स्कैन करें",
        uploadDesc: "अपने अनुबंध को निजी रूप से स्कैन करें और AI से अपने कानूनी अधिकारों, साप्ताहिक छुट्टी और नियोक्ता क्या मांग सकता है या नहीं, इसके बारे में पूछें। आपका डेटा पूरी तरह गोपनीय है।",
        contractUploaded: "✓ अनुबंध अपलोड हो गया",
        contractStoredNote: "🔒 आपका अनुबंध एन्क्रिप्ट करके रखा जाता है और 90 दिन बाद अपने-आप मिट जाता है।",
        removeContract: "मेरा अनुबंध हटाएँ",
        sourcesLabel: "स्रोत",
        typeMessage: "संदेश लिखें...",
        communityHeading: "दूसरों से जुड़ें और ज़रूरी जगहें खोजें।",
        communitySearch: "जगहें खोजें (धार्मिक स्थल, परिवहन)...",
        localNetworks: "स्थानीय सहायता समूह",
        learnInfluencers: "इन्फ्लुएंसर से सीखें",
        nearYou: "आपके पास:",
        seeMore: "और देखें...",
        popularReligious: "लोकप्रिय धार्मिक स्थल",
        locationEnabled: "आस-पास के केयरगिवर, इलाज, टैक्सी स्टॉप आदि देखने के लिए लोकेशन शेयरिंग चालू है।",
        goToChats: "सभी चैट देखें",
        goToClinics: "सभी क्लिनिक देखें",
        goToTransport: "सारी परिवहन जानकारी देखें",
        mapView: "नक्शा",
        caregivers: "केयरगिवर",
        clinics: "क्लिनिक",
        taxis: "टैक्सी",
        atms: "ATM और बैंक",
        actionChat: "चैट",
        actionInfo: "जानकारी और रास्ता",
        dist100m: "100 मी दूर",
        dist500m: "500 मी दूर",
        dist1km: "1 किमी दूर",
        religiousSiteTag: "धार्मिक स्थल",
        moovitLabel: "Moovit/Google Maps",
        networkTypeWhatsapp: "WhatsApp ग्रुप",
        networkTypeCommunity: "सामुदायिक केंद्र",
        districtNorthern: "उत्तरी ज़िला",
        districtHaifa: "हाइफ़ा ज़िला",
        districtJerusalem: "यरूशलम ज़िला",
        taxiStopLabel: "टैक्सी स्टॉप",
        tasksHeading: "आज के काम",
        tasksSub: "मंगलवार, 5 मई",
        reminder: "याद दिलाना: ",
        reminderBody: "आप 4 घंटे से काम कर रहे हैं। अगर आपका मरीज़ आराम कर रहा है, तो 10 मिनट आराम करें या थोड़ा टहल लें।",
        manageTasks: "काम संभालें",
        pending: "बाकी",
        journalHeading: "डिजिटल डायरी",
        journalSub: "तनाव निकालने और आभार के पल लिखने की एक निजी जगह।",
        burdenBook: "बोझ की किताब",
        burdenBookSub: "(मन हल्का करें)",
        gratitudeBook: "आभार की किताब",
        gratitudeBookSub: "(अच्छे पल)",
        howFeeling: "आप कैसा महसूस कर रहे हैं?",
        wantRelease: "मैं मन हल्का करना चाहती हूँ...",
        gratefulFor: "मैं आभारी हूँ...",
        saveEntry: "सहेजें",
        recentEntries: "हाल की बातें",
        burdenBookLabel: "बोझ की किताब",
        gratitudeBookLabel: "आभार की किताब",
        initUserMsg: "क्या मेरा नियोक्ता मुझसे पूरे परिवार का घर साफ़ करवा सकता है?",
        initBotText: "इज़राइली श्रम कानूनों और आपके अपलोड किए अनुबंध के अनुसार, आपको ",
        initBotHighlight: "सिर्फ़ अपने मरीज़ से जुड़ी सफ़ाई करनी है",
        initBotSuffix: ", पूरे घर की नहीं।",
        botReply: "मैं इज़राइली श्रम कानूनों के आधार पर आपका सवाल देख रहा हूँ। ध्यान दें कि मैं एक AI सहायक हूँ और यह कानूनी सलाह नहीं है। अपनी स्थिति के लिए किसी लाइसेंसधारी श्रम वकील से सलाह लें।",
        journalEntry1: "आज बहुत मुश्किल दिन था। भाषा की दिक्कत की वजह से डॉक्टर के पास जाना बहुत तनाव भरा रहा।",
        journalEntry2: "मैं शांत सुबह के लिए और Mr. Cohen की फ़िज़ियोथेरेपी बिना दर्द के पूरी होने के लिए आभारी हूँ।",
        task1: "सुबह की दवा देना",
        task2: "नाश्ता",
        task3: "नियोक्ता को फ़ोन – समय बदलना",
        task4: "टहलने जाना",
        task5: "दोपहर की दवा देना",
    },
    ta: {
        menu: "மெனு",
        settings: "அமைப்புகள்",
        profile: "சுயவிவரம்",
        helpCenter: "உதவி மையம்",
        logout: "வெளியேறு",
        appTitle: "CareConnect Israel",
        navHome: "முகப்பு",
        navTranslator: "மொழிபெயர்ப்பு",
        navAssistant: "உதவியாளர்",
        navCommunity: "சமூகம்",
        navTasks: "பணிகள்",
        navJournal: "நாட்குறிப்பு",
        goodMorning: "காலை வணக்கம், Rohit",
        essentialTools: "முக்கிய கருவிகள்",
        myAgency: "என் ஏஜென்சி",
        arrivalGuides: "வருகை வழிகாட்டி",
        safetyShelters: "பாதுகாப்பு & தங்குமிடங்கள்",
        migrationSupport: "விசா & குடியேற்றம் (PIBA)",
        publicTransport: "பொதுப் போக்குவரத்து",
        remittanceApps: "பணம் அனுப்பும் ஆப்கள்",
        faqElderly: "முதியோர் பராமரிப்பு\nகேள்வி-பதில்",
        aboutUs: "எங்களைப் பற்றி",
        payslips: "கட்டணங்கள்",
        wordOfDay: "இன்றைய சொல்",
        thankYou: "நன்றி",
        tagline: "இஸ்ரேலில் உங்கள் துணை.",
        phone: "தொலைபேசி",
        email: "மின்னஞ்சல்",
        phoneLabel: "தொலைபேசி எண்",
        emailLabel: "மின்னஞ்சல்",
        phonePh: "50-123-4567",
        emailPh: "account@example.com",
        hint: "நீங்கள் தான் என்பதை உறுதிப்படுத்த பாதுகாப்பான குறியீட்டை அனுப்புவோம். கடவுச்சொல் தேவையில்லை.",
        cta: "தொடரவும் →",
        terms: "தொடர்வதன் மூலம், எங்கள் ",
        termsLink: "சேவை விதிமுறைகள்",
        and: " மற்றும் ",
        privLink: "தனியுரிமைக் கொள்கை",
        translatorHeading: "சூழலைப் புரிந்துகொள்ளும் மொழிபெயர்ப்பாளர்",
        translatorSub: "உங்களுக்காகவே உருவாக்கப்பட்டது.",
        infoCardText: "சாதாரண ஆப்களைப் போலல்லாமல், எங்கள் AI சூழலைப் புரிந்துகொள்கிறது. இஸ்ரேலிய பேச்சுவழக்கு, கடினமான மருத்துவச் சொற்கள் மற்றும் கையால் எழுதிய குறிப்புகளுக்கு ஏற்றது.",
        infoCardHighlight: "மலையாளம், இந்தி, தகலாக் மொழிகளுக்கு தரமான ஒலி",
        speakTranslate: "பேசி மொழிபெயர்க்கவும்",
        writeAny: "எந்த மொழியிலும் எழுதவும்",
        scanPhoto: "ஸ்கேன் செய்யவும் / புகைப்படம்",
        speakShort: "பேசு",
        writeShort: "எழுது",
        scanShort: "ஸ்கேன் / புகைப்படம்",
        recentTranslations: "சமீபத்திய மொழிபெயர்ப்புகள்",
        catMedical: "மருத்துவம்",
        catSlang: "பேச்சுவழக்கு",
        catTransit: "போக்குவரத்து",
        assistantHeading: "சட்ட & ஒப்பந்த உதவியாளர்",
        assistantSub: "உங்கள் உரிமைகள் பற்றி எதையும் கேளுங்கள்.",
        uploadTitle: "உங்கள் வேலை ஒப்பந்தத்தை\nபதிவேற்றவும் அல்லது ஸ்கேன் செய்யவும்",
        uploadDesc: "உங்கள் ஒப்பந்தத்தைத் தனிப்பட்ட முறையில் ஸ்கேன் செய்து, உங்கள் சட்ட உரிமைகள், வார விடுமுறை, முதலாளி எதைக் கேட்கலாம் அல்லது கேட்கக்கூடாது என்பது பற்றி AI-யிடம் கேளுங்கள். உங்கள் தகவல்கள் முற்றிலும் ரகசியமானவை.",
        contractUploaded: "✓ ஒப்பந்தம் பதிவேற்றப்பட்டது",
        contractStoredNote: "🔒 உங்கள் ஒப்பந்தம் மறைகுறியாக்கம் செய்து சேமிக்கப்பட்டு, 90 நாட்களுக்குப் பிறகு தானாக நீக்கப்படும்.",
        removeContract: "என் ஒப்பந்தத்தை நீக்கு",
        sourcesLabel: "ஆதாரங்கள்",
        typeMessage: "செய்தியை எழுதுங்கள்...",
        communityHeading: "மற்றவர்களுடன் இணைந்து முக்கிய இடங்களைக் கண்டறியுங்கள்.",
        communitySearch: "இடங்களைத் தேடுங்கள் (வழிபாட்டுத் தலங்கள், போக்குவரத்து)...",
        localNetworks: "உள்ளூர் ஆதரவுக் குழுக்கள்",
        learnInfluencers: "இன்ஃப்ளுயன்சர்களிடம் கற்றுக்கொள்ளுங்கள்",
        nearYou: "உங்கள் அருகில்:",
        seeMore: "மேலும் பார்க்க...",
        popularReligious: "பிரபல வழிபாட்டுத் தலங்கள்",
        locationEnabled: "அருகிலுள்ள பராமரிப்பாளர்கள், மருத்துவ வசதி, டாக்ஸி நிறுத்தங்கள் போன்றவற்றைப் பார்க்க இருப்பிடப் பகிர்வு இயக்கத்தில் உள்ளது.",
        goToChats: "எல்லா உரையாடல்களும்",
        goToClinics: "எல்லா கிளினிக்குகளும்",
        goToTransport: "எல்லா போக்குவரத்துத் தகவல்களும்",
        mapView: "வரைபடம்",
        caregivers: "பராமரிப்பாளர்கள்",
        clinics: "கிளினிக்குகள்",
        taxis: "டாக்ஸி",
        atms: "ATM & வங்கிகள்",
        actionChat: "உரையாடல்",
        actionInfo: "தகவல் & வழி",
        dist100m: "100 மீ தூரம்",
        dist500m: "500 மீ தூரம்",
        dist1km: "1 கி.மீ தூரம்",
        religiousSiteTag: "வழிபாட்டுத் தலம்",
        moovitLabel: "Moovit/Google Maps",
        networkTypeWhatsapp: "WhatsApp குழு",
        networkTypeCommunity: "சமூக மையம்",
        districtNorthern: "வடக்கு மாவட்டம்",
        districtHaifa: "ஹைஃபா மாவட்டம்",
        districtJerusalem: "ஜெருசலேம் மாவட்டம்",
        taxiStopLabel: "டாக்ஸி நிறுத்தம்",
        tasksHeading: "இன்றைய பணிகள்",
        tasksSub: "செவ்வாய், மே 5",
        reminder: "நினைவூட்டல்: ",
        reminderBody: "நீங்கள் 4 மணி நேரமாக வேலை செய்கிறீர்கள். நோயாளி ஓய்வெடுத்தால், 10 நிமிடம் ஓய்வு எடுங்கள் அல்லது சிறிது நடந்து வாருங்கள்.",
        manageTasks: "பணிகளை நிர்வகி",
        pending: "நிலுவையில்",
        journalHeading: "டிஜிட்டல் நாட்குறிப்பு",
        journalSub: "மன அழுத்தத்தை வெளியிடவும் நன்றியுணர்வு தருணங்களைப் பதிவு செய்யவும் ஒரு தனிப்பட்ட இடம்.",
        burdenBook: "சுமை புத்தகம்",
        burdenBookSub: "(மனதை இறக்கி வையுங்கள்)",
        gratitudeBook: "நன்றி புத்தகம்",
        gratitudeBookSub: "(நல்ல தருணங்கள்)",
        howFeeling: "நீங்கள் எப்படி உணர்கிறீர்கள்?",
        wantRelease: "நான் மனதை இறக்கி வைக்க விரும்புகிறேன்...",
        gratefulFor: "நான் நன்றியுடன் இருக்கிறேன்...",
        saveEntry: "சேமி",
        recentEntries: "சமீபத்திய பதிவுகள்",
        burdenBookLabel: "சுமை புத்தகம்",
        gratitudeBookLabel: "நன்றி புத்தகம்",
        initUserMsg: "முதலாளி குடும்பத்தின் முழு வீட்டையும் சுத்தம் செய்யச் சொல்லலாமா?",
        initBotText: "இஸ்ரேலிய தொழிலாளர் சட்டங்கள் மற்றும் நீங்கள் பதிவேற்றிய ஒப்பந்தத்தின்படி, நீங்கள் ",
        initBotHighlight: "உங்கள் நோயாளி தொடர்பான சுத்தம் மட்டுமே செய்ய வேண்டும்",
        initBotSuffix: ", முழு வீட்டையும் அல்ல.",
        botReply: "இஸ்ரேலிய தொழிலாளர் சட்டங்களின் அடிப்படையில் உங்கள் கேள்வியைப் பார்க்கிறேன். நான் ஒரு AI உதவியாளர், இது சட்ட ஆலோசனை அல்ல. உங்கள் நிலைமைக்கு உரிமம் பெற்ற தொழிலாளர் வழக்கறிஞரை அணுகுங்கள்.",
        journalEntry1: "இன்று மிகவும் கடினமான நாள். மொழித் தடையால் ஒரு சாதாரண மருத்துவர் சந்திப்பு கூட மிகுந்த மன அழுத்தமாக இருந்தது.",
        journalEntry2: "அமைதியான காலைக்காகவும், Mr. Cohen-இன் பிசியோதெரபி வலியில்லாமல் முடிந்ததற்காகவும் நன்றியுடன் இருக்கிறேன்.",
        task1: "காலை மருந்து கொடுக்க",
        task2: "காலை உணவு",
        task3: "முதலாளியை அழைத்து நேரம் மாற்ற",
        task4: "நடைப்பயிற்சி",
        task5: "மதிய மருந்து கொடுக்க",
    },
};

// ── Community catalog content ──────────────────────────────────────
// This is app-catalog content (not per-user), so it lives here next
// to T rather than being seeded inside the screen. Names/authors that
// are proper nouns stay identical across languages; everything else
// (types, titles, descriptions, districts) is translated per language.

export type SupportNetwork = {
    id: string;
    name: string;
    typeKey: "networkTypeWhatsapp" | "networkTypeCommunity";
    emoji: string;
    bg: string;
};

export const SUPPORT_NETWORKS: SupportNetwork[] = [
    { id: "1", name: "Haifa Filipino\nCaregivers", typeKey: "networkTypeWhatsapp", emoji: "💬", bg: "#e8f5e9" },
    { id: "2", name: "St. Joseph\nParish Events", typeKey: "networkTypeCommunity", emoji: "⛪", bg: "#fff8e1" },
];

export type Influencer = {
    id: string;
    title: Record<LangCode, string>;
    author: string;
    platform: string;
};

export const INFLUENCERS: Influencer[] = [
    {
        id: "1",
        title: {
            en: "Hebrew Basics for\nCaregivers",
            tl: "Mga Batayang Hebreo\npara sa Caregiver",
            ml: "കെയർഗിവർമാർക്കുള്ള\nഹീബ്രു അടിസ്ഥാനങ്ങൾ",
            ru: "Основы иврита\nдля сиделок",
            hi: "केयरगिवर के लिए\nहिब्रू की शुरुआत",
            ta: "பராமரிப்பாளர்களுக்கான\nஹீப்ரு அடிப்படைகள்",
        },
        author: "Shyni Babu",
        platform: "YouTube",
    },
    {
        id: "2",
        title: {
            en: "Navigating Transport",
            tl: "Pag-navigate sa Transportasyon",
            ml: "ഗതാഗതം കൈകാര്യം ചെയ്യൽ",
            ru: "Ориентация в транспорте",
            hi: "परिवहन का इस्तेमाल",
            ta: "போக்குவரத்தைப் பயன்படுத்துதல்",
        },
        author: "Maria Santos",
        platform: "TikTok",
    },
];

export type MapFilterId = "caregivers" | "clinics" | "taxis" | "atms";

export type MapResultItem = {
    id: string;
    name?: string;
    nameKey?: "taxiStopLabel";
    distanceKey: "dist100m" | "dist500m" | "dist1km";
    actionKey: "actionChat" | "actionInfo";
    color: string;
};

export const MAP_RESULTS: Record<MapFilterId, MapResultItem[]> = {
    caregivers: [
        { id: "1", name: "Priya", distanceKey: "dist100m", actionKey: "actionChat", color: "#7c3aed" },
        { id: "2", name: "Maria S.", distanceKey: "dist500m", actionKey: "actionChat", color: "#2e7d32" },
    ],
    clinics: [
        { id: "1", name: "Horev Clinic", distanceKey: "dist100m", actionKey: "actionInfo", color: "#7c3aed" },
        { id: "2", name: "Hadar Clinic", distanceKey: "dist1km", actionKey: "actionInfo", color: "#2e7d32" },
    ],
    taxis: [
        { id: "1", nameKey: "taxiStopLabel", distanceKey: "dist500m", actionKey: "actionInfo", color: "#f57c00" },
    ],
    // Sample places until the map is connected to real data.
    atms: [
        { id: "1", name: "ATM – Bank Leumi", distanceKey: "dist100m", actionKey: "actionInfo", color: "#005dac" },
        { id: "2", name: "ATM – Bank Hapoalim", distanceKey: "dist500m", actionKey: "actionInfo", color: "#c62828" },
    ],
};

export type ReligiousPlace = {
    id: string;
    name: string;
    districtKey: "districtNorthern" | "districtHaifa" | "districtJerusalem";
    desc: Record<LangCode, string>;
    /** English Wikipedia article whose main photo is shown as the thumbnail. */
    wiki: string;
    /** Stable key for "I want to go" (stored on the server, never change it). */
    key: string;
};

export const RELIGIOUS_PLACES: ReligiousPlace[] = [
    {
        id: "1",
        name: "Nazareth (נצרת)",
        districtKey: "districtNorthern",
        wiki: "Basilica_of_the_Annunciation",
        key: "nazareth",
        desc: {
            en: "A major pilgrimage center featuring the Basilica of the Annunciation. Accessible via direct buses from Haifa and Tel Aviv.",
            tl: "Isang malaking sentro ng pilgrimahe na may Basilica of the Annunciation. Madaling marating gamit ang direktang bus mula Haifa at Tel Aviv.",
            ml: "അന്നൗൺസിയേഷൻ ബസിലിക്ക ഉൾപ്പെടുന്ന ഒരു പ്രധാന തീർത്ഥാടന കേന്ദ്രം. ഹൈഫയിൽ നിന്നും ടെൽ അവീവിൽ നിന്നും നേരിട്ടുള്ള ബസുകൾ വഴി എത്തിച്ചേരാം.",
            ru: "Крупный центр паломничества с базиликой Благовещения. Доступен на прямых автобусах из Хайфы и Тель-Авива.",
            hi: "बड़ा तीर्थ स्थल, जहाँ बेसिलिका ऑफ़ द एनाउंसिएशन है। हाइफ़ा और तेल अवीव से सीधी बसें जाती हैं।",
            ta: "அறிவிப்புப் பேராலயம் (Basilica of the Annunciation) உள்ள முக்கிய புனிதப் பயணத் தலம். ஹைஃபா மற்றும் டெல் அவிவிலிருந்து நேரடிப் பேருந்துகள் உள்ளன.",
        },
    },
    {
        id: "2",
        name: "Stella Maris Monastery",
        districtKey: "districtHaifa",
        wiki: "Stella_Maris_Monastery",
        key: "stella-maris",
        desc: {
            en: "A 19th-century Carmelite monastery located on the slopes of Mount Carmel in Haifa, offering beautiful panoramic views of the Mediterranean Sea.",
            tl: "Isang monasteryo ng Carmelite noong ika-19 siglo na matatagpuan sa gilid ng Bundok Carmel sa Haifa, na nag-aalok ng magandang panoramic na tanawin ng Dagat Mediteraneo.",
            ml: "ഹൈഫയിലെ കാർമൽ പർവതത്തിന്റെ ചരിവിൽ സ്ഥിതി ചെയ്യുന്ന 19-ാം നൂറ്റാണ്ടിലെ കാർമലൈറ്റ് ആശ്രമം, മെഡിറ്ററേനിയൻ കടലിന്റെ മനോഹരമായ പനോരമിക് ദൃശ്യങ്ങൾ വാഗ്ദാനം ചെയ്യുന്നു.",
            ru: "Кармелитский монастырь XIX века, расположенный на склонах горы Кармель в Хайфе, с прекрасным панорамным видом на Средиземное море.",
            hi: "हाइफ़ा में कार्मेल पर्वत की ढलान पर 19वीं सदी का कार्मेलाइट मठ, जहाँ से भूमध्य सागर का सुंदर नज़ारा दिखता है।",
            ta: "ஹைஃபாவில் கார்மேல் மலைச் சரிவில் உள்ள 19ஆம் நூற்றாண்டு கார்மலைட் மடம்; மத்தியதரைக் கடலின் அழகிய காட்சி தெரியும்.",
        },
    },
    {
        id: "3",
        name: "Church of the Holy Sepulchre",
        districtKey: "districtJerusalem",
        wiki: "Church_of_the_Holy_Sepulchre",
        key: "holy-sepulchre",
        desc: {
            en: "Located in the Christian Quarter of the Old City of Jerusalem, it is considered one of the holiest sites in Christianity.",
            tl: "Matatagpuan sa Christian Quarter ng Lumang Lungsod ng Jerusalem, itinuturing itong isa sa mga pinakabanal na lugar sa Kristiyanismo.",
            ml: "ജറുസലേമിലെ പഴയ നഗരത്തിലെ ക്രിസ്ത്യൻ ക്വാർട്ടറിൽ സ്ഥിതി ചെയ്യുന്ന ഇത് ക്രിസ്തുമതത്തിലെ ഏറ്റവും പുണ്യമായ സ്ഥലങ്ങളിലൊന്നായി കണക്കാക്കപ്പെടുന്നു.",
            ru: "Расположена в Христианском квартале Старого города Иерусалима и считается одним из самых святых мест христианства.",
            hi: "यरूशलम के पुराने शहर के ईसाई क्वार्टर में स्थित, इसे ईसाई धर्म के सबसे पवित्र स्थानों में से एक माना जाता है।",
            ta: "ஜெருசலேம் பழைய நகரின் கிறிஸ்தவப் பகுதியில் உள்ளது; கிறிஸ்தவத்தின் மிகப் புனிதமான தலங்களில் ஒன்றாகக் கருதப்படுகிறது.",
        },
    },
];