"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { getUnlockedKeys } from "@/features/crypto/model/key-store";
import { messageApi } from "../api/message-api";
import type { MessageSummary } from "../api/message-schemas";
import { prepareFrame, type PreparedFrame } from "./frame-html";
import { analyzeLinks, linksInText, type MailLink } from "./mail-links";
import { openMessage, type OpenedMessage } from "./open-message";

export type OpenedMessageState =
  | { readonly kind: "loading" }
  | { readonly kind: "failed"; readonly error: unknown }
  | {
      readonly kind: "ready";
      readonly summary: MessageSummary;
      readonly message: OpenedMessage;
      /** Null for plain-text mail. */
      readonly frame: PreparedFrame | null;
      readonly links: readonly MailLink[];
    };

export type OpenedMessageHandle = {
  readonly state: OpenedMessageState;
  /** The server returned a newer summary after an action on this message. */
  readonly setSummary: (summary: MessageSummary) => void;
};

async function load(messageId: string): Promise<Omit<Extract<OpenedMessageState, { kind: "ready" }>, "kind">> {
  const keys = getUnlockedKeys();
  // The app gate only renders mail screens with unlocked keys.
  if (keys === null) throw new Error("Keys are locked");
  const [summary, body] = await Promise.all([messageApi.loadMessage(messageId), messageApi.loadContent(messageId)]);
  const message = await openMessage(body, keys);
  // A dangerous message gets no live links inside the frame: they open only from the checked list.
  const frame = message.html === null ? null : prepareFrame(message.html, { areLinksDisabled: summary.threat.verdict === "danger" });
  const links = analyzeLinks(frame === null ? linksInText(message.text ?? "") : frame.links);
  return { summary, message, frame, links };
}

/**
 * Downloads, decrypts and parses one message. Opening an unread message marks it read;
 * `onRead` hears about it so the list and the counters follow.
 */
export function useOpenedMessage(messageId: string, onRead: (before: MessageSummary, after: MessageSummary) => void): OpenedMessageHandle {
  const [state, setState] = useState<OpenedMessageState>({ kind: "loading" });
  const reportRead = useEffectEvent(onRead);

  useEffect(() => {
    let isCurrent = true;
    load(messageId)
      .then(async (opened) => {
        if (!isCurrent) return;
        setState({ kind: "ready", ...opened });
        if (opened.summary.isRead) return;
        const read = await messageApi.updateMessage(messageId, { isRead: true });
        if (!isCurrent) return;
        setState((current) => (current.kind === "ready" ? { ...current, summary: read } : current));
        reportRead(opened.summary, read);
      })
      .catch((error: unknown) => {
        if (isCurrent) setState((current) => (current.kind === "ready" ? current : { kind: "failed", error }));
      });
    return () => {
      isCurrent = false;
    };
  }, [messageId]);

  const setSummary = useCallback((summary: MessageSummary) => {
    setState((current) => (current.kind === "ready" && current.summary.id === summary.id ? { ...current, summary } : current));
  }, []);

  return { state, setSummary };
}
