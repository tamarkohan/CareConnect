// ── guideStrings.ts ──────────────────────────────────────────────────
// Texts of the short welcome guide shown after an account's first sign-in (and
// from Menu → App Guide). It invites people to try what each button of the
// bottom navigation bar leads to.
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
    more: string;                 // opens a page's tips
    less: string;
};

export const GUIDE_T: Record<LangCode, Strings> = {
    en: {
        title: "Welcome to CareConnect! 👋",
        intro: "Six helpers made for you – tap a button at the bottom of the screen any time:",
        home: "Your everyday toolbox: emergency calls in one tap, a new Hebrew word every day, easy guides, your payslips explained in your language and a money converter for sending home.",
        translator: "Type, speak or snap a photo of a letter or a pill box – get it in your language in seconds, with the Hebrew pronunciation so you can say it out loud.",
        assistant: "Ask any question about your rights at work in a chat made just for you. Upload your own contract and get a clear summary and recommendations, based on trusted Israeli sources.",
        community: "Meet caregivers in your city, plan trips to holy places together, and find clinics, taxis, banks and places to pray near you.",
        tasks: "Plan your day with ease: add tasks with a time, repeat them on the days you choose, tick them off and see everything you've done.",
        journal: "Your private corner: let out a hard day in the Burden Book and keep your happy moments in the Gratitude Book – safe and just for you.",
        gotIt: "Let's start!",
        more: "More ▾",
        less: "Less ▴",
    },
    tl: {
        title: "Maligayang pagdating sa CareConnect! 👋",
        intro: "Anim na katulong na para sa iyo – pindutin ang mga button sa ibaba ng screen kahit kailan:",
        home: "Ang everyday toolbox mo: emergency call sa isang pindot, bagong salitang Hebrew araw-araw, madaling mga gabay, paliwanag ng payslip mo sa sarili mong wika at converter para sa pagpapadala ng pera.",
        translator: "Mag-type, magsalita o kunan ng litrato ang sulat o kahon ng gamot – makukuha mo agad sa sarili mong wika, kasama ang bigkas sa Hebrew para masabi mo ito.",
        assistant: "Itanong ang kahit ano tungkol sa mga karapatan mo sa trabaho sa isang chat na para sa iyo lang. I-upload ang sarili mong kontrata at makakuha ng malinaw na buod at mga rekomendasyon, mula sa mga mapagkakatiwalaang source sa Israel.",
        community: "Kilalanin ang mga caregiver sa lungsod mo, magplano ng sabay na pagbisita sa mga banal na lugar, at hanapin ang mga klinika, taxi, bangko at dasalan malapit sa iyo.",
        tasks: "Planuhin nang madali ang araw mo: magdagdag ng gawain na may oras, ulitin sa mga araw na pipiliin mo, lagyan ng tsek kapag tapos at tingnan ang lahat ng natapos mo.",
        journal: "Ang pribado mong sulok: ilabas ang mabigat na araw sa Burden Book at itago ang masasayang sandali sa Gratitude Book – ligtas at para sa iyo lang.",
        gotIt: "Tara, simulan na!",
        more: "Higit pa ▾",
        less: "Mas kaunti ▴",
    },
    ml: {
        title: "CareConnect-ലേക്ക് സ്വാഗതം! 👋",
        intro: "നിങ്ങൾക്കായി ആറ് സഹായികൾ – സ്ക്രീനിന്റെ താഴെയുള്ള ബട്ടണുകൾ എപ്പോൾ വേണമെങ്കിലും അമർത്തുക:",
        home: "നിങ്ങളുടെ ദിവസേനയുള്ള സഹായി: ഒറ്റ ടാപ്പിൽ അടിയന്തര കോൾ, ദിവസവും ഒരു പുതിയ ഹീബ്രു വാക്ക്, എളുപ്പമുള്ള ഗൈഡുകൾ, നിങ്ങളുടെ ഭാഷയിൽ ശമ്പള സ്ലിപ്പിന്റെ വിശദീകരണം, നാട്ടിലേക്ക് പണം അയയ്ക്കാൻ കറൻസി കൺവെർട്ടർ.",
        translator: "ടൈപ്പ് ചെയ്യുക, സംസാരിക്കുക അല്ലെങ്കിൽ ഒരു കത്തിന്റെയോ മരുന്നുപെട്ടിയുടെയോ ഫോട്ടോ എടുക്കുക – നിമിഷങ്ങൾക്കുള്ളിൽ നിങ്ങളുടെ ഭാഷയിൽ ലഭിക്കും, ഉറക്കെ പറയാൻ ഹീബ്രു ഉച്ചാരണവും.",
        assistant: "ജോലിയിലെ നിങ്ങളുടെ അവകാശങ്ങളെക്കുറിച്ച് എന്തും ചോദിക്കാം – നിങ്ങൾക്കായി മാത്രം ഒരുക്കിയ ഒരു ചാറ്റിൽ. നിങ്ങളുടെ കരാർ അപ്‌ലോഡ് ചെയ്യൂ, വിശ്വസനീയമായ ഇസ്രായേലി ഉറവിടങ്ങളെ അടിസ്ഥാനമാക്കി വ്യക്തമായ ചുരുക്കവും നിർദ്ദേശങ്ങളും നേടൂ.",
        community: "നിങ്ങളുടെ നഗരത്തിലെ കെയർഗിവർമാരെ പരിചയപ്പെടുക, പുണ്യസ്ഥലങ്ങളിലേക്ക് ഒരുമിച്ച് യാത്ര പ്ലാൻ ചെയ്യുക, അടുത്തുള്ള ക്ലിനിക്കുകൾ, ടാക്സികൾ, ബാങ്കുകൾ, പ്രാർത്ഥനാ സ്ഥലങ്ങൾ എന്നിവ കണ്ടെത്തുക.",
        tasks: "ദിവസം എളുപ്പത്തിൽ പ്ലാൻ ചെയ്യൂ: സമയത്തോടൊപ്പം ടാസ്ക്കുകൾ ചേർക്കുക, ഇഷ്ടമുള്ള ദിവസങ്ങളിൽ ആവർത്തിക്കുക, ചെയ്തു കഴിഞ്ഞാൽ ടിക്ക് ചെയ്യുക, ചെയ്തതെല്ലാം കാണുക.",
        journal: "നിങ്ങളുടെ സ്വകാര്യ ഇടം: ബുദ്ധിമുട്ടുള്ള ദിവസം ഭാര പുസ്തകത്തിൽ ഇറക്കിവെക്കൂ, സന്തോഷ നിമിഷങ്ങൾ നന്ദി പുസ്തകത്തിൽ സൂക്ഷിക്കൂ – സുരക്ഷിതമായി, നിങ്ങൾക്ക് മാത്രം.",
        gotIt: "നമുക്ക് തുടങ്ങാം!",
        more: "കൂടുതൽ ▾",
        less: "കുറച്ച് ▴",
    },
    ru: {
        title: "Добро пожаловать в CareConnect! 👋",
        intro: "Шесть помощников, созданных для вас, – кнопки внизу экрана всегда под рукой:",
        home: "Всё нужное на каждый день: экстренный звонок одним нажатием, новое слово на иврите каждый день, понятные инструкции, расчётный лист с объяснением на вашем языке и конвертер валют для переводов домой.",
        translator: "Напишите, скажите вслух или сфотографируйте письмо или упаковку лекарства – за секунды получите перевод на свой язык и подсказку, как произнести это на иврите.",
        assistant: "Задайте любой вопрос о своих правах на работе в чате, созданном специально для вас. Загрузите свой договор и получите понятное краткое изложение и рекомендации на основе надёжных израильских источников.",
        community: "Знакомьтесь с сиделками в своём городе, вместе планируйте поездки к святым местам и находите поблизости клиники, такси, банки и места для молитвы.",
        tasks: "Планируйте день легко: добавляйте дела со временем, повторяйте их в нужные дни, отмечайте выполненное и смотрите всё, что уже сделано.",
        journal: "Ваш личный уголок: выплесните тяжёлый день в «Книгу тягот», а радостные моменты сохраните в «Книге благодарности» – надёжно и только для вас.",
        gotIt: "Начнём!",
        more: "Подробнее ▾",
        less: "Свернуть ▴",
    },
    hi: {
        title: "CareConnect में आपका स्वागत है! 👋",
        intro: "आपके लिए बने छह मददगार – स्क्रीन के नीचे के बटन कभी भी दबाएँ:",
        home: "रोज़ का साथी: एक टैप में इमरजेंसी कॉल, हर दिन हिब्रू का एक नया शब्द, आसान गाइड, आपकी भाषा में समझाई गई वेतन पर्ची और घर पैसे भेजने के लिए करेंसी कन्वर्टर।",
        translator: "लिखें, बोलें या किसी चिट्ठी या दवा के डिब्बे की फ़ोटो लें – कुछ ही सेकंड में अपनी भाषा में पाएँ, साथ में हिब्रू उच्चारण भी, ताकि आप उसे बोल सकें।",
        assistant: "काम पर अपने अधिकारों के बारे में कोई भी सवाल पूछें, एक ऐसी चैट में जो सिर्फ़ आपके लिए बनी है। अपना अनुबंध अपलोड करें और भरोसेमंद इज़राइली स्रोतों के आधार पर साफ़ सार और सुझाव पाएँ।",
        community: "अपने शहर के केयरगिवर से मिलें, साथ मिलकर पवित्र स्थानों की यात्रा की योजना बनाएँ और पास के क्लिनिक, टैक्सी, बैंक और प्रार्थना स्थल खोजें।",
        tasks: "अपना दिन आसानी से प्लान करें: समय के साथ काम जोड़ें, चुने हुए दिनों पर दोहराएँ, पूरा होने पर टिक करें और अपने सारे पूरे हुए काम देखें।",
        journal: "आपका निजी कोना: भारी दिन की बातें बोझ की किताब में उतारें और खुशी के पल आभार की किताब में सँजोएँ – सुरक्षित और सिर्फ़ आपके लिए।",
        gotIt: "चलिए शुरू करें!",
        more: "और ▾",
        less: "कम ▴",
    },
    ta: {
        title: "CareConnect-க்கு வரவேற்கிறோம்! 👋",
        intro: "உங்களுக்காக ஆறு உதவியாளர்கள் – திரையின் கீழே உள்ள பொத்தான்களை எப்போது வேண்டுமானாலும் அழுத்துங்கள்:",
        home: "தினசரி உதவிப் பெட்டி: ஒரே தொடுதலில் அவசர அழைப்பு, தினமும் ஒரு புதிய ஹீப்ரு சொல், எளிய வழிகாட்டிகள், உங்கள் மொழியில் விளக்கப்பட்ட சம்பளச் சீட்டு, ஊருக்குப் பணம் அனுப்ப நாணய மாற்றி.",
        translator: "தட்டச்சு செய்யுங்கள், பேசுங்கள் அல்லது ஒரு கடிதம் அல்லது மருந்துப் பெட்டியைப் படம் எடுங்கள் – சில நொடிகளில் உங்கள் மொழியில் கிடைக்கும், சத்தமாகச் சொல்ல ஹீப்ரு உச்சரிப்புடன்.",
        assistant: "வேலையில் உங்கள் உரிமைகள் பற்றி எதையும் கேளுங்கள் – உங்களுக்காகவே உருவான ஒரு அரட்டையில். உங்கள் ஒப்பந்தத்தைப் பதிவேற்றி, நம்பகமான இஸ்ரேலிய ஆதாரங்களின் அடிப்படையில் தெளிவான சுருக்கமும் பரிந்துரைகளும் பெறுங்கள்.",
        community: "உங்கள் நகரப் பராமரிப்பாளர்களைச் சந்தியுங்கள், புனிதத் தலங்களுக்கு ஒன்றாகப் பயணம் திட்டமிடுங்கள், அருகிலுள்ள கிளினிக்குகள், டாக்ஸி, வங்கிகள், வழிபாட்டுத் தலங்களைக் கண்டறியுங்கள்.",
        tasks: "உங்கள் நாளை எளிதாகத் திட்டமிடுங்கள்: நேரத்துடன் பணிகளைச் சேர்க்கவும், நீங்கள் தேர்ந்தெடுக்கும் நாட்களில் மீண்டும் வரச் செய்யவும், முடிந்ததும் டிக் செய்யவும், செய்த அனைத்தையும் பார்க்கவும்.",
        journal: "உங்கள் தனிப்பட்ட மூலை: கடினமான நாளைச் சுமை புத்தகத்தில் இறக்கி வையுங்கள், மகிழ்ச்சியான தருணங்களை நன்றி புத்தகத்தில் சேமியுங்கள் – பாதுகாப்பாக, உங்களுக்கு மட்டும்.",
        gotIt: "தொடங்குவோம்!",
        more: "மேலும் ▾",
        less: "குறைவாக ▴",
    },
};

// Deeper explanations: a few tips for each page, opened with "More" in the guide.
export type GuidePage = "home" | "translator" | "assistant" | "community" | "tasks" | "journal";
export const GUIDE_DETAILS: Record<LangCode, Record<GuidePage, string[]>> = {
    en: {
        home: [
            "Tap 101, 100 or 102 at the top to call an ambulance, the police or firefighters at once.",
            "A new Hebrew word every day, with its meaning.",
            "My Agency: your agency's phone and the emergency numbers in one place.",
            "Payments: upload a payslip (photo, PDF or Excel) and see every line explained in your language.",
            "Guides for your first weeks, safety & shelters, migration, transport and sending money home – with today's exchange rates.",
        ],
        translator: [
            "Type, speak 🎤 or take a photo 📷 of a letter, a sign or a pill box.",
            "Hebrew comes with how to say it, written in your alphabet.",
            "If a word can mean two things, the app shows the other meaning too.",
            "Your recent translations are kept, so you can find them again.",
        ],
        assistant: [
            "Ask in your own words and your own language – e.g. “How many vacation days do I get?”.",
            "Upload your contract (PDF, Word or photos) to get a summary and answers about your own contract.",
            "Answers show the trusted sources they come from.",
            "Copy or share an answer, for example on WhatsApp.",
            "It's information, not legal advice: for your own case, talk to Kav LaOved or a lawyer.",
        ],
        community: [
            "Choose your city in “Where are you now?” to see what's around you on the map.",
            "Join the caregivers list to meet caregivers in your city – others see only your name and city.",
            "Under “Find:”, search or pick a category: clinics, taxis, ATMs & banks, religious places or social networks.",
            "Tap “I want to go” on a holy place to find others who want to go too, and invite them.",
        ],
        tasks: [
            "Tap “+ Add task”, write what to do and pick a time from the list.",
            "Use Repeat for a task every day, or on the days you choose.",
            "Tick a task when it's done – you'll find it under Completed tasks.",
            "Turn on reminders in Settings (menu ☰) to get a notification at the task's time, in the phone app.",
        ],
        journal: [
            "Choose the Burden Book to let out what's heavy, or the Gratitude Book for good moments.",
            "Pick how you feel, write and save – you can edit or delete an entry later.",
            "“All entries” shows both books together, newest first.",
            "Your journal is private and stored encrypted.",
        ],
    },
    tl: {
        home: [
            "Pindutin ang 101, 100 o 102 sa itaas para tumawag agad sa ambulansya, pulis o bumbero.",
            "Bagong salitang Hebrew araw-araw, kasama ang kahulugan nito.",
            "Aking Ahensya: ang phone ng agency mo at ang mga emergency number sa iisang lugar.",
            "Sahod at Bayad: i-upload ang payslip (litrato, PDF o Excel) at makita ang paliwanag ng bawat linya sa sarili mong wika.",
            "Mga gabay para sa unang mga linggo, kaligtasan at shelter, migration, transportasyon at pagpapadala ng pera – kasama ang exchange rate ngayon.",
        ],
        translator: [
            "Mag-type, magsalita 🎤 o kunan ng litrato 📷 ang sulat, karatula o kahon ng gamot.",
            "May kasamang bigkas ang Hebrew, nakasulat sa sarili mong alpabeto.",
            "Kung may dalawang kahulugan ang isang salita, ipapakita rin ng app ang isa pang kahulugan.",
            "Naitatago ang mga huling salin mo, kaya mahahanap mo ulit ang mga ito.",
        ],
        assistant: [
            "Magtanong sa sarili mong salita at wika – hal. “Ilang araw ng bakasyon ang meron ako?”.",
            "I-upload ang kontrata mo (PDF, Word o mga litrato) para makakuha ng buod at sagot tungkol sa sarili mong kontrata.",
            "Ipinapakita ng mga sagot ang mapagkakatiwalaang source na pinagmulan nila.",
            "Kopyahin o ibahagi ang sagot, halimbawa sa WhatsApp.",
            "Impormasyon ito, hindi legal na payo: para sa sarili mong kaso, kumausap sa Kav LaOved o sa abogado.",
        ],
        community: [
            "Piliin ang lungsod mo sa “Nasaan ka ngayon?” para makita sa mapa ang nasa paligid mo.",
            "Sumali sa listahan ng caregivers para makilala ang mga caregiver sa lungsod mo – pangalan at lungsod mo lang ang nakikita ng iba.",
            "Sa “Hanapin:”, maghanap o pumili ng kategorya: klinika, taxi, ATM at bangko, relihiyosong lugar o social network.",
            "Pindutin ang “Gusto kong pumunta” sa isang banal na lugar para mahanap ang iba na gusto ring pumunta, at imbitahan sila.",
        ],
        tasks: [
            "Pindutin ang “+ Magdagdag ng gawain”, isulat ang gagawin at pumili ng oras sa listahan.",
            "Gamitin ang Ulitin para sa gawaing araw-araw, o sa mga araw na pipiliin mo.",
            "Lagyan ng tsek ang gawain kapag tapos na – makikita mo ito sa Mga natapos na gawain.",
            "I-on ang mga paalala sa Mga Setting (menu ☰) para makatanggap ng notification sa oras ng gawain, sa phone app.",
        ],
        journal: [
            "Piliin ang Burden Book para ilabas ang mabigat sa loob, o ang Gratitude Book para sa masasayang sandali.",
            "Piliin ang nararamdaman mo, sumulat at i-save – puwede mong i-edit o burahin ang entry mamaya.",
            "Ipinapakita ng “Lahat ng entry” ang dalawang book nang magkasama, pinakabago muna.",
            "Pribado ang talaarawan mo at naka-encrypt itong nakatago.",
        ],
    },
    ml: {
        home: [
            "ആംബുലൻസ്, പോലീസ്, അഗ്നിശമന സേന എന്നിവയെ ഉടൻ വിളിക്കാൻ മുകളിലുള്ള 101, 100, 102 അമർത്തുക.",
            "ദിവസവും ഒരു പുതിയ ഹീബ്രു വാക്ക്, അതിന്റെ അർത്ഥത്തോടൊപ്പം.",
            "എന്റെ ഏജൻസി: നിങ്ങളുടെ ഏജൻസിയുടെ ഫോണും അടിയന്തര നമ്പറുകളും ഒരിടത്ത്.",
            "പേയ്‌മെന്റുകൾ: ശമ്പള സ്ലിപ്പ് (ഫോട്ടോ, PDF അല്ലെങ്കിൽ Excel) അപ്‌ലോഡ് ചെയ്യൂ, ഓരോ വരിയുടെയും വിശദീകരണം നിങ്ങളുടെ ഭാഷയിൽ കാണാം.",
            "ആദ്യ ആഴ്ചകൾ, സുരക്ഷയും ഷെൽട്ടറുകളും, മൈഗ്രേഷൻ, യാത്ര, നാട്ടിലേക്ക് പണം അയയ്ക്കൽ എന്നിവയ്ക്കുള്ള ഗൈഡുകൾ – ഇന്നത്തെ വിനിമയ നിരക്കോടൊപ്പം.",
        ],
        translator: [
            "ഒരു കത്തോ ബോർഡോ മരുന്നുപെട്ടിയോ ടൈപ്പ് ചെയ്യുക, സംസാരിക്കുക 🎤 അല്ലെങ്കിൽ ഫോട്ടോ എടുക്കുക 📷.",
            "ഹീബ്രു എങ്ങനെ പറയണമെന്ന് നിങ്ങളുടെ ലിപിയിൽ എഴുതി കാണിക്കും.",
            "ഒരു വാക്കിന് രണ്ട് അർത്ഥമുണ്ടെങ്കിൽ, ആപ്പ് മറ്റേ അർത്ഥവും കാണിക്കും.",
            "നിങ്ങളുടെ സമീപകാല വിവർത്തനങ്ങൾ സൂക്ഷിക്കുന്നതിനാൽ അവ വീണ്ടും കണ്ടെത്താം.",
        ],
        assistant: [
            "നിങ്ങളുടെ സ്വന്തം വാക്കുകളിലും ഭാഷയിലും ചോദിക്കുക – ഉദാ. “എനിക്ക് ഒരു വർഷം എത്ര ദിവസം ലീവ് കിട്ടും?”.",
            "നിങ്ങളുടെ കരാർ (PDF, Word അല്ലെങ്കിൽ ഫോട്ടോകൾ) അപ്‌ലോഡ് ചെയ്യൂ, അതിന്റെ ചുരുക്കവും നിങ്ങളുടെ കരാറിനെക്കുറിച്ചുള്ള ഉത്തരങ്ങളും നേടൂ.",
            "ഉത്തരങ്ങൾ എവിടെ നിന്നാണെന്ന് വിശ്വസനീയമായ ഉറവിടങ്ങൾ കാണിക്കുന്നു.",
            "ഒരു ഉത്തരം കോപ്പി ചെയ്യുകയോ പങ്കിടുകയോ ചെയ്യാം, ഉദാഹരണത്തിന് WhatsApp-ൽ.",
            "ഇത് വിവരമാണ്, നിയമോപദേശമല്ല: നിങ്ങളുടെ സ്വന്തം കേസിന് Kav LaOved-നോടോ ഒരു അഭിഭാഷകനോടോ സംസാരിക്കുക.",
        ],
        community: [
            "ചുറ്റുമുള്ളത് മാപ്പിൽ കാണാൻ “നിങ്ങൾ ഇപ്പോൾ എവിടെയാണ്?” എന്നതിൽ നിങ്ങളുടെ നഗരം തിരഞ്ഞെടുക്കുക.",
            "നിങ്ങളുടെ നഗരത്തിലെ കെയർഗിവർമാരെ പരിചയപ്പെടാൻ ലിസ്റ്റിൽ ചേരുക – മറ്റുള്ളവർ നിങ്ങളുടെ പേരും നഗരവും മാത്രമേ കാണൂ.",
            "“കണ്ടെത്തുക:” എന്നതിൽ തിരയുക അല്ലെങ്കിൽ ഒരു വിഭാഗം തിരഞ്ഞെടുക്കുക: ക്ലിനിക്കുകൾ, ടാക്സികൾ, എടിഎം / ബാങ്ക്, മതപരമായ സ്ഥലങ്ങൾ അല്ലെങ്കിൽ സോഷ്യൽ നെറ്റ്‌വർക്കുകൾ.",
            "ഒരു പുണ്യസ്ഥലത്ത് “എനിക്ക് പോകണം” അമർത്തി, പോകാൻ ആഗ്രഹിക്കുന്ന മറ്റുള്ളവരെ കണ്ടെത്തി ക്ഷണിക്കുക.",
        ],
        tasks: [
            "“+ ടാസ്ക് ചേർക്കുക” അമർത്തി, ചെയ്യേണ്ടത് എഴുതി, ലിസ്റ്റിൽ നിന്ന് സമയം തിരഞ്ഞെടുക്കുക.",
            "എല്ലാ ദിവസവും അല്ലെങ്കിൽ നിങ്ങൾ തിരഞ്ഞെടുക്കുന്ന ദിവസങ്ങളിൽ വരുന്ന ടാസ്ക്കിന് ആവർത്തനം ഉപയോഗിക്കുക.",
            "ചെയ്തു കഴിഞ്ഞാൽ ടാസ്ക് ടിക്ക് ചെയ്യുക – അത് പൂർത്തിയായ ടാസ്ക്കുകളിൽ കാണാം.",
            "ടാസ്ക്കിന്റെ സമയത്ത് നോട്ടിഫിക്കേഷൻ ലഭിക്കാൻ ക്രമീകരണങ്ങളിൽ (മെനു ☰) ഓർമ്മപ്പെടുത്തലുകൾ ഓണാക്കുക – ഫോൺ ആപ്പിൽ.",
        ],
        journal: [
            "ഭാരമുള്ളത് ഇറക്കിവെക്കാൻ ഭാര പുസ്തകം, സന്തോഷ നിമിഷങ്ങൾക്ക് നന്ദി പുസ്തകം തിരഞ്ഞെടുക്കുക.",
            "നിങ്ങളുടെ മനോഭാവം തിരഞ്ഞെടുത്ത്, എഴുതി, സേവ് ചെയ്യുക – പിന്നീട് തിരുത്തുകയോ ഇല്ലാതാക്കുകയോ ചെയ്യാം.",
            "“എല്ലാ എൻട്രികളും” രണ്ട് പുസ്തകങ്ങളും ഒരുമിച്ച്, പുതിയത് ആദ്യം കാണിക്കുന്നു.",
            "നിങ്ങളുടെ ജേർണൽ സ്വകാര്യമാണ്, എൻക്രിപ്റ്റ് ചെയ്ത് സൂക്ഷിക്കുന്നു.",
        ],
    },
    ru: {
        home: [
            "Нажмите 101, 100 или 102 вверху, чтобы сразу вызвать скорую, полицию или пожарных.",
            "Каждый день – новое слово на иврите с переводом.",
            "Моё агентство: телефон вашего агентства и экстренные номера в одном месте.",
            "Оплата: загрузите расчётный лист (фото, PDF или Excel) – каждая строка будет объяснена на вашем языке.",
            "Справки о первых неделях, безопасности и убежищах, миграции, транспорте и переводах денег домой – с сегодняшним курсом валют.",
        ],
        translator: [
            "Напишите, скажите 🎤 или сфотографируйте 📷 письмо, табличку или упаковку лекарства.",
            "К ивриту добавляется произношение, написанное вашими буквами.",
            "Если у слова два значения, приложение покажет и второе.",
            "Последние переводы сохраняются, их можно найти снова.",
        ],
        assistant: [
            "Спрашивайте своими словами и на своём языке – например: «Сколько дней отпуска мне положено?».",
            "Загрузите договор (PDF, Word или фото), чтобы получить краткое изложение и ответы именно о вашем договоре.",
            "В ответах указаны надёжные источники, на которых они основаны.",
            "Ответ можно скопировать или отправить, например в WhatsApp.",
            "Это информация, а не юридическая консультация: по своему делу обратитесь в Кав ЛаОвед или к юристу.",
        ],
        community: [
            "Выберите город в «Где вы сейчас?», чтобы увидеть на карте, что рядом.",
            "Вступите в список сиделок, чтобы познакомиться с сиделками в своём городе, – другие видят только имя и город.",
            "В разделе «Найти:» ищите или выберите категорию: клиники, такси, банкоматы и банки, религиозные места или соцсети.",
            "Нажмите «Хочу поехать» у святого места, чтобы найти тех, кто тоже хочет поехать, и пригласить их.",
        ],
        tasks: [
            "Нажмите «+ Добавить задачу», напишите, что сделать, и выберите время из списка.",
            "«Повтор» – для задачи каждый день или в выбранные дни.",
            "Отметьте задачу, когда она сделана, – она появится в «Выполненных задачах».",
            "Включите напоминания в Настройках (меню ☰), чтобы получать уведомление во время задачи, – в приложении на телефоне.",
        ],
        journal: [
            "Выберите «Книгу тягот», чтобы выплеснуть тяжёлое, или «Книгу благодарности» для хороших моментов.",
            "Выберите настроение, напишите и сохраните – запись можно потом изменить или удалить.",
            "«Все записи» показывает обе книги вместе, новые сверху.",
            "Ваш дневник личный и хранится в зашифрованном виде.",
        ],
    },
    hi: {
        home: [
            "एम्बुलेंस, पुलिस या दमकल को तुरंत बुलाने के लिए ऊपर 101, 100 या 102 दबाएँ।",
            "हर दिन हिब्रू का एक नया शब्द, उसके मतलब के साथ।",
            "मेरी एजेंसी: आपकी एजेंसी का फ़ोन और इमरजेंसी नंबर एक जगह।",
            "भुगतान: वेतन पर्ची (फ़ोटो, PDF या Excel) अपलोड करें और हर लाइन का मतलब अपनी भाषा में देखें।",
            "पहले हफ़्तों, सुरक्षा और शेल्टर, माइग्रेशन, यातायात और घर पैसे भेजने की गाइड – आज के एक्सचेंज रेट के साथ।",
        ],
        translator: [
            "किसी चिट्ठी, बोर्ड या दवा के डिब्बे को लिखें, बोलें 🎤 या उसकी फ़ोटो लें 📷।",
            "हिब्रू के साथ उसे बोलने का तरीका आपकी लिपि में लिखा आता है।",
            "अगर किसी शब्द के दो मतलब हों, तो ऐप दूसरा मतलब भी दिखाता है।",
            "आपके हाल के अनुवाद सहेजे जाते हैं, ताकि आप उन्हें फिर से देख सकें।",
        ],
        assistant: [
            "अपने शब्दों और अपनी भाषा में पूछें – जैसे “मुझे हर साल कितने दिन की छुट्टी मिलती है?”।",
            "अपना अनुबंध (PDF, Word या फ़ोटो) अपलोड करें और उसका सार और अपने अनुबंध के बारे में जवाब पाएँ।",
            "जवाबों में वे भरोसेमंद स्रोत दिखते हैं जिनसे वे आए हैं।",
            "जवाब को कॉपी या शेयर करें, जैसे WhatsApp पर।",
            "यह जानकारी है, कानूनी सलाह नहीं: अपने मामले के लिए Kav LaOved या किसी वकील से बात करें।",
        ],
        community: [
            "मैप पर अपने आस-पास देखने के लिए “आप अभी कहाँ हैं?” में अपना शहर चुनें।",
            "अपने शहर के केयरगिवर से मिलने के लिए सूची में शामिल हों – दूसरों को सिर्फ़ आपका नाम और शहर दिखता है।",
            "“खोजें:” में खोजें या कोई श्रेणी चुनें: क्लिनिक, टैक्सी, ATM और बैंक, धार्मिक स्थल या सोशल नेटवर्क।",
            "किसी पवित्र स्थान पर “मैं जाना चाहती/चाहता हूँ” दबाएँ, ताकि जाने वाले दूसरे लोग मिलें और आप उन्हें बुला सकें।",
        ],
        tasks: [
            "“+ नया काम जोड़ें” दबाएँ, काम लिखें और सूची से समय चुनें।",
            "हर दिन या चुने हुए दिनों पर होने वाले काम के लिए दोहराएँ इस्तेमाल करें।",
            "काम हो जाने पर टिक करें – वह पूरे हुए काम में मिलेगा।",
            "काम के समय नोटिफ़िकेशन पाने के लिए सेटिंग्स (मेनू ☰) में याद दिलाना चालू करें – फ़ोन ऐप में।",
        ],
        journal: [
            "भारी बातें निकालने के लिए बोझ की किताब, या खुशी के पलों के लिए आभार की किताब चुनें।",
            "अपना मूड चुनें, लिखें और सहेजें – बाद में बदल या मिटा सकते हैं।",
            "“सारी बातें” दोनों किताबें साथ दिखाता है, सबसे नई पहले।",
            "आपकी डायरी निजी है और एन्क्रिप्ट करके रखी जाती है।",
        ],
    },
    ta: {
        home: [
            "ஆம்புலன்ஸ், காவல்துறை அல்லது தீயணைப்பை உடனே அழைக்க மேலே உள்ள 101, 100 அல்லது 102-ஐ அழுத்துங்கள்.",
            "தினமும் ஒரு புதிய ஹீப்ரு சொல், அதன் பொருளுடன்.",
            "என் ஏஜென்சி: உங்கள் ஏஜென்சியின் தொலைபேசியும் அவசர எண்களும் ஒரே இடத்தில்.",
            "கட்டணங்கள்: சம்பளச் சீட்டை (படம், PDF அல்லது Excel) பதிவேற்றி, ஒவ்வொரு வரியின் விளக்கத்தையும் உங்கள் மொழியில் பாருங்கள்.",
            "முதல் வாரங்கள், பாதுகாப்பு மற்றும் தங்குமிடங்கள், குடியேற்றம், போக்குவரத்து, ஊருக்குப் பணம் அனுப்புதல் பற்றிய வழிகாட்டிகள் – இன்றைய நாணய மாற்று விகிதத்துடன்.",
        ],
        translator: [
            "கடிதம், பலகை அல்லது மருந்துப் பெட்டியைத் தட்டச்சு செய்யுங்கள், பேசுங்கள் 🎤 அல்லது படம் எடுங்கள் 📷.",
            "ஹீப்ருவுடன் அதை எப்படிச் சொல்வது என்பது உங்கள் எழுத்தில் வரும்.",
            "ஒரு சொல்லுக்கு இரண்டு பொருள் இருந்தால், ஆப் மற்றப் பொருளையும் காட்டும்.",
            "உங்கள் சமீபத்திய மொழிபெயர்ப்புகள் சேமிக்கப்படுவதால் அவற்றை மீண்டும் காணலாம்.",
        ],
        assistant: [
            "உங்கள் சொந்த வார்த்தைகளிலும் மொழியிலும் கேளுங்கள் – எ.கா. “எனக்கு வருடத்திற்கு எத்தனை நாள் விடுப்பு கிடைக்கும்?”.",
            "உங்கள் ஒப்பந்தத்தை (PDF, Word அல்லது படங்கள்) பதிவேற்றி, அதன் சுருக்கத்தையும் உங்கள் ஒப்பந்தம் பற்றிய பதில்களையும் பெறுங்கள்.",
            "பதில்கள் அவை வந்த நம்பகமான ஆதாரங்களைக் காட்டும்.",
            "ஒரு பதிலை நகலெடுக்கலாம் அல்லது பகிரலாம், எடுத்துக்காட்டாக WhatsApp-இல்.",
            "இது தகவல், சட்ட ஆலோசனை அல்ல: உங்கள் சொந்த விஷயத்திற்கு Kav LaOved அல்லது வழக்கறிஞரிடம் பேசுங்கள்.",
        ],
        community: [
            "சுற்றியுள்ளதை வரைபடத்தில் பார்க்க “நீங்கள் இப்போது எங்கே இருக்கிறீர்கள்?” என்பதில் உங்கள் நகரத்தைத் தேர்ந்தெடுங்கள்.",
            "உங்கள் நகரப் பராமரிப்பாளர்களைச் சந்திக்கப் பட்டியலில் சேருங்கள் – மற்றவர்கள் உங்கள் பெயரையும் நகரத்தையும் மட்டுமே பார்ப்பார்கள்.",
            "“கண்டறி:” என்பதில் தேடுங்கள் அல்லது ஒரு வகையைத் தேர்ந்தெடுங்கள்: கிளினிக்குகள், டாக்ஸி, ATM & வங்கிகள், வழிபாட்டுத் தலங்கள் அல்லது சமூக வலைதளங்கள்.",
            "ஒரு புனிதத் தலத்தில் “நான் போக விரும்புகிறேன்” என்பதை அழுத்தி, போக விரும்பும் மற்றவர்களைக் கண்டறிந்து அழையுங்கள்.",
        ],
        tasks: [
            "“+ புதிய பணி சேர்” என்பதை அழுத்தி, செய்ய வேண்டியதை எழுதி, பட்டியலிலிருந்து நேரத்தைத் தேர்ந்தெடுங்கள்.",
            "தினமும் அல்லது நீங்கள் தேர்ந்தெடுக்கும் நாட்களில் வரும் பணிக்கு “மீண்டும் செய்” என்பதைப் பயன்படுத்துங்கள்.",
            "பணி முடிந்ததும் டிக் செய்யுங்கள் – அது முடிந்த பணிகளில் இருக்கும்.",
            "பணியின் நேரத்தில் அறிவிப்பு பெற அமைப்புகளில் (மெனு ☰) நினைவூட்டல்களை இயக்குங்கள் – தொலைபேசி ஆப்பில்.",
        ],
        journal: [
            "மனச்சுமையை இறக்கி வைக்கச் சுமை புத்தகத்தையும், மகிழ்ச்சியான தருணங்களுக்கு நன்றி புத்தகத்தையும் தேர்ந்தெடுங்கள்.",
            "உங்கள் மனநிலையைத் தேர்ந்தெடுத்து, எழுதி, சேமியுங்கள் – பின்னர் திருத்தலாம் அல்லது நீக்கலாம்.",
            "“எல்லாப் பதிவுகளும்” இரண்டு புத்தகங்களையும் ஒன்றாக, புதியது முதலில் காட்டும்.",
            "உங்கள் நாட்குறிப்பு தனிப்பட்டது, மறையாக்கம் செய்து சேமிக்கப்படுகிறது.",
        ],
    },
};
