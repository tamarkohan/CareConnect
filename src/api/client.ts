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

// ── Session token ─────────────────────────────────────────────────────────────
// Set after sign-in (see AppContext); sent with every request.
let authToken: string | null = null;
export function setAuthToken(token: string | null) {
    authToken = token;
}

/** Error from the backend, with its machine-readable code when there is one. */
export class ApiError extends Error {
    status: number;
    code?: string;
    constructor(message: string, status: number, code?: string) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

// ── Generic helper ────────────────────────────────────────────────────────────
async function apiFetch<T>(
    path: string,
    body?: object,
    method: "GET" | "POST" = body ? "POST" : "GET"
): Promise<T> {
    const headers: Record<string, string> = {};
    if (body) headers["Content-Type"] = "application/json";
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new ApiError(data?.error ?? `HTTP ${res.status}`, res.status, data?.code);
    }

    return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export type User = {
    id: string;
    phone: string | null;
    email: string | null;
    disclaimerVersion: number | null;
    isDemo: boolean;
};

export type Identifier = { phone: string } | { email: string };
export type SignInResponse = { token: string; user: User };

export const getAuthOptions = () =>
    apiFetch<{ phone: boolean; email: boolean; demo: boolean }>("/api/auth/options");

/** Sends a code. The demo number signs in at once and returns a token instead. */
export const requestCode = (id: Identifier) =>
    apiFetch<{ sent: true } | SignInResponse>("/api/auth/request-code", id);

export const verifyCode = (id: Identifier, code: string) =>
    apiFetch<SignInResponse>("/api/auth/verify-code", { ...id, code });

export const getMe = () => apiFetch<{ user: User }>("/api/auth/me");

export const updateMe = (changes: { disclaimerVersion: number }) =>
    apiFetch<{ user: User }>("/api/auth/me", changes);

export const logout = () => apiFetch<{ success: true }>("/api/auth/logout", {});

// ── Translate ─────────────────────────────────────────────────────────────────
export type TranslationContext = "general" | "medical" | "transit" | "slang";

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
    /** Optional hint; normally the server works out the kind of text itself. */
    context?: TranslationContext;
    /** App language code ("en", "tl"…): Hebrew pronunciation is written in its alphabet. */
    readerLanguage?: string;
    /** false = don't add to the user's history (e.g. voice input for the assistant). */
    save?: boolean;
};

export type TranslateResponse = {
    translatedText: string;
    detectedLanguage: string;
    sourceText: string;
    phonetic: string;
    note: string;
    category: TranslationContext;
    /** Other likely meanings when the text is ambiguous (e.g. "hola"). */
    alternatives?: { language: string; meaning: string }[];
    /** Set when the translation was saved to the signed-in user's history. */
    id?: string;
    createdAt?: string;
};

export type SavedTranslation = TranslateResponse & {
    id: string;
    createdAt: string;
    inputType: "text" | "image" | "audio";
    targetLanguage: string;
};

export function translateText(req: TranslateRequest): Promise<TranslateResponse> {
    return apiFetch<TranslateResponse>("/api/translate", req);
}

export const getTranslationHistory = () =>
    apiFetch<{ translations: SavedTranslation[] }>("/api/translate/history");

export const clearTranslationHistory = () =>
    apiFetch<{ success: true }>("/api/translate/clear-history", {});

// ── Legal: contract ───────────────────────────────────────────────────────────
export const SUMMARY_FIELDS = [
    "employer", "agency", "startDate", "salary", "workingHours", "restDay",
    "vacation", "sickLeave", "deductions", "noticePeriod",
] as const;
export type SummaryField = (typeof SUMMARY_FIELDS)[number];
export type ContractSummaryLang = Record<SummaryField, string | null> & { concerns: string[] };
/** One summary per app language, so switching language never needs the AI again. */
export type ContractSummary = Record<"en" | "tl" | "ml" | "ru", ContractSummaryLang>;

export type ContractInfo = {
    fileName: string | null;
    summary: ContractSummary | null;
    updatedAt: string;
};

export type UploadContractRequest = {
    contractText: string;
    /** Guests: send the existing token to replace that contract instead of creating a new one. */
    contractToken?: string;
};

export type UploadContractResponse = {
    success: boolean;
    /** Guests only: secret key to this contract. Keep it on the device (see contractToken.ts). */
    contractToken: string | null;
    characterCount: number;
    contract: ContractInfo;
};

export function uploadContract(req: UploadContractRequest): Promise<UploadContractResponse> {
    return apiFetch<UploadContractResponse>("/api/legal/upload-contract", req);
}

export type ContractFile = { base64: string; mimeType?: string; name?: string };

/** One PDF / Word file, or up to 5 photos. */
export function uploadContractFile(files: ContractFile[], contractToken?: string) {
    return apiFetch<UploadContractResponse>("/api/legal/upload-contract-file", { files, contractToken });
}

export const getContract = () => apiFetch<{ contract: ContractInfo | null }>("/api/legal/contract");

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

export type LegalMessage = {
    id: string;
    role: "user" | "assistant";
    text: string;
    sources?: LegalSource[];
    /** App language when it was written ("English", "Tagalog"…), null for old messages. */
    language: string | null;
    createdAt: string;
};

/** Translates earlier chat messages into the new app language (nothing is stored). */
export const translateMessages = (language: string, messages: { id: string; text: string }[]) =>
    apiFetch<{ translations: Record<string, string> }>("/api/legal/translate-messages", { language, messages });

export const getLegalHistory = () => apiFetch<{ messages: LegalMessage[] }>("/api/legal/history");

export const clearLegalHistory = () => apiFetch<{ success: true }>("/api/legal/clear-history", {});

// ── Legal: delete contract ────────────────────────────────────────────────────
export type DeleteContractResponse = {
    success: boolean;
    deleted: boolean;
};

/** Signed in: deletes the user's contract. Guests: pass their contract token. */
export function deleteContract(contractToken?: string): Promise<DeleteContractResponse> {
    return apiFetch<DeleteContractResponse>("/api/legal/delete-contract", { contractToken });
}
