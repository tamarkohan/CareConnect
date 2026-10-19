// ── infoPages.ts ─────────────────────────────────────────────────────
// Content of the information pages opened from the home screen, in every app
// language. Each page is a list of sections; a section can have text, bullet
// points, phone numbers (tap to call) and links. Edit freely: the screens
// render whatever is here. Tagalog, Malayalam and Russian should be checked by
// native speakers. Phone numbers and links were checked in October 2026.
import { LangCode } from "./translations";
import { more, moreList } from "./i18n/moreLanguages";

export type Txt = Record<LangCode, string>;
export type InfoLink = { label: Txt; url: string };
export type InfoPhone = { label: Txt; number: string };
export type InfoSection = {
    title: Txt;
    body?: Txt;
    bullets?: Record<LangCode, string[]>;
    phones?: InfoPhone[];
    links?: InfoLink[];
    quote?: { text: Txt; by: Txt };
};
export type InfoPage = { title: Txt; icon: string; intro?: Txt; sections: InfoSection[] };

// Hindi and Tamil come from the dictionaries in src/i18n (looked up by the English text).
const t = (en: string, tl: string, ml: string, ru: string): Txt => ({ en, tl, ml, ru, ...more(en) });
const list = (en: string[], tl: string[], ml: string[], ru: string[]) => ({ en, tl, ml, ru, ...moreList(en) });

/** App-store search, so the link always finds the current app. */
const playSearch = (q: string) => `https://play.google.com/store/search?q=${encodeURIComponent(q)}&c=apps`;
const youtube = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

// ── Shared pieces ───────────────────────────────────────────────────

export const EMERGENCY_SECTION: InfoSection = {
    title: t("Emergency numbers in Israel", "Mga emergency number sa Israel", "ഇസ്രായേലിലെ അടിയന്തര നമ്പറുകൾ", "Экстренные номера в Израиле"),
    body: t(
        "Calls are free, from any phone. Israel has no single number like 911: call the service you need.",
        "Libre ang tawag, kahit anong phone. Walang iisang number gaya ng 911: tawagan ang serbisyong kailangan mo.",
        "ഏത് ഫോണിൽ നിന്നും വിളി സൗജന്യമാണ്. 911 പോലെ ഒരൊറ്റ നമ്പർ ഇല്ല: ആവശ്യമുള്ള സേവനത്തെ വിളിക്കുക.",
        "Звонки бесплатные, с любого телефона. Единого номера, как 911, нет: звоните в нужную службу."
    ),
    phones: [
        { number: "100", label: t("Police", "Pulis", "പോലീസ്", "Полиция") },
        { number: "101", label: t("Ambulance – Magen David Adom", "Ambulansya – Magen David Adom", "ആംബുലൻസ് – മാഗൻ ഡേവിഡ് അഡോം", "Скорая помощь – Маген Давид Адом") },
        { number: "102", label: t("Fire and rescue", "Bumbero at rescue", "അഗ്നിശമന സേന", "Пожарная служба") },
        { number: "103", label: t("Electricity company (power cut)", "Kuryente (brownout)", "വൈദ്യുതി കമ്പനി (വൈദ്യുതി മുടക്കം)", "Электрокомпания (нет света)") },
        { number: "104", label: t("Home Front Command (rockets, war)", "Home Front Command (rocket, giyera)", "ഹോം ഫ്രണ്ട് കമാൻഡ് (റോക്കറ്റ്, യുദ്ധം)", "Служба тыла (ракеты, война)") },
        { number: "106", label: t("Municipality hotline", "Hotline ng munisipyo", "നഗരസഭ ഹോട്ട്‌ലൈൻ", "Горячая линия муниципалитета") },
        { number: "1201", label: t("ERAN – emotional support, 24 hours", "ERAN – emotional support, 24 oras", "ERAN – മാനസിക പിന്തുണ, 24 മണിക്കൂർ", "ЭРАН – психологическая помощь, круглосуточно") },
        { number: "03-6883766", label: t("Kav LaOved – workers' rights (Tel Aviv)", "Kav LaOved – karapatan ng manggagawa (Tel Aviv)", "കാവ് ലഓവേദ് – തൊഴിലാളി അവകാശങ്ങൾ (ടെൽ അവീവ്)", "Кав ЛаОвед – права работников (Тель-Авив)") },
    ],
};

const COMING_SOON: InfoSection = {
    title: t("More coming soon", "Marami pang darating", "കൂടുതൽ ഉടൻ വരുന്നു", "Скоро будет больше"),
    body: t(
        "We are preparing more information for this page. Have a question now? Ask the Legal assistant.",
        "Naghahanda pa kami ng mas maraming impormasyon. May tanong ka na ngayon? Magtanong sa Legal assistant.",
        "ഈ പേജിനായി കൂടുതൽ വിവരങ്ങൾ തയ്യാറാക്കുന്നു. ഇപ്പോൾ ചോദ്യമുണ്ടോ? ലീഗൽ അസിസ്റ്റന്റിനോട് ചോദിക്കൂ.",
        "Мы готовим больше информации для этой страницы. Есть вопрос сейчас? Спросите юридического помощника."
    ),
};

// ── Pages ───────────────────────────────────────────────────────────

export const INFO_PAGES = {
    agency: {
        icon: "📞",
        title: t("My agency & emergency numbers", "Aking ahensya at emergency numbers", "എന്റെ ഏജൻസിയും അടിയന്തര നമ്പറുകളും", "Моё агентство и экстренные номера"),
        sections: [
            EMERGENCY_SECTION,
            {
                title: t("Before you call", "Bago tumawag", "വിളിക്കുന്നതിന് മുമ്പ്", "Перед звонком"),
                bullets: list(
                    ["Say the full address: city, street, house number, floor and apartment.", "Say the person's age and what happened.", "If you don't speak Hebrew, say \"English please\" – most services have English speakers.", "Then call the family and your agency."],
                    ["Sabihin ang buong address: city, street, house number, floor at apartment.", "Sabihin ang edad ng pasyente at kung ano ang nangyari.", "Kung hindi ka marunong mag-Hebrew, sabihin \"English please\" – karamihan ay may nagsasalita ng English.", "Pagkatapos, tawagan ang pamilya at ang iyong ahensya."],
                    ["പൂർണ്ണ വിലാസം പറയുക: നഗരം, തെരുവ്, വീട്ടുനമ്പർ, നില, അപ്പാർട്ട്മെന്റ്.", "വ്യക്തിയുടെ പ്രായവും എന്ത് സംഭവിച്ചു എന്നും പറയുക.", "ഹീബ്രു അറിയില്ലെങ്കിൽ \"English please\" എന്ന് പറയുക – മിക്ക സേവനങ്ങളിലും ഇംഗ്ലീഷ് സംസാരിക്കുന്നവരുണ്ട്.", "പിന്നെ കുടുംബത്തെയും ഏജൻസിയെയും വിളിക്കുക."],
                    ["Назовите полный адрес: город, улица, номер дома, этаж и квартира.", "Скажите возраст человека и что случилось.", "Если вы не говорите на иврите, скажите «English please» или «по-русски» – часто есть операторы.", "Потом позвоните семье и в агентство."]
                ),
            },
        ],
    },

    arrival: {
        icon: "✈️",
        title: t("Arrival guides", "Gabay sa pagdating", "വരവ് ഗൈഡുകൾ", "Гиды по прибытию"),
        intro: t("Your first weeks in Israel.", "Ang mga unang linggo mo sa Israel.", "ഇസ്രായേലിലെ നിങ്ങളുടെ ആദ്യ ആഴ്ചകൾ.", "Ваши первые недели в Израиле."),
        sections: [
            {
                title: t("First steps", "Mga unang hakbang", "ആദ്യ ചുവടുകൾ", "Первые шаги"),
                bullets: list(
                    ["Keep your passport and visa with you – nobody may take them from you.", "Get a copy of your work contract in a language you understand.", "Save the emergency numbers and your agency's number in your phone.", "Download the Home Front Command app (see Safety & shelters)."],
                    ["Hawakan mo ang passport at visa mo – walang may karapatang kunin ito.", "Humingi ng kopya ng work contract sa wikang naiintindihan mo.", "I-save sa phone ang emergency numbers at number ng ahensya mo.", "I-download ang Home Front Command app (tingnan ang Kaligtasan at Tirahan)."],
                    ["പാസ്‌പോർട്ടും വിസയും നിങ്ങളുടെ കൈയിൽ സൂക്ഷിക്കുക – ആർക്കും അത് എടുക്കാൻ അവകാശമില്ല.", "നിങ്ങൾക്ക് മനസ്സിലാകുന്ന ഭാഷയിൽ തൊഴിൽ കരാറിന്റെ പകർപ്പ് വാങ്ങുക.", "അടിയന്തര നമ്പറുകളും ഏജൻസിയുടെ നമ്പറും ഫോണിൽ സേവ് ചെയ്യുക.", "ഹോം ഫ്രണ്ട് കമാൻഡ് ആപ്പ് ഡൗൺലോഡ് ചെയ്യുക (സുരക്ഷയും അഭയവും കാണുക)."],
                    ["Держите паспорт и визу при себе – никто не имеет права их забирать.", "Получите копию трудового договора на понятном вам языке.", "Сохраните в телефоне экстренные номера и номер агентства.", "Скачайте приложение Службы тыла (см. «Безопасность и убежища»)."]
                ),
            },
            COMING_SOON,
        ],
    },

    safety: {
        icon: "⚠️",
        title: t("Safety & shelters", "Kaligtasan at tirahan", "സുരക്ഷയും അഭയവും", "Безопасность и убежища"),
        intro: t(
            "What to do when there is a rocket alert, and which apps warn you.",
            "Ano ang gagawin kapag may rocket alert, at aling apps ang nagbababala sa iyo.",
            "റോക്കറ്റ് മുന്നറിയിപ്പ് വരുമ്പോൾ എന്ത് ചെയ്യണം, ഏത് ആപ്പുകൾ മുന്നറിയിപ്പ് നൽകുന്നു.",
            "Что делать при ракетной тревоге и какие приложения предупреждают."
        ),
        sections: [
            {
                title: t("When you hear an alert", "Kapag may narinig kang alert", "മുന്നറിയിപ്പ് കേൾക്കുമ്പോൾ", "Когда звучит тревога"),
                bullets: list(
                    ["Go at once to the protected room (mamad), a stairwell or the nearest public shelter.", "Help the person you care for – plan with the family now how to move them quickly.", "Stay inside until the Home Front Command says you can leave.", "If you are outside and there is no shelter: lie on the ground and cover your head."],
                    ["Pumunta agad sa protected room (mamad), sa hagdanan o sa pinakamalapit na public shelter.", "Tulungan ang inaalagaan mo – planuhin na ngayon kasama ang pamilya kung paano siya mabilis na ililipat.", "Manatili sa loob hanggang sabihin ng Home Front Command na puwede nang lumabas.", "Kung nasa labas ka at walang shelter: dumapa sa lupa at takpan ang ulo."],
                    ["ഉടൻ സുരക്ഷാ മുറിയിലേക്ക് (മമാദ്), കോണിപ്പടിയിലേക്ക് അല്ലെങ്കിൽ അടുത്തുള്ള പൊതു ഷെൽട്ടറിലേക്ക് പോകുക.", "നിങ്ങൾ പരിചരിക്കുന്ന വ്യക്തിയെ സഹായിക്കുക – അവരെ വേഗം എങ്ങനെ മാറ്റാമെന്ന് കുടുംബവുമായി ഇപ്പോൾ തന്നെ ആസൂത്രണം ചെയ്യുക.", "ഹോം ഫ്രണ്ട് കമാൻഡ് പറയുന്നതുവരെ അകത്ത് തുടരുക.", "പുറത്താണെങ്കിൽ ഷെൽട്ടർ ഇല്ലെങ്കിൽ: നിലത്ത് കിടന്ന് തല മൂടുക."],
                    ["Сразу идите в защищённую комнату (мамад), на лестничную клетку или в ближайшее общественное убежище.", "Помогите подопечному – заранее договоритесь с семьёй, как быстро его перевести.", "Оставайтесь внутри, пока Служба тыла не разрешит выйти.", "Если вы на улице и убежища нет: лягте на землю и закройте голову руками."]
                ),
            },
            {
                title: t("Keep in the protected room", "Itago sa protected room", "സുരക്ഷാ മുറിയിൽ സൂക്ഷിക്കുക", "Держите в защищённой комнате"),
                bullets: list(
                    ["Water and some food", "The person's medicines for a few days", "A phone charger or power bank, and a flashlight", "Copies of passports and important documents"],
                    ["Tubig at kaunting pagkain", "Mga gamot ng pasyente para sa ilang araw", "Phone charger o power bank, at flashlight", "Kopya ng passport at mahahalagang dokumento"],
                    ["വെള്ളവും കുറച്ച് ഭക്ഷണവും", "കുറച്ച് ദിവസത്തേക്കുള്ള വ്യക്തിയുടെ മരുന്നുകൾ", "ഫോൺ ചാർജർ അല്ലെങ്കിൽ പവർ ബാങ്ക്, ടോർച്ച്", "പാസ്‌പോർട്ടുകളുടെയും പ്രധാന രേഖകളുടെയും പകർപ്പുകൾ"],
                    ["Вода и немного еды", "Лекарства подопечного на несколько дней", "Зарядка или пауэрбанк, фонарик", "Копии паспортов и важных документов"]
                ),
            },
            {
                title: t("Apps to download", "Mga app na dapat i-download", "ഡൗൺലോഡ് ചെയ്യേണ്ട ആപ്പുകൾ", "Какие приложения скачать"),
                bullets: list(
                    [
                        "Home Front Command (Pikud HaOref) – the official app. Alerts for where you are, and what to do. In English, Russian, Arabic and Hebrew. Download this one first.",
                        "Red Alert – free app made by volunteers. Fast alerts from the Home Front Command. Use it as an extra, not instead of the official app.",
                        "Sheltr – shows the nearest public shelter to you (over 20,000 places) and an alert map, in English. Not an official app.",
                    ],
                    [
                        "Home Front Command (Pikud HaOref) – ang opisyal na app. Alert para sa lugar mo at kung ano ang gagawin. May English, Russian, Arabic at Hebrew. Ito ang unang i-download.",
                        "Red Alert – libreng app na gawa ng mga volunteer. Mabilis na alert mula sa Home Front Command. Gamitin bilang dagdag, hindi kapalit ng opisyal na app.",
                        "Sheltr – ipinapakita ang pinakamalapit na public shelter sa iyo (mahigit 20,000 lugar) at alert map, sa English. Hindi opisyal na app.",
                    ],
                    [
                        "ഹോം ഫ്രണ്ട് കമാൻഡ് (പിക്കൂദ് ഹഓറെഫ്) – ഔദ്യോഗിക ആപ്പ്. നിങ്ങൾ ഉള്ള സ്ഥലത്തിനുള്ള മുന്നറിയിപ്പും എന്ത് ചെയ്യണമെന്നും. ഇംഗ്ലീഷ്, റഷ്യൻ, അറബിക്, ഹീബ്രു. ഇത് ആദ്യം ഡൗൺലോഡ് ചെയ്യുക.",
                        "റെഡ് അലേർട്ട് – സന്നദ്ധപ്രവർത്തകർ ഉണ്ടാക്കിയ സൗജന്യ ആപ്പ്. ഹോം ഫ്രണ്ട് കമാൻഡിൽ നിന്നുള്ള വേഗത്തിലുള്ള മുന്നറിയിപ്പുകൾ. ഔദ്യോഗിക ആപ്പിന് പകരമല്ല, അധികമായി ഉപയോഗിക്കുക.",
                        "ഷെൽട്ടർ (Sheltr) – നിങ്ങൾക്ക് ഏറ്റവും അടുത്തുള്ള പൊതു ഷെൽട്ടർ (20,000-ലധികം സ്ഥലങ്ങൾ) മുന്നറിയിപ്പ് മാപ്പും ഇംഗ്ലീഷിൽ കാണിക്കുന്നു. ഔദ്യോഗിക ആപ്പല്ല.",
                    ],
                    [
                        "Служба тыла (Пикуд ха-Ореф) – официальное приложение. Тревоги для вашего места и что делать. На русском, английском, арабском и иврите. Скачайте его первым.",
                        "Red Alert – бесплатное приложение от волонтёров. Быстрые тревоги Службы тыла. Используйте как дополнение, а не вместо официального.",
                        "Sheltr – показывает ближайшее общественное убежище (более 20 000 мест) и карту тревог, на английском. Неофициальное приложение.",
                    ]
                ),
                links: [
                    { label: t("Home Front Command app", "Home Front Command app", "ഹോം ഫ്രണ്ട് കമാൻഡ് ആപ്പ്", "Приложение Службы тыла"), url: playSearch("Home Front Command Pikud HaOref") },
                    { label: t("Red Alert app", "Red Alert app", "റെഡ് അലേർട്ട് ആപ്പ്", "Приложение Red Alert"), url: playSearch("Red Alert Israel") },
                    { label: t("Sheltr app", "Sheltr app", "ഷെൽട്ടർ ആപ്പ്", "Приложение Sheltr"), url: playSearch("Sheltr rocket alerts") },
                    { label: t("Home Front Command website", "Website ng Home Front Command", "ഹോം ഫ്രണ്ട് കമാൻഡ് വെബ്സൈറ്റ്", "Сайт Службы тыла"), url: "https://www.oref.org.il/eng" },
                ],
            },
            {
                title: t("Important numbers", "Mahahalagang number", "പ്രധാന നമ്പറുകൾ", "Важные номера"),
                phones: [
                    { number: "101", label: t("Ambulance – Magen David Adom", "Ambulansya – Magen David Adom", "ആംബുലൻസ് – മാഗൻ ഡേവിഡ് അഡോം", "Скорая помощь") },
                    { number: "104", label: t("Home Front Command", "Home Front Command", "ഹോം ഫ്രണ്ട് കമാൻഡ്", "Служба тыла") },
                    { number: "1201", label: t("ERAN – emotional support", "ERAN – emotional support", "ERAN – മാനസിക പിന്തുണ", "ЭРАН – психологическая помощь") },
                ],
            },
        ],
    },

    migration: {
        icon: "🌐",
        title: t("Visa & migration (PIBA)", "Visa at migrasyon (PIBA)", "വിസയും കുടിയേറ്റവും (PIBA)", "Виза и миграция (PIBA)"),
        intro: t(
            "PIBA is the Population and Immigration Authority: it gives your work visa and permit, and handles changing employers.",
            "Ang PIBA ay ang Population and Immigration Authority: sila ang nagbibigay ng work visa at permit, at sila ang bahala sa paglipat ng employer.",
            "PIBA എന്നത് പോപ്പുലേഷൻ ആൻഡ് ഇമിഗ്രേഷൻ അതോറിറ്റിയാണ്: വർക്ക് വിസയും പെർമിറ്റും നൽകുന്നതും തൊഴിലുടമയെ മാറ്റുന്നതും അവരാണ്.",
            "PIBA – Управление по делам населения и иммиграции: выдаёт рабочую визу и разрешение, занимается сменой работодателя."
        ),
        sections: [
            {
                title: t("Good to know", "Dapat mong malaman", "അറിഞ്ഞിരിക്കേണ്ടത്", "Полезно знать"),
                bullets: list(
                    ["Check that your visa is valid, and renew it on time.", "Your passport is yours: an employer or agency may not keep it.", "Want to change employer? Ask your agency and check the rules on the PIBA website first.", "The government foreign workers app shows your permit and sends updates in several languages."],
                    ["Siguraduhing valid ang visa mo, at i-renew ito sa tamang oras.", "Sa iyo ang passport mo: hindi ito puwedeng itago ng employer o ahensya.", "Gusto mong lumipat ng employer? Magtanong sa ahensya mo at tingnan muna ang rules sa website ng PIBA.", "Ang government app para sa foreign workers ay nagpapakita ng permit mo at nagpapadala ng updates sa iba't ibang wika."],
                    ["നിങ്ങളുടെ വിസ സാധുവാണോ എന്ന് പരിശോധിച്ച് കൃത്യസമയത്ത് പുതുക്കുക.", "പാസ്‌പോർട്ട് നിങ്ങളുടേതാണ്: തൊഴിലുടമയോ ഏജൻസിയോ അത് സൂക്ഷിക്കാൻ പാടില്ല.", "തൊഴിലുടമയെ മാറ്റണോ? ഏജൻസിയോട് ചോദിക്കുക, ആദ്യം PIBA വെബ്സൈറ്റിലെ നിയമങ്ങൾ പരിശോധിക്കുക.", "വിദേശ തൊഴിലാളികൾക്കുള്ള സർക്കാർ ആപ്പ് നിങ്ങളുടെ പെർമിറ്റ് കാണിക്കുകയും പല ഭാഷകളിൽ അപ്‌ഡേറ്റുകൾ അയക്കുകയും ചെയ്യുന്നു."],
                    ["Следите, чтобы виза была действительна, и продлевайте её вовремя.", "Паспорт принадлежит вам: работодатель или агентство не имеют права его забирать.", "Хотите сменить работодателя? Спросите агентство и сначала проверьте правила на сайте PIBA.", "Государственное приложение для иностранных работников показывает ваше разрешение и присылает новости на нескольких языках."]
                ),
                links: [
                    { label: t("Foreign workers app (gov.il)", "Foreign workers app (gov.il)", "വിദേശ തൊഴിലാളി ആപ്പ് (gov.il)", "Приложение для иностранных работников (gov.il)"), url: "https://www.gov.il/en/pages/foreing-workers-app" },
                    { label: t("Check your permit and employer online", "Tingnan online ang permit at employer mo", "പെർമിറ്റും തൊഴിലുടമയും ഓൺലൈനിൽ പരിശോധിക്കുക", "Проверить разрешение и работодателя онлайн"), url: "https://www.gov.il/en/service/foreign_workers_data_files" },
                    { label: t("Your rights – official booklet (PDF)", "Mga karapatan mo – opisyal na booklet (PDF)", "നിങ്ങളുടെ അവകാശങ്ങൾ – ഔദ്യോഗിക ബുക്ക്‌ലെറ്റ് (PDF)", "Ваши права – официальная брошюра (PDF)"), url: "https://www.gov.il/BlobFolder/policy/bileteral-forms-foreign-workers/he/foreign_workers_rights_booklets_en2026.pdf" },
                    { label: t("Kav LaOved – free help for workers", "Kav LaOved – libreng tulong sa manggagawa", "കാവ് ലഓവേദ് – തൊഴിലാളികൾക്ക് സൗജന്യ സഹായം", "Кав ЛаОвед – бесплатная помощь работникам"), url: "https://www.kavlaoved.org.il/en/" },
                ],
                phones: [
                    { number: "03-6883766", label: t("Kav LaOved (Tel Aviv)", "Kav LaOved (Tel Aviv)", "കാവ് ലഓവേദ് (ടെൽ അവീവ്)", "Кав ЛаОвед (Тель-Авив)") },
                ],
            },
            COMING_SOON,
        ],
    },

    transport: {
        icon: "🚌",
        title: t("Public transportation", "Pampublikong sasakyan", "പൊതു ഗതാഗതം", "Общественный транспорт"),
        sections: [
            {
                title: t("The basics", "Ang mga basic", "അടിസ്ഥാനങ്ങൾ", "Основное"),
                bullets: list(
                    ["Buses and trains are paid with a Rav-Kav card or a payment app – not with cash.", "Load your Rav-Kav card before you get on the bus.", "Most buses and trains don't run on Shabbat (Friday afternoon to Saturday night).", "Moovit shows bus lines, times and where to get off, in many languages.", "Google Maps also shows buses and trains: choose the bus/train icon, and it tells you which line to take, where to walk and when to get off."],
                    ["Ang bus at tren ay binabayaran gamit ang Rav-Kav card o payment app – hindi cash.", "Mag-load ng Rav-Kav card bago sumakay ng bus.", "Karamihan ng bus at tren ay walang biyahe tuwing Shabbat (Biyernes ng hapon hanggang Sabado ng gabi).", "Ipinapakita ng Moovit ang bus lines, oras at kung saan bababa, sa maraming wika.", "Ipinapakita rin ng Google Maps ang bus at tren: piliin ang icon ng bus/tren, at sasabihin nito kung aling linya ang sasakyan, saan maglalakad at kailan bababa."],
                    ["ബസുകൾക്കും ട്രെയിനുകൾക്കും റാവ്-കാവ് കാർഡോ പേയ്‌മെന്റ് ആപ്പോ ഉപയോഗിച്ച് പണം നൽകുന്നു – പണമായല്ല.", "ബസിൽ കയറുന്നതിന് മുമ്പ് റാവ്-കാവ് കാർഡ് ലോഡ് ചെയ്യുക.", "മിക്ക ബസുകളും ട്രെയിനുകളും ശബ്ബത്തിൽ ഓടില്ല (വെള്ളി ഉച്ച മുതൽ ശനി രാത്രി വരെ).", "മൂവിറ്റ് ബസ് ലൈനുകൾ, സമയം, എവിടെ ഇറങ്ങണം എന്നിവ പല ഭാഷകളിൽ കാണിക്കുന്നു.", "ഗൂഗിൾ മാപ്സും ബസുകളും ട്രെയിനുകളും കാണിക്കുന്നു: ബസ്/ട്രെയിൻ ഐക്കൺ തിരഞ്ഞെടുക്കുക, ഏത് ലൈൻ, എവിടെ നടക്കണം, എപ്പോൾ ഇറങ്ങണം എന്ന് പറയും."],
                    ["Проезд оплачивается картой Рав-Кав или приложением – не наличными.", "Пополните Рав-Кав до посадки в автобус.", "Большинство автобусов и поездов не ходят в шабат (с вечера пятницы до вечера субботы).", "Moovit показывает маршруты, расписание и где выходить, на многих языках.", "Google Maps тоже показывает автобусы и поезда: выберите значок транспорта – он подскажет линию, куда идти и где выходить."]
                ),
                links: [
                    { label: t("Moovit app", "Moovit app", "മൂവിറ്റ് ആപ്പ്", "Приложение Moovit"), url: playSearch("Moovit") },
                    { label: t("Google Maps", "Google Maps", "ഗൂഗിൾ മാപ്സ്", "Google Maps"), url: "https://www.google.com/maps" },
                    { label: t("Rav-Kav Online app", "Rav-Kav Online app", "റാവ്-കാവ് ഓൺലൈൻ ആപ്പ്", "Приложение Rav-Kav Online"), url: playSearch("Rav-Kav Online") },
                    { label: t("How to use Rav-Kav (videos)", "Paano gamitin ang Rav-Kav (videos)", "റാവ്-കാവ് എങ്ങനെ ഉപയോഗിക്കാം (വീഡിയോകൾ)", "Как пользоваться Рав-Кав (видео)"), url: youtube("how to load Rav-Kav card") },
                ],
            },
            COMING_SOON,
        ],
    },

    faq: {
        icon: "📍",
        title: t("FAQs for caring for elderly clients", "FAQ sa pag-aalaga ng matatanda", "മുതിർന്നവരെ പരിചരിക്കുന്നതിനുള്ള FAQ", "Вопросы об уходе за пожилыми"),
        sections: [
            {
                title: t("If something happens", "Kung may mangyari", "എന്തെങ്കിലും സംഭവിച്ചാൽ", "Если что-то случилось"),
                bullets: list(
                    ["A fall, chest pain, trouble breathing or speaking: call 101 at once, then the family.", "Don't change medicine doses without the doctor or the family.", "Write down when you gave each medicine."],
                    ["Pagkahulog, sakit sa dibdib, hirap huminga o magsalita: tumawag agad sa 101, saka sa pamilya.", "Huwag baguhin ang dosis ng gamot nang walang doktor o pamilya.", "Isulat kung kailan mo ibinigay ang bawat gamot."],
                    ["വീഴ്ച, നെഞ്ചുവേദന, ശ്വസിക്കാനോ സംസാരിക്കാനോ ബുദ്ധിമുട്ട്: ഉടൻ 101 വിളിക്കുക, പിന്നെ കുടുംബത്തെ.", "ഡോക്ടറോ കുടുംബമോ ഇല്ലാതെ മരുന്നിന്റെ അളവ് മാറ്റരുത്.", "ഓരോ മരുന്നും എപ്പോൾ നൽകി എന്ന് എഴുതിവയ്ക്കുക."],
                    ["Падение, боль в груди, трудно дышать или говорить: сразу звоните 101, потом семье.", "Не меняйте дозы лекарств без врача или семьи.", "Записывайте, когда вы дали каждое лекарство."]
                ),
            },
            COMING_SOON,
        ],
    },

    about: {
        icon: "ℹ",
        title: t("About us", "Tungkol sa amin", "ഞങ്ങളെ കുറിച്ച്", "О нас"),
        sections: [
            {
                title: t("CareConnect", "CareConnect", "CareConnect", "CareConnect"),
                body: t(
                    "CareConnect helps foreign caregivers in Israel: a translator that knows Israeli words, a legal assistant for your rights and contract, and practical information in your language.",
                    "Tinutulungan ng CareConnect ang mga foreign caregiver sa Israel: translator na alam ang mga salitang Israeli, legal assistant para sa karapatan at contract mo, at praktikal na impormasyon sa wika mo.",
                    "ഇസ്രായേലിലെ വിദേശ പരിചാരകരെ CareConnect സഹായിക്കുന്നു: ഇസ്രായേലി വാക്കുകൾ അറിയുന്ന വിവർത്തകൻ, അവകാശങ്ങൾക്കും കരാറിനുമുള്ള ലീഗൽ അസിസ്റ്റന്റ്, നിങ്ങളുടെ ഭാഷയിൽ പ്രായോഗിക വിവരങ്ങൾ.",
                    "CareConnect помогает иностранным сиделкам в Израиле: переводчик, знающий израильские слова, юридический помощник по правам и договору и полезная информация на вашем языке."
                ),
            },
            COMING_SOON,
        ],
    },
} satisfies Record<string, InfoPage>;

export type InfoPageId = keyof typeof INFO_PAGES;

// ── Remittance page (below the currency converter) ──────────────────

export const REMITTANCE_SECTIONS: InfoSection[] = [
    {
        title: t("Recommended by a senior caregiver", "Rekomendasyon ng isang senior caregiver", "ഒരു മുതിർന്ന പരിചാരകയുടെ ശുപാർശ", "Совет опытной сиделки"),
        quote: {
            text: t(
                "There are some remittance apps I can recommend: Neema, Remitly, Monox. Those 3 are well known remittance apps for foreign workers – Filipinos, Indians, Chinese, Sri Lankans 😊",
                "May mga remittance app akong mairerekomenda: Neema, Remitly, Monox. Kilala ang 3 ito sa mga foreign worker – Pilipino, Indian, Chinese, Sri Lankan 😊",
                "എനിക്ക് ശുപാർശ ചെയ്യാവുന്ന ചില റെമിറ്റൻസ് ആപ്പുകൾ: Neema, Remitly, Monox. ഫിലിപ്പിനോകൾ, ഇന്ത്യക്കാർ, ചൈനക്കാർ, ശ്രീലങ്കക്കാർ തുടങ്ങിയ വിദേശ തൊഴിലാളികൾക്കിടയിൽ ഈ 3 എണ്ണം പ്രസിദ്ധമാണ് 😊",
                "Могу порекомендовать приложения для переводов: Neema, Remitly, Monox. Эти 3 хорошо известны среди иностранных работников – филиппинцев, индийцев, китайцев, шриланкийцев 😊"
            ),
            by: t("Senior caregiver", "Senior caregiver", "മുതിർന്ന പരിചാരക", "Опытная сиделка"),
        },
    },
    {
        title: t("Remittance apps", "Mga remittance app", "റെമിറ്റൻസ് ആപ്പുകൾ", "Приложения для переводов"),
        bullets: list(
            [
                "Neema – Israeli app made for foreign workers: a digital wallet, a card and transfers abroad, with branches in Israel. You don't need an Israeli bank account.",
                "Remitly – international app: send to a bank account, an e-wallet (like GCash) or for cash pickup. Shows the fee and the rate before you send.",
                "myGMT (GMT) – licensed in Israel, for foreign workers for over 20 years. App in several languages, with branches.",
            ],
            [
                "Neema – Israeli app para sa foreign workers: digital wallet, card at padala sa abroad, may branches sa Israel. Hindi mo kailangan ng Israeli bank account.",
                "Remitly – international app: padala sa bank account, e-wallet (gaya ng GCash) o cash pickup. Makikita mo ang fee at rate bago magpadala.",
                "myGMT (GMT) – licensed sa Israel, para sa foreign workers nang mahigit 20 taon. May app sa iba't ibang wika, at may branches.",
            ],
            [
                "Neema – വിദേശ തൊഴിലാളികൾക്കായുള്ള ഇസ്രായേലി ആപ്പ്: ഡിജിറ്റൽ വാലറ്റ്, കാർഡ്, വിദേശത്തേക്ക് പണം അയക്കൽ, ഇസ്രായേലിൽ ശാഖകൾ. ഇസ്രായേലി ബാങ്ക് അക്കൗണ്ട് ആവശ്യമില്ല.",
                "Remitly – അന്താരാഷ്ട്ര ആപ്പ്: ബാങ്ക് അക്കൗണ്ടിലേക്കോ ഇ-വാലറ്റിലേക്കോ അയക്കാം, അല്ലെങ്കിൽ പണമായി കൈപ്പറ്റാം. അയക്കുന്നതിന് മുമ്പ് ഫീസും നിരക്കും കാണിക്കുന്നു.",
                "myGMT (GMT) – ഇസ്രായേലിൽ ലൈസൻസുള്ളത്, 20 വർഷത്തിലേറെയായി വിദേശ തൊഴിലാളികൾക്കായി. പല ഭാഷകളിൽ ആപ്പ്, ശാഖകളുണ്ട്.",
            ],
            [
                "Neema – израильское приложение для иностранных работников: электронный кошелёк, карта и переводы за границу, есть отделения в Израиле. Израильский банковский счёт не нужен.",
                "Remitly – международное приложение: перевод на банковский счёт, электронный кошелёк или получение наличными. Комиссия и курс видны до отправки.",
                "myGMT (GMT) – лицензия в Израиле, работает с иностранными работниками более 20 лет. Приложение на нескольких языках, есть отделения.",
            ]
        ),
        links: [
            { label: t("Neema app", "Neema app", "Neema ആപ്പ്", "Приложение Neema"), url: playSearch("Neema Israel") },
            { label: t("Remitly website", "Website ng Remitly", "Remitly വെബ്സൈറ്റ്", "Сайт Remitly"), url: "https://www.remitly.com" },
            { label: t("GMT website", "Website ng GMT", "GMT വെബ്സൈറ്റ്", "Сайт GMT"), url: "https://gmtonline.co.il/en" },
        ],
    },
    {
        title: t("How to send money safely", "Paano magpadala nang ligtas", "സുരക്ഷിതമായി പണം അയക്കുന്നത് എങ്ങനെ", "Как безопасно отправлять деньги"),
        bullets: list(
            ["Compare: the fee AND the exchange rate. A \"free\" transfer can have a bad rate – check above how much your money is worth.", "Use only licensed companies and official apps from the app store.", "Never share your password or SMS code with anyone, even someone who says they are from the company.", "Check the receiver's name and account number twice. Keep every receipt."],
            ["Ikumpara: ang fee AT ang exchange rate. Ang \"libreng\" padala ay puwedeng may mababang rate – tingnan sa itaas kung magkano ang halaga ng pera mo.", "Gamitin lang ang mga licensed na kompanya at opisyal na app mula sa app store.", "Huwag ibigay kahit kanino ang password o SMS code mo, kahit sabihin nilang taga-kompanya sila.", "I-check nang dalawang beses ang pangalan at account number ng tatanggap. Itago ang bawat resibo."],
            ["താരതമ്യം ചെയ്യുക: ഫീസും വിനിമയ നിരക്കും. \"സൗജന്യ\" ട്രാൻസ്ഫറിന് മോശം നിരക്ക് ഉണ്ടാകാം – നിങ്ങളുടെ പണത്തിന്റെ മൂല്യം മുകളിൽ പരിശോധിക്കുക.", "ലൈസൻസുള്ള കമ്പനികളും ആപ്പ് സ്റ്റോറിലെ ഔദ്യോഗിക ആപ്പുകളും മാത്രം ഉപയോഗിക്കുക.", "പാസ്‌വേഡോ SMS കോഡോ ആരുമായും പങ്കിടരുത്, കമ്പനിയിൽ നിന്നാണെന്ന് പറഞ്ഞാലും.", "സ്വീകർത്താവിന്റെ പേരും അക്കൗണ്ട് നമ്പറും രണ്ടുതവണ പരിശോധിക്കുക. എല്ലാ രസീതുകളും സൂക്ഷിക്കുക."],
            ["Сравнивайте комиссию И курс. «Бесплатный» перевод может иметь плохой курс – проверьте выше, сколько стоят ваши деньги.", "Пользуйтесь только лицензированными компаниями и официальными приложениями из магазина.", "Никогда никому не сообщайте пароль или SMS-код, даже если говорят, что звонят из компании.", "Дважды проверьте имя получателя и номер счёта. Сохраняйте все квитанции."]
        ),
    },
    {
        title: t("Videos: how to use the apps", "Videos: paano gamitin ang apps", "വീഡിയോകൾ: ആപ്പുകൾ എങ്ങനെ ഉപയോഗിക്കാം", "Видео: как пользоваться приложениями"),
        links: [
            { label: t("How to send money with Remitly", "Paano magpadala gamit ang Remitly", "Remitly ഉപയോഗിച്ച് പണം അയക്കുന്നത്", "Как отправить деньги через Remitly"), url: youtube("how to send money with Remitly app") },
            { label: t("How to use the Neema app", "Paano gamitin ang Neema app", "Neema ആപ്പ് എങ്ങനെ ഉപയോഗിക്കാം", "Как пользоваться приложением Neema"), url: youtube("Neema app Israel how to send money") },
            { label: t("How to use the myGMT app", "Paano gamitin ang myGMT app", "myGMT ആപ്പ് എങ്ങനെ ഉപയോഗിക്കാം", "Как пользоваться приложением myGMT"), url: youtube("myGMT app Israel how to send money") },
        ],
    },
];

// ── Payslips page (below the uploaded payslips) ─────────────────────

export const PAYSLIP_SECTIONS: InfoSection[] = [
    {
        title: t("Payslip, Excel or a list – keep them all", "Payslip, Excel o listahan – itago lahat", "ശമ്പള സ്ലിപ്പ്, എക്സൽ അല്ലെങ്കിൽ ലിസ്റ്റ് – എല്ലാം സൂക്ഷിക്കുക", "Расчётный лист, Excel или список – храните всё"),
        body: t(
            "Some caregivers get a payslip, others an Excel sheet or a list with their hours and salary. Upload whatever you get: it is explained in your language and kept safe here. A table of hours doesn't replace a payslip – your employer must still give you a payslip every month.",
            "May caregiver na nakakatanggap ng payslip, ang iba naman ay Excel o listahan ng oras at sahod. I-upload kung ano ang natatanggap mo: ipapaliwanag ito sa wika mo at itatago nang ligtas dito. Hindi kapalit ng payslip ang listahan ng oras – dapat ka pa ring bigyan ng employer ng payslip bawat buwan.",
            "ചില പരിചാരകർക്ക് ശമ്പള സ്ലിപ്പ് ലഭിക്കുന്നു, മറ്റുള്ളവർക്ക് മണിക്കൂറുകളും ശമ്പളവുമുള്ള എക്സൽ ഷീറ്റോ ലിസ്റ്റോ. ലഭിക്കുന്നതെന്തും അപ്‌ലോഡ് ചെയ്യുക: അത് നിങ്ങളുടെ ഭാഷയിൽ വിശദീകരിക്കുകയും ഇവിടെ സുരക്ഷിതമായി സൂക്ഷിക്കുകയും ചെയ്യും. മണിക്കൂറുകളുടെ പട്ടിക ശമ്പള സ്ലിപ്പിന് പകരമല്ല – തൊഴിലുടമ എല്ലാ മാസവും ശമ്പള സ്ലിപ്പ് നൽകണം.",
            "Кто-то получает расчётный лист, кто-то – таблицу Excel или список с часами и зарплатой. Загружайте то, что получаете: всё будет объяснено на вашем языке и сохранено здесь. Таблица часов не заменяет расчётный лист – работодатель всё равно обязан выдавать его каждый месяц."
        ),
    },
    {
        title: t("What a payslip must show", "Ano ang dapat nasa payslip", "ശമ്പള സ്ലിപ്പിൽ ഉണ്ടായിരിക്കേണ്ടത്", "Что должно быть в расчётном листе"),
        body: t(
            "Your employer must give you a payslip (tlush maskoret) with your salary every month. Keep every one: you may need them to claim your rights later.",
            "Dapat bigyan ka ng employer ng payslip (tlush maskoret) kasama ng sahod mo bawat buwan. Itago ang bawat isa: baka kailanganin mo ito para sa mga karapatan mo.",
            "എല്ലാ മാസവും ശമ്പളത്തോടൊപ്പം തൊഴിലുടമ നിങ്ങൾക്ക് ശമ്പള സ്ലിപ്പ് (തലൂഷ് മസ്കോറെത്) നൽകണം. എല്ലാം സൂക്ഷിക്കുക: പിന്നീട് അവകാശങ്ങൾ ചോദിക്കാൻ ആവശ്യമായേക്കാം.",
            "Работодатель обязан каждый месяц вместе с зарплатой выдавать расчётный лист (тлуш маскорет). Храните все: они могут понадобиться, чтобы потребовать свои права."
        ),
        bullets: list(
            ["The month, your name and passport number, and the employer's name", "Days and hours worked, rest days, vacation and sick days", "Gross salary (before deductions)", "Each deduction, with its name and amount", "Net salary (what you actually get)"],
            ["Ang buwan, pangalan at passport number mo, at pangalan ng employer", "Mga araw at oras ng trabaho, day off, bakasyon at sick days", "Gross salary (bago ang kaltas)", "Bawat kaltas, kasama ang pangalan at halaga", "Net salary (ang talagang natatanggap mo)"],
            ["മാസം, നിങ്ങളുടെ പേരും പാസ്‌പോർട്ട് നമ്പറും, തൊഴിലുടമയുടെ പേരും", "ജോലി ചെയ്ത ദിവസങ്ങളും മണിക്കൂറുകളും, വിശ്രമ ദിനങ്ങൾ, അവധി, അസുഖ അവധി", "മൊത്ത ശമ്പളം (കിഴിവുകൾക്ക് മുമ്പ്)", "ഓരോ കിഴിവും, പേരും തുകയും സഹിതം", "അറ്റ ശമ്പളം (നിങ്ങൾക്ക് യഥാർത്ഥത്തിൽ ലഭിക്കുന്നത്)"],
            ["Месяц, ваше имя и номер паспорта, имя работодателя", "Отработанные дни и часы, выходные, отпуск и больничные", "Зарплата брутто (до вычетов)", "Каждый вычет с названием и суммой", "Зарплата нетто (то, что вы получаете на руки)"]
        ),
    },
    {
        title: t("Deductions", "Mga kaltas", "കിഴിവുകൾ", "Вычеты"),
        bullets: list(
            ["Some deductions are by law, like National Insurance (Bituach Leumi) and health tax.", "Other deductions (for example for housing or extra costs) are allowed only within limits and if you agreed in writing.", "Your salary must not be below the minimum wage.", "Something looks wrong? Ask the Legal assistant, or call Kav LaOved: 03-6883766."],
            ["May mga kaltas na ayon sa batas, gaya ng National Insurance (Bituach Leumi) at health tax.", "Ang ibang kaltas (halimbawa para sa tirahan o dagdag na gastos) ay puwede lang sa limitadong halaga at kung pumayag ka nang nakasulat.", "Hindi dapat mas mababa sa minimum wage ang sahod mo.", "May mukhang mali? Magtanong sa Legal assistant, o tumawag sa Kav LaOved: 03-6883766."],
            ["ചില കിഴിവുകൾ നിയമപ്രകാരമാണ്, ദേശീയ ഇൻഷുറൻസ് (ബിറ്റുവാഹ് ലെയുമി), ആരോഗ്യ നികുതി എന്നിവ പോലെ.", "മറ്റ് കിഴിവുകൾ (ഉദാഹരണത്തിന് താമസത്തിനോ അധിക ചെലവുകൾക്കോ) പരിധിക്കുള്ളിൽ, നിങ്ങൾ രേഖാമൂലം സമ്മതിച്ചാൽ മാത്രം.", "നിങ്ങളുടെ ശമ്പളം മിനിമം വേതനത്തിൽ കുറയരുത്.", "എന്തെങ്കിലും തെറ്റായി തോന്നുന്നുണ്ടോ? ലീഗൽ അസിസ്റ്റന്റിനോട് ചോദിക്കുക, അല്ലെങ്കിൽ കാവ് ലഓവേദിനെ വിളിക്കുക: 03-6883766."],
            ["Некоторые вычеты положены по закону, например Битуах Леуми (нац. страхование) и налог на здоровье.", "Другие вычеты (например, за жильё или доп. расходы) допустимы только в пределах лимитов и при вашем письменном согласии.", "Зарплата не может быть ниже минимальной.", "Что-то кажется неправильным? Спросите юридического помощника или позвоните в Кав ЛаОвед: 03-6883766."]
        ),
        phones: [
            { number: "03-6883766", label: t("Kav LaOved (Tel Aviv)", "Kav LaOved (Tel Aviv)", "കാവ് ലഓവേദ് (ടെൽ അവീവ്)", "Кав ЛаОвед (Тель-Авив)") },
        ],
    },
];
