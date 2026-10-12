// ── PlacePhoto.tsx ───────────────────────────────────────────────────
// Thumbnail of a place, taken from the main photo of its English Wikipedia
// article (free REST API, no key, works from the browser). The photo is loaded
// on the user's device; if it can't be loaded, the old icon is shown. The
// caption links to the article, which credits the photographer.
import * as React from "react";
import { View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { Image } from "expo-image";

type Photo = { src: string; page: string } | null;
const cache = new Map<string, Promise<Photo>>();

function loadPhoto(wiki: string): Promise<Photo> {
    if (!cache.has(wiki)) {
        cache.set(
            wiki,
            fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}`)
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => {
                    const src = d?.thumbnail?.source || d?.originalimage?.source;
                    return src ? { src, page: d?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${wiki}` } : null;
                })
                .catch(() => null)
        );
    }
    return cache.get(wiki)!;
}

export default function PlacePhoto({ wiki, name }: { wiki?: string; name: string }) {
    const [photo, setPhoto] = React.useState<Photo | undefined>(undefined);
    const [failed, setFailed] = React.useState(false);

    React.useEffect(() => {
        let alive = true;
        if (wiki) loadPhoto(wiki).then((p) => alive && setPhoto(p));
        else setPhoto(null);
        return () => { alive = false; };
    }, [wiki]);

    if (!photo || failed) {
        return (
            <View style={s.box}>
                <Text style={s.emoji}>🏛</Text>
            </View>
        );
    }
    return (
        <View style={s.box}>
            <Image source={{ uri: photo.src }} style={s.img} contentFit="cover" accessibilityLabel={name} onError={() => setFailed(true)} />
            <Pressable style={s.credit} onPress={() => Linking.openURL(photo.page)} accessibilityRole="link">
                <Text style={s.creditText}>Photo: Wikipedia</Text>
            </Pressable>
        </View>
    );
}

const s = StyleSheet.create({
    box: { height: 140, backgroundColor: "#c8dfc8", alignItems: "center", justifyContent: "center", overflow: "hidden" },
    emoji: { fontSize: 40 },
    img: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    credit: { position: "absolute", right: 6, bottom: 6, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
    creditText: { fontSize: 10, color: "#fff" },
});
