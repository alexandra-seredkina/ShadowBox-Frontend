import { completeRegistration, prepareRegistration } from "@/features/auth/model/register";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import { loadMockState, saveMockState } from "../mock-state";

export const TEST_PASSWORD = "correct horse battery staple";

const noProgress = (): void => undefined;

/** Signs up on the mock server and returns the key pair left unlocked in memory. */
export async function registerTestAccount(login: string): Promise<KeyPair> {
  const { prepared, ticket } = await prepareRegistration({ login, password: TEST_PASSWORD, onProgress: noProgress });
  await completeRegistration({ prepared, ticket, onPowProgress: noProgress });
  const keys = getUnlockedKeys();
  if (keys === null) throw new Error("Registration left the keys locked");
  return keys;
}

/**
 * Remembers the mock server as it is now and returns a function that puts it back.
 * Lets a test file sign up once (Argon2id with 64 MiB is slow) and still start every test clean.
 */
export function snapshotMockServer(): () => void {
  const snapshot = structuredClone(loadMockState());
  return () => saveMockState(structuredClone(snapshot));
}
