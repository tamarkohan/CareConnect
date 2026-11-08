/**
 * src/api/platform.ts
 *
 * Small helpers that behave the same on iOS, Android and the web build.
 */
import { Alert, Linking, Platform, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy";

/**
 * Shows an alert. React Native's Alert.alert does nothing in the browser,
 * so on web we fall back to window.alert.
 */
export function showAlert(title: string, message?: string) {
    if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
            window.alert(message ? `${title}\n\n${message}` : title);
        }
        return;
    }
    Alert.alert(title, message);
}

/** Asks "OK / Cancel" and resolves true on OK. Works in the browser too. */
export function confirmAction(message: string, okLabel = "OK", cancelLabel = "Cancel"): Promise<boolean> {
    if (Platform.OS === "web") {
        return Promise.resolve(typeof window !== "undefined" && window.confirm(message));
    }
    return new Promise((resolve) =>
        Alert.alert("", message, [
            { text: cancelLabel, style: "cancel", onPress: () => resolve(false) },
            { text: okLabel, style: "destructive", onPress: () => resolve(true) },
        ])
    );
}

/**
 * True where "Share" should open a share menu: the phone apps and a phone's
 * browser. A computer's browser may have one too (Chrome / Edge on Windows open
 * the Windows share window), but it doesn't pass plain text on reliably, so on
 * computers we copy instead.
 */
export function hasShareMenu(): boolean {
    if (Platform.OS !== "web") return true;
    if (typeof navigator === "undefined" || !(navigator as any).share) return false;
    const uaData = (navigator as any).userAgentData;
    if (uaData) return !!uaData.mobile || /Android/i.test(uaData.platform ?? "");
    const ua = navigator.userAgent || "";
    // An iPad asks for the computer version of sites, so it looks like a Mac with a touch screen.
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * Opens the phone's share menu (WhatsApp, SMS, email…) with this text. On a
 * computer it copies the text instead, so the caller can show "Copied"; if even
 * that is blocked, the text is shown to copy by hand.
 */
export async function shareText(text: string): Promise<"shared" | "copied" | "shown" | "cancelled"> {
    if (!hasShareMenu()) {
        try {
            await Clipboard.setStringAsync(text);
            return "copied";
        } catch {
            showAlert(text);
            return "shown";
        }
    }
    try {
        const result = await Share.share({ message: text });
        return result.action === Share.dismissedAction ? "cancelled" : "shared";
    } catch {
        return "cancelled";   // closed the share menu
    }
}

/**
 * Reads a local file / blob / data URI and returns plain base64 (no "data:" prefix).
 * expo-file-system can't read files in the browser, so on web we use fetch + FileReader.
 */
export async function uriToBase64(uri: string): Promise<string> {
    if (uri.startsWith("data:")) {
        return uri.slice(uri.indexOf("base64,") + 7);
    }

    if (Platform.OS === "web") {
        const blob = await fetch(uri).then((r) => r.blob());
        const dataUrl: string = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
        return dataUrl.slice(dataUrl.indexOf("base64,") + 7);
    }

    return FileSystem.readAsStringAsync(uri, { encoding: "base64" });
}

/** MIME type of a data URI, if there is one. */
export function mimeFromDataUri(uri?: string | null): string | undefined {
    const m = uri?.match(/^data:([^;,]+)[;,]/);
    return m?.[1];
}

/**
 * Lets the user save a file they uploaded earlier. In the browser it downloads
 * the file; in the phone apps it opens it from the app's cache folder.
 */
export async function saveFile(name: string, mimeType: string, base64: string): Promise<void> {
    if (Platform.OS === "web") {
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
    }
    const path = `${LegacyFileSystem.cacheDirectory}${name.replace(/[^\w.\- ]/g, "_")}`;
    await LegacyFileSystem.writeAsStringAsync(path, base64, { encoding: LegacyFileSystem.EncodingType.Base64 });
    await Linking.openURL(path);
}
