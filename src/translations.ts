// ── translations.ts ─────────────────────────────────────────────────
// Central translation file for CareConnect Israel
// Covers all screens in all 4 supported languages.

export type LangCode = "en" | "tl" | "ml" | "ru";

export const LANGUAGES: { code: LangCode; label: string; nativeLabel: string }[] = [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "tl", label: "Tagalog", nativeLabel: "Tagalog" },
    { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
    { code: "ru", label: "Russian", nativeLabel: "Русский" },
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
};

const MONTHS_FULL: Record<LangCode, string[]> = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    tl: ["Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo", "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"],
    ml: ["ജനുവരി", "ഫെബ്രുവരി", "മാർച്ച്", "ഏപ്രിൽ", "മേയ്", "ജൂൺ", "ജൂലൈ", "ഓഗസ്റ്റ്", "സെപ്റ്റംബർ", "ഒക്ടോബർ", "നവംബർ", "ഡിസംബർ"],
    ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
};

const WEEKDAYS_FULL: Record<LangCode, string[]> = {
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    tl: ["Linggo", "Lunes", "Martes", "Miyerkules", "Huwebes", "Biyernes", "Sabado"],
    ml: ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"],
    ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
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
        return { en: "Just now", tl: "Ngayon lang", ml: "ഇപ്പോൾ", ru: "Только что" }[lang];
    }
    if (diffMin < 60) {
        if (lang === "en") return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
        if (lang === "tl") return `${diffMin} minuto ang nakalipas`;
        if (lang === "ml") return `${diffMin} മിനിറ്റ് മുമ്പ്`;
        return `${diffMin} ${pluralRu(diffMin, "минуту", "минуты", "минут")} назад`;
    }
    if (diffHour < 24) {
        if (lang === "en") return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
        if (lang === "tl") return `${diffHour} oras ang nakalipas`;
        if (lang === "ml") return `${diffHour} മണിക്കൂർ മുമ്പ്`;
        return `${diffHour} ${pluralRu(diffHour, "час", "часа", "часов")} назад`;
    }
    if (diffDay === 1) {
        return { en: "Yesterday", tl: "Kahapon", ml: "ഇന്നലെ", ru: "Вчера" }[lang];
    }
    if (lang === "en") return `${diffDay} days ago`;
    if (lang === "tl") return `${diffDay} araw ang nakalipas`;
    if (lang === "ml") return `${diffDay} ദിവസം മുമ്പ്`;
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
    pibaApp: string;
    publicTransport: string;
    remittanceApps: string;
    faqElderly: string;
    aboutUs: string;
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
        migrationSupport: "Migration Support",
        pibaApp: "PIBA Application",
        publicTransport: "Public Transportation Use",
        remittanceApps: "Remittance Applications",
        faqElderly: "FAQs for Caring\nfor Elderly Clients",
        aboutUs: "About Us",
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
        recentTranslations: "Recent Translations",
        catMedical: "Medical",
        catSlang: "Slang",
        catTransit: "Transit",
        assistantHeading: "Legal & Contract Bot",
        assistantSub: "Ask me anything about your rights.",
        uploadTitle: "Upload or Scan Your\nEmployment Contract",
        uploadDesc: "Privately scan your contract to ask the AI about your legal rights, weekly rest days, and what your employer can or cannot demand. Your data is strictly confidential.",
        contractUploaded: "✓ Contract uploaded",
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
        migrationSupport: "Tulong sa Migrasyon",
        pibaApp: "Aplikasyon sa PIBA",
        publicTransport: "Paggamit ng Pampublikong Sasakyan",
        remittanceApps: "Mga App sa Remittance",
        faqElderly: "FAQ para sa Pag-aalaga\nng Matatandang Kliyente",
        aboutUs: "Tungkol sa Amin",
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
        recentTranslations: "Mga Kamakailang Pagsasalin",
        catMedical: "Medikal",
        catSlang: "Slang",
        catTransit: "Transportasyon",
        assistantHeading: "Legal at Kontrata Bot",
        assistantSub: "Tanungin ako tungkol sa iyong mga karapatan.",
        uploadTitle: "I-upload o I-scan ang Iyong\nKasunduan sa Trabaho",
        uploadDesc: "Pribadong i-scan ang iyong kontrata upang tanungin ang AI tungkol sa iyong mga legal na karapatan, lingguhang pahinga, at kung ano ang maaari o hindi maaaring hilingin ng iyong employer. Ang iyong data ay mahigpit na kumpidensyal.",
        contractUploaded: "✓ Na-upload ang kontrata",
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
        migrationSupport: "കുടിയേറ്റ പിന്തുണ",
        pibaApp: "PIBA അപ്ലിക്കേഷൻ",
        publicTransport: "പൊതു ഗതാഗതം ഉപയോഗം",
        remittanceApps: "റെമിറ്റൻസ് ആപ്ലിക്കേഷനുകൾ",
        faqElderly: "മുതിർന്ന ക്ലയന്റുകളുടെ\nസേവനത്തിനുള്ള FAQ",
        aboutUs: "ഞങ്ങളെ കുറിച്ച്",
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
        recentTranslations: "സമീപകാല വിവർത്തനങ്ങൾ",
        catMedical: "മെഡിക്കൽ",
        catSlang: "സ്ലാങ്",
        catTransit: "ട്രാൻസിറ്റ്",
        assistantHeading: "നിയമ & കരാർ ബോട്ട്",
        assistantSub: "നിങ്ങളുടെ അവകാശങ്ങളെക്കുറിച്ച് ചോദിക്കൂ.",
        uploadTitle: "നിങ്ങളുടെ തൊഴിൽ കരാർ\nഅപ്ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ സ്കാൻ ചെയ്യുക",
        uploadDesc: "AI-നോട് നിങ്ങളുടെ നിയമപരമായ അവകാശങ്ങൾ, ആഴ്ചയിലെ വിശ്രമ ദിവസങ്ങൾ, തൊഴിലുടമ ആവശ്യപ്പെടാൻ കഴിയുന്നതും ഇല്ലാത്തതും ചോദിക്കാൻ നിങ്ങളുടെ കരാർ സ്വകാര്യമായി സ്കാൻ ചെയ്യുക. നിങ്ങളുടെ ഡേറ്റ കർശനമായി രഹസ്യമാണ്.",
        contractUploaded: "✓ കരാർ അപ്ലോഡ് ചെയ്തു",
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
        migrationSupport: "Поддержка мигрантов",
        pibaApp: "Заявление PIBA",
        publicTransport: "Использование общественного транспорта",
        remittanceApps: "Приложения для денежных переводов",
        faqElderly: "FAQ по уходу\nза пожилыми клиентами",
        aboutUs: "О нас",
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
        recentTranslations: "Недавние переводы",
        catMedical: "Медицинское",
        catSlang: "Сленг",
        catTransit: "Транспорт",
        assistantHeading: "Юридический бот",
        assistantSub: "Спросите о своих правах.",
        uploadTitle: "Загрузить или отсканировать\nваш трудовой договор",
        uploadDesc: "Приватно отсканируйте ваш контракт, чтобы спросить ИИ о ваших правах, выходных днях и требованиях работодателя. Ваши данные строго конфиденциальны.",
        contractUploaded: "✓ Контракт загружен",
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
        },
        author: "Maria Santos",
        platform: "TikTok",
    },
];

export type MapFilterId = "caregivers" | "clinics" | "taxis";

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
};

export type ReligiousPlace = {
    id: string;
    name: string;
    districtKey: "districtNorthern" | "districtHaifa" | "districtJerusalem";
    desc: Record<LangCode, string>;
};

export const RELIGIOUS_PLACES: ReligiousPlace[] = [
    {
        id: "1",
        name: "Nazareth (נצרת)",
        districtKey: "districtNorthern",
        desc: {
            en: "A major pilgrimage center featuring the Basilica of the Annunciation. Accessible via direct buses from Haifa and Tel Aviv.",
            tl: "Isang malaking sentro ng pilgrimahe na may Basilica of the Annunciation. Madaling marating gamit ang direktang bus mula Haifa at Tel Aviv.",
            ml: "അന്നൗൺസിയേഷൻ ബസിലിക്ക ഉൾപ്പെടുന്ന ഒരു പ്രധാന തീർത്ഥാടന കേന്ദ്രം. ഹൈഫയിൽ നിന്നും ടെൽ അവീവിൽ നിന്നും നേരിട്ടുള്ള ബസുകൾ വഴി എത്തിച്ചേരാം.",
            ru: "Крупный центр паломничества с базиликой Благовещения. Доступен на прямых автобусах из Хайфы и Тель-Авива.",
        },
    },
    {
        id: "2",
        name: "Stella Maris Monastery",
        districtKey: "districtHaifa",
        desc: {
            en: "A 19th-century Carmelite monastery located on the slopes of Mount Carmel in Haifa, offering beautiful panoramic views of the Mediterranean Sea.",
            tl: "Isang monasteryo ng Carmelite noong ika-19 siglo na matatagpuan sa gilid ng Bundok Carmel sa Haifa, na nag-aalok ng magandang panoramic na tanawin ng Dagat Mediteraneo.",
            ml: "ഹൈഫയിലെ കാർമൽ പർവതത്തിന്റെ ചരിവിൽ സ്ഥിതി ചെയ്യുന്ന 19-ാം നൂറ്റാണ്ടിലെ കാർമലൈറ്റ് ആശ്രമം, മെഡിറ്ററേനിയൻ കടലിന്റെ മനോഹരമായ പനോരമിക് ദൃശ്യങ്ങൾ വാഗ്ദാനം ചെയ്യുന്നു.",
            ru: "Кармелитский монастырь XIX века, расположенный на склонах горы Кармель в Хайфе, с прекрасным панорамным видом на Средиземное море.",
        },
    },
    {
        id: "3",
        name: "Church of the Holy Sepulchre",
        districtKey: "districtJerusalem",
        desc: {
            en: "Located in the Christian Quarter of the Old City of Jerusalem, it is considered one of the holiest sites in Christianity.",
            tl: "Matatagpuan sa Christian Quarter ng Lumang Lungsod ng Jerusalem, itinuturing itong isa sa mga pinakabanal na lugar sa Kristiyanismo.",
            ml: "ജറുസലേമിലെ പഴയ നഗരത്തിലെ ക്രിസ്ത്യൻ ക്വാർട്ടറിൽ സ്ഥിതി ചെയ്യുന്ന ഇത് ക്രിസ്തുമതത്തിലെ ഏറ്റവും പുണ്യമായ സ്ഥലങ്ങളിലൊന്നായി കണക്കാക്കപ്പെടുന്നു.",
            ru: "Расположена в Христианском квартале Старого города Иерусалима и считается одним из самых святых мест христианства.",
        },
    },
];