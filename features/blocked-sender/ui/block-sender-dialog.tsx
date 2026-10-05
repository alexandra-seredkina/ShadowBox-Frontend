"use client";

import { useState, type ReactElement } from "react";
import { ConfirmDialog } from "@/features/mailbox/ui/confirm-dialog";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";

type BlockSenderDialogProps = {
  readonly isOpen: boolean;
  readonly address: string;
  /** How many other loaded messages came from this address. */
  readonly otherCount: number;
  readonly messages: Messages["mailbox"]["view"]["blockDialog"];
  readonly onClose: () => void;
  readonly onConfirm: (moveOthers: boolean) => Promise<string | null>;
};

export function BlockSenderDialog({ isOpen, address, otherCount, messages, onClose, onConfirm }: BlockSenderDialogProps): ReactElement {
  const [moveOthers, setMoveOthers] = useState(true);
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={formatMessage(messages.title, { address })}
      description={messages.text}
      confirmLabel={messages.confirm}
      cancelLabel={messages.cancel}
      onClose={onClose}
      onConfirm={() => onConfirm(otherCount > 0 && moveOthers)}
    >
      {otherCount > 0 ? (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-steel">
          <input type="checkbox" checked={moveOthers} onChange={(event) => setMoveOthers(event.target.checked)} className="size-4 accent-red" />
          {messages.moveExisting}
        </label>
      ) : null}
    </ConfirmDialog>
  );
}
