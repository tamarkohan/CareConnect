/**
 * src/api/client.ts
 *
 * Single source of truth for the backend base URL and typed fetch helpers.
 *
 * ─── Changing the URL ────────────────────────────────────────────────────────
 * • Android emulator  → http://10.0.2.2:3000
 * • Physical device   → http://<your-machine-LAN-IP>:3000   (run `ipconfig`)
 * • iOS simulator     → http://localhost:3000
 * • Production        → https://your-api.example.com
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Where the backend lives:
// 1. EXPO_PUBLIC_API_URL, if set when the app is built/started.
// 2. On the web build served from DigitalOcean, the same domain the page is on
//    (App Platform routes /api/* to the backend service — see .do/app.yaml).
// 3. Otherwise the fallback below (used by Expo Go / local dev).
//    After moving to DigitalOcean, replace it with your DO app URL.
const FALLBACK_API_URL = "https://careconnect-il-app-id9mu.ondigitalocean.app";

function resolveApiBaseUrl(): string {
    const fromEnv = process.env.EXPO_PUBLIC_API_URL;
    if (fromEnv) return fromEnv.replace(/\/+$/, "");

    if (typeof window !== "undefined" && window.location?.hostname) {
        const { hostname, origin } = window.location;
        const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
        if (!isLocal) return origin;
    }

    return FALLBACK_API_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

// ── Generic helper ────────────────────────────────────────────────────────────
async function apiFetch<T>(
    path: string,
    body: object
): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.error ?? `HTTP ${res.status}`);
    }

    return data as T;
}

// ── Translate ─────────────────────────────────────────────────────────────────
export type TranslateRequest = {
    text?: string;
    imageBase64?: string;
    /** MIME type of the image (e.g. "image/png"). Defaults to "image/jpeg" on the server. */
    imageMimeType?: string;
    /** Base64-encoded audio clip recorded by the user. */
    audioBase64?: string;
    /** MIME type of the audio (e.g. "audio/m4a"). Defaults to "audio/m4a" on the server. */
    audioMimeType?: string;
    targetLanguage: string;
};

export type TranslateResponse = {
    translatedText: string;
    detectedLanguage: string;
};

export function translateText(req: TranslateRequest): Promise<TranslateResponse> {
    return apiFetch<TranslateResponse>("/api/translate", req);
}

// ── Legal: upload contract ────────────────────────────────────────────────────
export type UploadContractRequest = {
    contractText: string;
    /** Send the existing token to replace that contract instead of creating a new one. */
    contractToken?: string;
};

export type UploadContractResponse = {
    success: boolean;
    message: string;
    /** Secret key to this contract. Keep it on the device (see contractToken.ts). */
    contractToken: string;
    characterCount: number;
};

export function uploadContract(req: UploadContractRequest): Promise<UploadContractResponse> {
    return apiFetch<UploadContractResponse>("/api/legal/upload-contract", req);
}

// ── Legal: ask ────────────────────────────────────────────────────────────────
export type LegalAskRequest = {
    question: string;
    language: string;
    contractToken?: string;
};

export type LegalSource = {
    /** Matches the [n] citations in the answer. */
    id: number;
    title: string;
    url: string;
};

export type LegalAskResponse = {
    answer: string;
    sources: LegalSource[];
    contractAvailable: boolean;
    language: string;
};

export function legalAsk(req: LegalAskRequest): Promise<LegalAskResponse> {
    return apiFetch<LegalAskResponse>("/api/legal/ask", req);
}

// ── Legal: delete contract ────────────────────────────────────────────────────
export type DeleteContractResponse = {
    success: boolean;
    deleted: boolean;
};

export function deleteContract(contractToken: string): Promise<DeleteContractResponse> {
    return apiFetch<DeleteContractResponse>("/api/legal/delete-contract", { contractToken });
}
