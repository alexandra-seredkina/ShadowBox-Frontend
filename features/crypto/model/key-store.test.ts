import { afterEach, describe, expect, it, vi } from "vitest";
import { generateKeyPair } from "./key-pair";
import { getUnlockedKeys, hasUnlockedKeys, lockKeys, storeUnlockedKeys, subscribeToKeys } from "./key-store";

afterEach(async () => {
  await lockKeys();
});

describe("key store", () => {
  it("starts locked", () => {
    expect(hasUnlockedKeys()).toBe(false);
  });

  it("keeps the unlocked key pair until locked", async () => {
    const keyPair = await generateKeyPair();

    await storeUnlockedKeys(keyPair);

    expect(getUnlockedKeys()).toBe(keyPair);
  });

  it("wipes the private key when locking", async () => {
    const keyPair = await generateKeyPair();
    await storeUnlockedKeys(keyPair);

    await lockKeys();

    expect(hasUnlockedKeys()).toBe(false);
    expect(keyPair.privateKey.every((byte) => byte === 0)).toBe(true);
  });

  it("notifies subscribers on every change", async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToKeys(listener);

    await storeUnlockedKeys(await generateKeyPair());
    await lockKeys();
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
