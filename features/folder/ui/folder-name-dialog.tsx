"use client";

import { useId, useState, type FormEvent, type ReactElement } from "react";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { FOLDER_NAME_MAX_LENGTH } from "../model/folder-option";

type FolderNameDialogProps = {
  readonly mode: "create" | "rename";
  readonly isOpen: boolean;
  readonly initialName: string;
  readonly messages: Messages["folders"]["form"];
  readonly onClose: () => void;
  /** Resolves to an error message to show, or null when the dialog may close. */
  readonly onSubmit: (name: string) => Promise<string | null>;
};

function findNameProblem(name: string, messages: Messages["folders"]["form"]): string | null {
  const length = [...name.trim()].length;
  if (length === 0) return messages.nameRequired;
  return length > FOLDER_NAME_MAX_LENGTH ? formatMessage(messages.nameTooLong, { max: FOLDER_NAME_MAX_LENGTH }) : null;
}

export function FolderNameDialog(props: FolderNameDialogProps): ReactElement {
  const { mode, isOpen, initialName, messages, onClose, onSubmit } = props;
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    const problem = findNameProblem(name, messages);
    if (problem !== null) {
      setError(problem);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setError(await onSubmit(name));
    setIsSubmitting(false);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={mode === "create" ? messages.createTitle : messages.renameTitle}>
      <form noValidate onSubmit={(event) => void submit(event)} className="grid gap-5">
        <Field id={`${id}-name`} label={messages.nameField} hint={messages.nameHint} error={error}>
          {(control) => (
            <Input {...control} name="name" defaultValue={initialName} autoComplete="off" maxLength={FOLDER_NAME_MAX_LENGTH * 2} />
          )}
        </Field>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>
            {messages.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? messages.saving : mode === "create" ? messages.submitCreate : messages.submitRename}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
