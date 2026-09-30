/**
 * src/api/platform.ts
 *
 * Small helpers that behave the same on iOS, Android and the web build.
 */
import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system";

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
