import { sealBlob, sealJson } from "@/features/crypto/model/encrypted-blob";
import { fromBase64Url, loadSodium, toBase64Url } from "@/features/crypto/model/sodium";
import type { MessagePreview, Threat, ThreatMarker } from "@/features/message/api/message-schemas";
import { buildMime, type MimeAttachment } from "./mock-mime";
import { newId, today, type StoredAccount, type StoredMessage } from "./mock-state";

const SNIPPET_LENGTH = 200;
const KIB = 1024;

/** A message as it arrives over SMTP, plus what the server's checks would find in it. */
export type IncomingMail = {
  readonly from: { readonly name: string; readonly address: string };
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
  readonly attachments?: readonly MimeAttachment[];
  /** Everything except UNKNOWN_SENDER, which delivery works out itself. */
  readonly markers: readonly Exclude<ThreatMarker, "UNKNOWN_SENDER">[];
  readonly auth: Threat["auth"];
};

function verdictOf(markers: readonly ThreatMarker[]): Threat["verdict"] {
  if (markers.some((marker) => marker !== "UNKNOWN_SENDER")) return "danger";
  return markers.length > 0 ? "caution" : "safe";
}

/** Mirrors D-009 closely enough for the mock: a keyed hash, never the address itself. */
export async function senderKey(stored: StoredAccount, address: string): Promise<string> {
  const sodium = await loadSodium();
  return toBase64Url(sodium, sodium.crypto_generichash(16, `${stored.publicKey}:${address.toLowerCase()}`, null));
}

export type SortKey = Pick<StoredMessage, "receivedAt" | "id">;

/** `receivedAt` descending, then id: the order keyset pagination walks. */
export function newestFirst(a: SortKey, b: SortKey): number {
  return b.receivedAt.localeCompare(a.receivedAt) || b.id.localeCompare(a.id);
}

function previewOf(mail: IncomingMail): MessagePreview {
  return {
    from: mail.from,
    subject: mail.subject,
    snippet: mail.text.replace(/\s+/g, " ").trim().slice(0, SNIPPET_LENGTH),
    hasAttachments: (mail.attachments ?? []).length > 0,
  };
}

/**
 * What the backend does on LMTP delivery (D-011): checks, preview, everything sealed with the
 * owner's public key. The mock keeps only what the real database would hold.
 */
export async function deliverMail(params: {
  readonly stored: StoredAccount;
  readonly aliasId: string;
  readonly mail: IncomingMail;
  readonly receivedAt: Date;
}): Promise<StoredMessage> {
  const { stored, aliasId, mail, receivedAt } = params;
  const alias = stored.aliases.find((candidate) => candidate.id === aliasId);
  const inbox = stored.folders.find((folder) => folder.systemRole === "inbox");
  const spam = stored.folders.find((folder) => folder.systemRole === "spam");
  if (!alias || !inbox || !spam) throw new Error("Mock delivery needs an alias, an inbox and a spam folder");

  const sodium = await loadSodium();
  const publicKey = fromBase64Url(sodium, stored.publicKey);
  const sender = await senderKey(stored, mail.from.address);
  const isKnownSender = stored.knownSenders.includes(sender);
  const isBlocked = stored.blockedSenders.some((blocked) => blocked.sender === sender);
  const markers: ThreatMarker[] = isKnownSender ? [...mail.markers] : ["UNKNOWN_SENDER", ...mail.markers];
  const mime = new TextEncoder().encode(
    buildMime({ ...mail, to: alias.address, date: receivedAt, html: mail.html ?? null, attachments: mail.attachments ?? [] }),
  );

  const message: StoredMessage = {
    id: newId(),
    folderId: isBlocked ? spam.id : (alias.folderId ?? inbox.id),
    aliasId,
    receivedAt: receivedAt.toISOString(),
    isRead: false,
    isStarred: false,
    labelIds: [...alias.labelIds],
    sizeBytes: Math.ceil(mime.length / KIB) * KIB,
    threat: { verdict: verdictOf(markers), markers, auth: mail.auth },
    encryptedPreview: await sealJson(previewOf(mail), publicKey),
    body: await sealBlob(mime, publicKey),
  };
  if (!isKnownSender) stored.knownSenders.push(sender);
  stored.messages = [message, ...stored.messages].sort(newestFirst);
  stored.aliases = stored.aliases.map((item) => (item.id === aliasId ? { ...item, lastReceivedAt: today() } : item));
  return message;
}
