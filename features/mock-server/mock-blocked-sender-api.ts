import type { BlockedSenderApi } from "@/features/blocked-sender/api/blocked-sender-api";
import type { BlockedSender } from "@/features/blocked-sender/api/blocked-sender-schemas";
import { mockFail, mockRespond } from "@/shared/api/mock-server";
import { senderKey } from "./mock-mail-delivery";
import { findSessionAccount, loadMockState, newId, saveMockState, today, type StoredBlockedSender } from "./mock-state";

/** API.md §8.1. */
const MAX_BLOCKED = 1000;

function view(blocked: StoredBlockedSender): BlockedSender {
  return { id: blocked.id, encryptedAddress: blocked.encryptedAddress, createdAt: blocked.createdAt };
}

const unauthenticated = (): Promise<never> => mockFail({ status: 401, code: "UNAUTHENTICATED" });

/** `/blocked-senders` on the shared mock server, following API.md §8.1 including error codes. */
export const mockBlockedSenderApi: BlockedSenderApi = {
  async listBlocked() {
    const stored = findSessionAccount(loadMockState());
    if (!stored) return unauthenticated();
    return mockRespond(stored.blockedSenders.map(view));
  },

  async block(address, encryptedAddress) {
    const state = loadMockState();
    const stored = findSessionAccount(state);
    if (!stored) return unauthenticated();
    if (!/^[^@\s]+@[^@\s]+$/.test(address)) {
      return mockFail({ status: 400, code: "VALIDATION_FAILED", details: [{ path: "address", issue: "invalid_format" }] });
    }
    const sender = await senderKey(stored, address);
    const existing = stored.blockedSenders.find((blocked) => blocked.sender === sender);
    if (existing) return mockRespond(view(existing));
    if (stored.blockedSenders.length >= MAX_BLOCKED) return mockFail({ status: 422, code: "BLOCK_LIMIT_EXCEEDED" });
    const blocked: StoredBlockedSender = { id: newId(), sender, encryptedAddress, createdAt: today() };
    stored.blockedSenders = [blocked, ...stored.blockedSenders];
    saveMockState(state);
    return mockRespond(view(blocked));
  },

  async unblock(id) {
    const state = loadMockState();
    const stored = findSessionAccount(state);
    if (!stored) return unauthenticated();
    if (!stored.blockedSenders.some((blocked) => blocked.id === id)) {
      return mockFail({ status: 404, code: "NOT_FOUND" });
    }
    stored.blockedSenders = stored.blockedSenders.filter((blocked) => blocked.id !== id);
    saveMockState(state);
    return mockRespond(undefined);
  },
};
