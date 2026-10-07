// ── MarkdownText.tsx ─────────────────────────────────────────────────
// Shows the small part of Markdown the bots use: paragraphs, "- " bullets,
// "1. " numbered lists, **bold**, *italic* and headings (shown bold).
// Lines like "***" or "---" are dropped. Citations such as [1] or [1, 2] can
// be made tappable with onCitation.
import * as React from "react";
import { View, Text, StyleSheet, TextStyle, StyleProp } from "react-native";

type Props = {
    children: string;
    style?: StyleProp<TextStyle>;
    citationStyle?: StyleProp<TextStyle>;
    onCitation?: (id: number) => void;
};

type Block =
    | { kind: "para"; text: string }
    | { kind: "heading"; text: string }
    | { kind: "bullet"; text: string; indent: number }
    | { kind: "number"; text: string; n: string; indent: number };

function parseBlocks(src: string): Block[] {
    const blocks: Block[] = [];
    let para: string[] = [];
    const flush = () => {
        if (para.length) blocks.push({ kind: "para", text: para.join(" ") });
        para = [];
    };

    for (const raw of src.replace(/\r\n/g, "\n").split("\n")) {
        const indent = Math.min(2, Math.floor((raw.match(/^\s*/)?.[0].length ?? 0) / 2));
        const line = raw.trim();
        let m: RegExpMatchArray | null;
        if (!line || /^([-*_]\s*){3,}$/.test(line)) {
            flush();
        } else if ((m = line.match(/^#{1,6}\s+(.*)$/))) {
            flush();
            blocks.push({ kind: "heading", text: m[1] });
        } else if ((m = line.match(/^[-*•]\s+(.*)$/))) {
            flush();
            blocks.push({ kind: "bullet", text: m[1], indent });
        } else if ((m = line.match(/^(\d+)[.)]\s+(.*)$/))) {
            flush();
            blocks.push({ kind: "number", n: m[1], text: m[2], indent });
        } else {
            para.push(line);
        }
    }
    flush();
    return blocks;
}

/** Splits a line into plain / bold / italic / citation pieces. */
function renderInline(text: string, citationStyle: Props["citationStyle"], onCitation: Props["onCitation"]) {
    const out: React.ReactNode[] = [];
    const re = /\*\*(.+?)\*\*|__(.+?)__|\*(?!\s)(.+?)\*|\[(\d+(?:\s*,\s*\d+)*)\]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let key = 0;
    while ((m = re.exec(text))) {
        if (m.index > last) out.push(text.slice(last, m.index));
        if (m[1] !== undefined || m[2] !== undefined) {
            out.push(<Text key={key++} style={s.bold}>{m[1] ?? m[2]}</Text>);
        } else if (m[3] !== undefined) {
            out.push(<Text key={key++} style={s.italic}>{m[3]}</Text>);
        } else {
            const ids = m[4].split(",").map((x) => Number(x.trim()));
            out.push(
                <Text key={key++}>
                    [
                    {ids.map((id, i) => (
                        <Text key={id}>
                            {i > 0 && ", "}
                            <Text
                                style={onCitation ? citationStyle : undefined}
                                onPress={onCitation ? () => onCitation(id) : undefined}
                            >
                                {id}
                            </Text>
                        </Text>
                    ))}
                    ]
                </Text>
            );
        }
        last = re.lastIndex;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}

export default function MarkdownText({ children, style, citationStyle, onCitation }: Props) {
    const blocks = React.useMemo(() => parseBlocks(children || ""), [children]);
    const inline = (t: string) => renderInline(t, citationStyle, onCitation);

    return (
        <View style={s.root}>
            {blocks.map((b, i) => {
                if (b.kind === "para") return <Text key={i} style={style}>{inline(b.text)}</Text>;
                if (b.kind === "heading") return <Text key={i} style={[style, s.bold]}>{inline(b.text)}</Text>;
                return (
                    <View key={i} style={[s.listRow, { paddingLeft: b.indent * 14 }]}>
                        <Text style={[style, s.marker]}>{b.kind === "bullet" ? "•" : `${b.n}.`}</Text>
                        <Text style={[style, s.listText]}>{inline(b.text)}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const s = StyleSheet.create({
    root: { gap: 8 },
    bold: { fontWeight: "700" },
    italic: { fontStyle: "italic" },
    listRow: { flexDirection: "row", gap: 6, marginTop: -4 },
    marker: { minWidth: 16 },
    listText: { flex: 1 },
});
