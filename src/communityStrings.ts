// ── communityStrings.ts ──────────────────────────────────────────────
// Texts of the community page (map, caregivers list, contact requests) in
// every app language. Tagalog, Malayalam and Russian should be checked by
// native speakers. The fixed contact messages are in MESSAGES: people can
// only send one of these, never their own text.
import { LangCode } from "./translations";

type Strings = {
    openMap: string;
    searchOnMap: string;
    pickCityFirst: string;
    mapCategory: Record<"clinics" | "taxis" | "atms" | "banks", string>;   // what to search on the map
    // Caregivers list
    joinTitle: string;
    joinBody: string;
    firstName: string;
    join: string;
    leave: string;
    leaveConfirm: string;
    youAppearAs: string;           // {name} {place}
    noPeople: string;
    askToConnect: string;
    chooseMessage: string;
    send: string;
    cancel: string;
    statusSent: string;
    statusAccepted: string;
    statusDeclined: string;
    statusReceived: string;
    // Requests
    requestsTitle: string;
    wantsToConnect: string;        // {name}
    accept: string;
    decline: string;
    block: string;
    blockConfirm: string;
    contactsTitle: string;
    sharePhone: string;
    sharePhoneHint: string;
    phonePlaceholder: string;
    shared: string;                // {phone}
    theirPhone: string;            // {name}
    waitingForPhone: string;       // {name}
    call: string;
    whatsapp: string;
    // Demo cards
    demo: string;
    demoNoLink: string;
    directions: string;
    saved: string;
    save: string;
    privacy: string;
};

export const COMMUNITY_T: Record<LangCode, Strings> = {
    en: {
        openMap: "Open in Google Maps",
        searchOnMap: "Search on the map",
        pickCityFirst: "Choose your city below to see the map.",
        mapCategory: { clinics: "clinic", taxis: "taxi station", atms: "ATM", banks: "bank" },
        joinTitle: "Meet caregivers in your city",
        joinBody: "Join the list to let other caregivers in your city ask to connect with you. Others see only your first name and the city and neighborhood you chose – never your location, phone or photo.",
        firstName: "Your first name",
        join: "Join the list",
        leave: "Leave the list",
        leaveConfirm: "Leave the caregivers list? Others won't see you anymore.",
        youAppearAs: "Others see you as: {name} · {place}",
        noPeople: "No other caregivers on the list in this city yet.",
        askToConnect: "Ask to connect",
        chooseMessage: "Choose a message",
        send: "Send",
        cancel: "Cancel",
        statusSent: "Request sent",
        statusAccepted: "Connected",
        statusDeclined: "Not accepted",
        statusReceived: "Wants to connect",
        requestsTitle: "Requests for you",
        wantsToConnect: "{name} wants to connect:",
        accept: "Accept",
        decline: "Decline",
        block: "Block",
        blockConfirm: "Block this person? You won't see each other anymore.",
        contactsTitle: "My connections",
        sharePhone: "Share my phone number",
        sharePhoneHint: "Only this person will see it.",
        phonePlaceholder: "Your phone number",
        shared: "You shared: {phone}",
        theirPhone: "{name}'s number:",
        waitingForPhone: "{name} hasn't shared a number yet.",
        call: "Call",
        whatsapp: "WhatsApp",
        demo: "Demo",
        demoNoLink: "This is an example – the real link isn't added yet.",
        directions: "Directions (bus / train)",
        saved: "Saved",
        save: "Save",
        privacy: "For your safety there is no chat and no photos: only fixed messages, and a phone number only if you choose to share it after accepting.",
    },
    tl: {
        openMap: "Buksan sa Google Maps",
        searchOnMap: "Hanapin sa mapa",
        pickCityFirst: "Piliin ang lungsod mo sa ibaba para makita ang mapa.",
        mapCategory: { clinics: "clinic", taxis: "taxi station", atms: "ATM", banks: "bank" },
        joinTitle: "Kilalanin ang mga caregiver sa lungsod mo",
        joinBody: "Sumali sa listahan para makahingi ng connect ang ibang caregiver sa lungsod mo. Ang makikita lang nila ay ang first name mo at ang lungsod at lugar na pinili mo – hindi ang location, phone o picture mo.",
        firstName: "First name mo",
        join: "Sumali sa listahan",
        leave: "Umalis sa listahan",
        leaveConfirm: "Umalis sa listahan ng caregivers? Hindi ka na makikita ng iba.",
        youAppearAs: "Nakikita ka ng iba bilang: {name} · {place}",
        noPeople: "Wala pang ibang caregiver sa listahan sa lungsod na ito.",
        askToConnect: "Humingi ng connect",
        chooseMessage: "Pumili ng message",
        send: "Ipadala",
        cancel: "Kanselahin",
        statusSent: "Naipadala ang request",
        statusAccepted: "Connected",
        statusDeclined: "Hindi tinanggap",
        statusReceived: "Gustong mag-connect",
        requestsTitle: "Mga request para sa iyo",
        wantsToConnect: "Gustong mag-connect ni {name}:",
        accept: "Tanggapin",
        decline: "Tanggihan",
        block: "I-block",
        blockConfirm: "I-block ang taong ito? Hindi na kayo magkikita sa app.",
        contactsTitle: "Mga connection ko",
        sharePhone: "Ibahagi ang phone number ko",
        sharePhoneHint: "Siya lang ang makakakita nito.",
        phonePlaceholder: "Phone number mo",
        shared: "Ibinahagi mo: {phone}",
        theirPhone: "Number ni {name}:",
        waitingForPhone: "Hindi pa nagbabahagi ng number si {name}.",
        call: "Tawagan",
        whatsapp: "WhatsApp",
        demo: "Demo",
        demoNoLink: "Halimbawa lang ito – wala pang totoong link.",
        directions: "Direksyon (bus / tren)",
        saved: "Naka-save",
        save: "I-save",
        privacy: "Para sa kaligtasan mo, walang chat at walang picture: mga nakatakdang message lang, at phone number lang kung pipiliin mong ibahagi pagkatapos tanggapin.",
    },
    ml: {
        openMap: "ഗൂഗിൾ മാപ്സിൽ തുറക്കുക",
        searchOnMap: "മാപ്പിൽ തിരയുക",
        pickCityFirst: "മാപ്പ് കാണാൻ താഴെ നിങ്ങളുടെ നഗരം തിരഞ്ഞെടുക്കുക.",
        mapCategory: { clinics: "clinic", taxis: "taxi station", atms: "ATM", banks: "bank" },
        joinTitle: "നിങ്ങളുടെ നഗരത്തിലെ പരിചാരകരെ പരിചയപ്പെടുക",
        joinBody: "ലിസ്റ്റിൽ ചേരുക, നിങ്ങളുടെ നഗരത്തിലെ മറ്റ് പരിചാരകർക്ക് ബന്ധപ്പെടാൻ അഭ്യർത്ഥിക്കാം. നിങ്ങളുടെ ആദ്യ പേരും നിങ്ങൾ തിരഞ്ഞെടുത്ത നഗരവും പ്രദേശവും മാത്രമേ അവർ കാണൂ – നിങ്ങളുടെ ലൊക്കേഷനോ ഫോണോ ഫോട്ടോയോ ഒരിക്കലും കാണില്ല.",
        firstName: "നിങ്ങളുടെ ആദ്യ പേര്",
        join: "ലിസ്റ്റിൽ ചേരുക",
        leave: "ലിസ്റ്റിൽ നിന്ന് പുറത്തുപോകുക",
        leaveConfirm: "പരിചാരകരുടെ ലിസ്റ്റിൽ നിന്ന് പുറത്തുപോകണോ? മറ്റുള്ളവർ ഇനി നിങ്ങളെ കാണില്ല.",
        youAppearAs: "മറ്റുള്ളവർ നിങ്ങളെ കാണുന്നത്: {name} · {place}",
        noPeople: "ഈ നഗരത്തിൽ ലിസ്റ്റിൽ മറ്റ് പരിചാരകർ ഇതുവരെ ഇല്ല.",
        askToConnect: "ബന്ധപ്പെടാൻ അഭ്യർത്ഥിക്കുക",
        chooseMessage: "ഒരു സന്ദേശം തിരഞ്ഞെടുക്കുക",
        send: "അയക്കുക",
        cancel: "റദ്ദാക്കുക",
        statusSent: "അഭ്യർത്ഥന അയച്ചു",
        statusAccepted: "ബന്ധപ്പെട്ടു",
        statusDeclined: "സ്വീകരിച്ചില്ല",
        statusReceived: "ബന്ധപ്പെടാൻ ആഗ്രഹിക്കുന്നു",
        requestsTitle: "നിങ്ങൾക്കുള്ള അഭ്യർത്ഥനകൾ",
        wantsToConnect: "{name} ബന്ധപ്പെടാൻ ആഗ്രഹിക്കുന്നു:",
        accept: "സ്വീകരിക്കുക",
        decline: "നിരസിക്കുക",
        block: "ബ്ലോക്ക് ചെയ്യുക",
        blockConfirm: "ഈ വ്യക്തിയെ ബ്ലോക്ക് ചെയ്യണോ? നിങ്ങൾ ഇനി പരസ്പരം കാണില്ല.",
        contactsTitle: "എന്റെ ബന്ധങ്ങൾ",
        sharePhone: "എന്റെ ഫോൺ നമ്പർ പങ്കിടുക",
        sharePhoneHint: "ഈ വ്യക്തിക്ക് മാത്രമേ കാണാനാകൂ.",
        phonePlaceholder: "നിങ്ങളുടെ ഫോൺ നമ്പർ",
        shared: "നിങ്ങൾ പങ്കിട്ടത്: {phone}",
        theirPhone: "{name}-ന്റെ നമ്പർ:",
        waitingForPhone: "{name} ഇതുവരെ നമ്പർ പങ്കിട്ടിട്ടില്ല.",
        call: "വിളിക്കുക",
        whatsapp: "വാട്ട്സ്ആപ്പ്",
        demo: "ഡെമോ",
        demoNoLink: "ഇതൊരു ഉദാഹരണം മാത്രമാണ് – യഥാർത്ഥ ലിങ്ക് ഇതുവരെ ചേർത്തിട്ടില്ല.",
        directions: "വഴി (ബസ് / ട്രെയിൻ)",
        saved: "സേവ് ചെയ്തു",
        save: "സേവ് ചെയ്യുക",
        privacy: "നിങ്ങളുടെ സുരക്ഷയ്ക്കായി ചാറ്റും ഫോട്ടോകളും ഇല്ല: നിശ്ചിത സന്ദേശങ്ങൾ മാത്രം, സ്വീകരിച്ചതിന് ശേഷം നിങ്ങൾ തീരുമാനിച്ചാൽ മാത്രം ഫോൺ നമ്പർ.",
    },
    ru: {
        openMap: "Открыть в Google Maps",
        searchOnMap: "Искать на карте",
        pickCityFirst: "Выберите город ниже, чтобы увидеть карту.",
        mapCategory: { clinics: "clinic", taxis: "taxi station", atms: "ATM", banks: "bank" },
        joinTitle: "Познакомьтесь с сиделками в вашем городе",
        joinBody: "Присоединитесь к списку, и другие сиделки в вашем городе смогут попросить связаться с вами. Они видят только ваше имя и выбранные город и район – никогда ваше местоположение, телефон или фото.",
        firstName: "Ваше имя",
        join: "Присоединиться",
        leave: "Выйти из списка",
        leaveConfirm: "Выйти из списка сиделок? Другие больше не будут вас видеть.",
        youAppearAs: "Другие видят вас так: {name} · {place}",
        noPeople: "В этом городе в списке пока нет других сиделок.",
        askToConnect: "Попросить связаться",
        chooseMessage: "Выберите сообщение",
        send: "Отправить",
        cancel: "Отмена",
        statusSent: "Запрос отправлен",
        statusAccepted: "На связи",
        statusDeclined: "Не принят",
        statusReceived: "Хочет связаться",
        requestsTitle: "Запросы для вас",
        wantsToConnect: "{name} хочет связаться:",
        accept: "Принять",
        decline: "Отклонить",
        block: "Заблокировать",
        blockConfirm: "Заблокировать этого человека? Вы больше не будете видеть друг друга.",
        contactsTitle: "Мои контакты",
        sharePhone: "Поделиться номером",
        sharePhoneHint: "Его увидит только этот человек.",
        phonePlaceholder: "Ваш номер телефона",
        shared: "Вы поделились: {phone}",
        theirPhone: "Номер {name}:",
        waitingForPhone: "{name} пока не поделился(-ась) номером.",
        call: "Позвонить",
        whatsapp: "WhatsApp",
        demo: "Пример",
        demoNoLink: "Это пример – настоящей ссылки пока нет.",
        directions: "Маршрут (автобус / поезд)",
        saved: "Сохранено",
        save: "Сохранить",
        privacy: "Для вашей безопасности здесь нет чата и фото: только готовые сообщения, а номер телефона – только если вы решите им поделиться после принятия запроса.",
    },
};

/** The only messages a contact request can carry (keys must match backend/services/community.js). */
export const MESSAGES: Record<string, Record<LangCode, string>> = {
    hello: {
        en: "Hi! I'm a caregiver in your area. Would you like to be in touch?",
        tl: "Hi! Caregiver din ako sa lugar mo. Gusto mo bang magkakilala tayo?",
        ml: "ഹായ്! ഞാൻ നിങ്ങളുടെ പ്രദേശത്തെ ഒരു പരിചാരകയാണ്. നമുക്ക് ബന്ധപ്പെടാമോ?",
        ru: "Привет! Я сиделка из вашего района. Давайте познакомимся?",
    },
    newInArea: {
        en: "I'm new in this area. Could you give me some tips?",
        tl: "Bago lang ako sa lugar na ito. Puwede mo ba akong bigyan ng tips?",
        ml: "ഞാൻ ഈ പ്രദേശത്ത് പുതിയതാണ്. ചില നുറുങ്ങുകൾ തരാമോ?",
        ru: "Я недавно в этом районе. Можете подсказать что-нибудь полезное?",
    },
    dayOff: {
        en: "Would you like to meet on our day off?",
        tl: "Gusto mo bang magkita tayo sa day off natin?",
        ml: "നമ്മുടെ അവധി ദിവസം കണ്ടുമുട്ടാമോ?",
        ru: "Хотите встретиться в выходной?",
    },
    sameLanguage: {
        en: "I'm looking for someone who speaks my language.",
        tl: "Naghahanap ako ng kausap na pareho ang wika ko.",
        ml: "എന്റെ ഭാഷ സംസാരിക്കുന്ന ഒരാളെ ഞാൻ തിരയുകയാണ്.",
        ru: "Ищу человека, который говорит на моём языке.",
    },
    advice: {
        en: "Can I ask you for advice about caregiving work?",
        tl: "Puwede ba akong humingi ng payo tungkol sa trabaho ng caregiver?",
        ml: "പരിചരണ ജോലിയെക്കുറിച്ച് ഉപദേശം ചോദിക്കാമോ?",
        ru: "Можно спросить у вас совета о работе сиделки?",
    },
};

export const fillC = (text: string, values: Record<string, string>) =>
    text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");
