/**
 * src/api/contractToken.ts
 *
 * Keeps a guest's contract token on the device (signed-in users' contracts are
 * linked to their account instead). The token is the only key to the contract
 * stored on the server, so it goes in secure storage (see storage.ts).
 */
import { getItem, setItem, removeItem } from "./storage";

const KEY = "careconnect.contractToken";

export const loadContractToken = () => getItem(KEY);
export const saveContractToken = (token: string) => setItem(KEY, token);
export const clearContractToken = () => removeItem(KEY);
