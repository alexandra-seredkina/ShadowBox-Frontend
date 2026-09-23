import { messageApi } from "../api/message-api";
import { MAX_BATCH_IDS } from "../api/message-schemas";
import type { MessageChange } from "./message-row";

function chunksOf<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) chunks.push(items.slice(start, start + size));
  return chunks;
}

/** One `POST /messages/batch` per 100 ids; returns how many messages the server changed. */
export async function runBatch(ids: readonly string[], change: MessageChange): Promise<number> {
  let processed = 0;
  for (const chunk of chunksOf(ids, MAX_BATCH_IDS)) processed += await messageApi.batch({ ids: chunk, ...change });
  return processed;
}
