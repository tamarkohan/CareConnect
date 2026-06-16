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

    // ── Assistant ──
    assistantHeading: string;
    assistantSub: string;
    uploadTitle: string;
    uploadDesc: string;
    contractUploaded: string;
    typeMessage: string;

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

    // ── Tasks ──
    tasksHeading: string;
    tasksSub: string;
    reminder: string;
    reminderBody: string;
    manageTasks: string;
    pending: string;

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
    },
};