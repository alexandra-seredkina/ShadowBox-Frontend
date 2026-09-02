import type { KeyPair } from "./key-pair";
import { loadSodium } from "./sodium";

/**
 * D-005: the unlocked key pair lives only in this module's memory. Never in localStorage,
 * sessionStorage, IndexedDB or cookies, so a reload locks the inbox and `/unlock` asks again.
 */
let unlocked: KeyPair | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function getUnlockedKeys(): KeyPair | null {
  return unlocked;
}

export function hasUnlockedKeys(): boolean {
  return unlocked !== null;
}

/** Takes ownership of the key pair: it is wiped on the next `lockKeys`. */
export async function storeUnlockedKeys(keyPair: KeyPair): Promise<void> {
  await lockKeys();
  unlocked = keyPair;
  notify();
}

export async function lockKeys(): Promise<void> {
  if (unlocked === null) return;
  const sodium = await loadSodium();
  sodium.memzero(unlocked.privateKey);
  unlocked = null;
  notify();
}

/** For `useSyncExternalStore`. */
export function subscribeToKeys(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
