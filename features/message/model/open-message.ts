import type { EncryptedBlob } from "@/features/crypto/model/encrypted-blob";
import { openBlob } from "@/features/crypto/model/encrypted-blob";
import type { KeyPair } from "@/features/crypto/model/key-pair";
import { isDangerousAttachment } from "./attachment-risk";

export type OpenedAttachment = {
  readonly filename: string;
  readonly mimeType: string;
  readonly content: Uint8Array<ArrayBuffer>;
  readonly isDangerous: boolean;
};

/** The decrypted message as the reader sees it. Parsed here, in the browser. */
export type OpenedMessage = {
  readonly from: { readonly name: string; readonly address: string };
  readonly subject: string;
  readonly html: string | null;
  readonly text: string | null;
  /** Files to download; pictures the HTML references inline are left out. */
  readonly attachments: readonly OpenedAttachment[];
};

function toBytes(content: ArrayBuffer | Uint8Array | string): Uint8Array<ArrayBuffer> {
  if (typeof content === "string") return new TextEncoder().encode(content);
  return content instanceof Uint8Array ? Uint8Array.from(content) : new Uint8Array(content);
}

export async function openMessage(body: EncryptedBlob, keyPair: KeyPair): Promise<OpenedMessage> {
  const mime = await openBlob(body, keyPair);
  const PostalMime = (await import("postal-mime")).default;
  const email = await PostalMime.parse(mime, { attachmentEncoding: "arraybuffer" });
  const mailbox = email.from?.group === undefined ? email.from : email.from.group[0];
  return {
    from: { name: mailbox?.name ?? "", address: mailbox?.address ?? "" },
    subject: email.subject ?? "",
    html: email.html ?? null,
    text: email.text ?? null,
    attachments: email.attachments
      .filter((attachment) => attachment.disposition !== "inline" && attachment.related !== true)
      .map((attachment) => {
        const filename = attachment.filename ?? "attachment";
        return {
          filename,
          mimeType: attachment.mimeType,
          content: toBytes(attachment.content),
          isDangerous: isDangerousAttachment(filename, attachment.mimeType),
        };
      }),
  };
}
