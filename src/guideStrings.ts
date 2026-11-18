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
    },
};
