/**
 * src/api/storage.ts
 *
 * Small key/value storage on the device. Secrets (session and contract tokens)
 * go in the secure keychain/keystore on iOS/Android (expo-secure-store).
 * SecureStore isn't available in the browser, so the web build uses localStorage.
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function getItem(key: string): Promise<string | null> {
    try {
        if (Platform.OS === "web") return window.localStorage.getItem(key);
        return await SecureStore.getItemAsync(key);
    } catch {
        return null;
    }
}

export async function setItem(key: string, value: string): Promise<void> {
    try {
        if (Platform.OS === "web") window.localStorage.setItem(key, value);
        else await SecureStore.setItemAsync(key, value);
    } catch {
        // Not fatal: it still works for this session.
    }
}

export async function removeItem(key: string): Promise<void> {
    try {
        if (Platform.OS === "web") window.localStorage.removeItem(key);
        else await SecureStore.deleteItemAsync(key);
    } catch {
        // ignore
    }
}
