"use client";

import { useId, useState, type FormEvent, type ReactElement } from "react";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { joinClassNames } from "@/shared/lib/class-names";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field } from "@/shared/ui/field";
import { CheckIcon } from "@/shared/ui/icons";
import { Input } from "@/shared/ui/input";
import { LABEL_COLORS, LABEL_NAME_MAX_LENGTH, type LabelColor } from "../model/label-option";

type LabelFormDialogProps = {
  readonly mode: "create" | "edit";
  readonly isOpen: boolean;
  readonly initialName: string;
  readonly initialColor: LabelColor;
  readonly messages: Messages["mailbox"]["labelForm"];
  readonly onClose: () => void;
  /** Resolves to an error message to show, or null when the dialog may close. */
  readonly onSubmit: (name: string, color: LabelColor) => Promise<string | null>;
};

function findNameProblem(name: string, messages: Messages["mailbox"]["labelForm"]): string | null {
  const length = [...name.trim()].length;
  if (length === 0) return messages.nameRequired;
  return length > LABEL_NAME_MAX_LENGTH ? formatMessage(messages.nameTooLong, { max: LABEL_NAME_MAX_LENGTH }) : null;
}

export function LabelFormDialog(props: LabelFormDialogProps): ReactElement {
  const { mode, isOpen, initialName, initialColor, messages, onClose, onSubmit } = props;
  const id = useId();
  const [color, setColor] = useState<LabelColor>(initialColor);
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
    setError(await onSubmit(name, color));
    setIsSubmitting(false);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={mode === "create" ? messages.createTitle : messages.editTitle}>
      <form noValidate onSubmit={(event) => void submit(event)} className="grid gap-5">
        <Field id={`${id}-name`} label={messages.nameField} hint={messages.nameHint} error={error}>
          {(control) => (
            <Input {...control} name="name" defaultValue={initialName} autoComplete="off" maxLength={LABEL_NAME_MAX_LENGTH * 2} />
          )}
        </Field>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium text-paper">{messages.colorField}</legend>
          <div className="flex flex-wrap gap-2">
            {LABEL_COLORS.map((option) => (
              <button
                key={option}
                type="button"
                aria-label={formatMessage(messages.colorOption, { color: option })}
                aria-pressed={option === color}
                onClick={() => setColor(option)}
                style={{ backgroundColor: option }}
                className={joinClassNames(
                  "grid size-8 place-items-center rounded-full text-night transition-transform",
                  option === color ? "ring-2 ring-paper ring-offset-2 ring-offset-surface" : "hover:scale-110",
                )}
              >
                {option === color ? <CheckIcon className="size-4" /> : null}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>
            {messages.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? messages.saving : mode === "create" ? messages.submitCreate : messages.submitEdit}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
