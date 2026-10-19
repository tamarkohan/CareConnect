// ── InfoScreen.tsx ───────────────────────────────────────────────────
// One screen for the home-screen information pages: it shows the page from
// infoPages.ts named in the route ({ page: "safety" }). The agency page also
// shows the agency and employer read from the user's uploaded contract.
import * as React from "react";
import { View, Text, Pressable } from "react-native";
import { useLang } from "../AppContext";
import { INFO_PAGES, InfoPageId } from "../infoPages";
import { PAGE_T } from "../pageStrings";
import { FAQ } from "../infoFaq";
import { PageFrame, InfoSections, FaqList, s } from "../components/InfoSections";
import { getContract, ContractSummary } from "../api/client";

export default function InfoScreen({ navigation, route }: any) {
    const { lang } = useLang();
    const id: InfoPageId = route?.params?.page in INFO_PAGES ? route.params.page : "about";
    const page = INFO_PAGES[id];

    return (
        <PageFrame title={page.title[lang]} navigation={navigation}>
            <Text style={s.pageTitle}>{page.icon}  {page.title[lang]}</Text>
            {"intro" in page && page.intro ? <Text style={s.intro}>{page.intro[lang]}</Text> : null}
            {id === "agency" ? <AgencyCard navigation={navigation} /> : null}
            <InfoSections sections={page.sections} />
            <FaqList items={FAQ[id]} />
        </PageFrame>
    );
}

function AgencyCard({ navigation }: { navigation: any }) {
    const { lang } = useLang();
    const p = PAGE_T[lang];
    const [summary, setSummary] = React.useState<ContractSummary | null | undefined>(undefined);

    React.useEffect(() => {
        getContract()
            .then((r) => setSummary(r.contract?.summary ?? null))
            .catch(() => setSummary(null));
    }, []);

    if (summary === undefined) return null;
    const info = summary?.[lang] ?? summary?.en;
    const agency = info?.agency;
    const employer = info?.employer;

    return (
        <View style={s.card}>
            <Text style={s.cardTitle}>{p.agencyFromContract}</Text>
            {agency || employer ? (
                <>
                    {agency ? <Text style={s.body}><Text style={{ fontWeight: "700" }}>{p.agencyName}: </Text>{agency}</Text> : null}
                    {employer ? <Text style={s.body}><Text style={{ fontWeight: "700" }}>{p.employerName}: </Text>{employer}</Text> : null}
                </>
            ) : (
                <>
                    <Text style={s.body}>{p.agencyUnknown}</Text>
                    <Pressable style={s.button} onPress={() => navigation.navigate("Assistant")}>
                        <Text style={s.buttonText}>{p.openAssistant}</Text>
                    </Pressable>
                </>
            )}
        </View>
    );
}
