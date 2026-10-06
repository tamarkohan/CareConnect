/**
 * src/api/contractToken.ts
 *
 * Keeps the user's contract token on the device. The token is the only key to
 * the contract stored on the server, so on iOS/Android it goes in the secure
 * keychain/keystore (expo-secure-store). SecureStore isn't available in the
 * browser, so the web build falls back to localStorage.
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "careconnect.contractToken";

export async function loadContractToken(): Promise<string | null> {
    try {
        if (Platform.OS === "web") return window.localStorage.getItem(KEY);
        return await SecureStore.getItemAsync(KEY);
    } catch {
        return null;
    }
}

export async function saveContractToken(token: string): Promise<void> {
    try {
        if (Platform.OS === "web") window.localStorage.setItem(KEY, token);
        else await SecureStore.setItemAsync(KEY, token);
    } catch {
        // Not fatal: the contract still works for this session.
    }
}

export async function clearContractToken(): Promise<void> {
    try {
        if (Platform.OS === "web") window.localStorage.removeItem(KEY);
        else await SecureStore.deleteItemAsync(KEY);
    } catch {
        // ignore
    }
}
