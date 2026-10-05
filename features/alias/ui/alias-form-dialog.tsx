"use client";

import { useId, useState, type FormEvent, type ReactElement } from "react";
import { folderName } from "@/features/folder/model/folder-name";
import type { FolderOption } from "@/features/folder/model/folder-option";
import type { LabelOption } from "@/features/label/model/label-option";
import { FormError } from "@/features/auth/ui/form-error";
import { formatMessage } from "@/shared/i18n/format-message";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field } from "@/shared/ui/field";
import { Input, INPUT_CLASS_NAME } from "@/shared/ui/input";
import { ALIAS_TTLS, type Alias, type AliasTtl } from "../api/alias-schemas";
import { ALIAS_LABEL_MAX_LENGTH } from "../model/alias-view";
import type { AliasDraft } from "../model/use-aliases";
import { AliasKindPicker } from "./alias-kind-picker";
import type { AliasesMessages } from "./aliases-messages";

const DEFAULT_TTL: AliasTtl = "7d";
const INBOX_VALUE = "";

type AliasFormDialogProps = {
  readonly mode: "create" | "edit";
  readonly isOpen: boolean;
  /** Values to start from when editing. */
  readonly initial: { readonly label: string; readonly folderId: string | null; readonly labelIds: readonly string[] };
  readonly folders: readonly FolderOption[];
  readonly labels: readonly LabelOption[];
  readonly messages: AliasesMessages;
  readonly onClose: () => void;
  /** Resolves to an error message to show, or null when the dialog may close. */
  readonly onSubmit: (draft: AliasDraft) => Promise<string | null>;
};

function isTtl(value: string): value is AliasTtl {
  return ALIAS_TTLS.some((ttl) => ttl === value);
}

export function AliasFormDialog(props: AliasFormDialogProps): ReactElement {
  const { mode, isOpen, initial, folders, labels, messages, onClose, onSubmit } = props;
  const id = useId();
  const text = messages.page.form;
  const [kind, setKind] = useState<Alias["kind"]>("temporary");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const label = String(form.get("label") ?? "");
    if ([...label.trim()].length > ALIAS_LABEL_MAX_LENGTH) {
      setError(formatMessage(text.labelTooLong, { max: ALIAS_LABEL_MAX_LENGTH }));
      return;
    }
    const ttl = String(form.get("ttl") ?? DEFAULT_TTL);
    const folderId = String(form.get("folderId") ?? INBOX_VALUE);
    setIsSubmitting(true);
    setError(null);
    const labelIds = form.getAll("labelIds").map(String);
    const draft = { kind, ttl: isTtl(ttl) ? ttl : DEFAULT_TTL, label, folderId: folderId === INBOX_VALUE ? null : folderId, labelIds };
    setError(await onSubmit(draft));
    setIsSubmitting(false);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={mode === "create" ? text.createTitle : text.editTitle}>
      <form noValidate onSubmit={(event) => void submit(event)} className="grid gap-5">
        <FormError message={error} />
        {mode === "create" ? <AliasKindPicker kind={kind} onChange={setKind} messages={messages.page} /> : null}
        {mode === "create" && kind === "temporary" ? (
          <Field id={`${id}-ttl`} label={text.ttlLabel}>
            {(control) => (
              <select {...control} name="ttl" defaultValue={DEFAULT_TTL} className={INPUT_CLASS_NAME}>
                {ALIAS_TTLS.map((ttl) => (
                  <option key={ttl} value={ttl}>
                    {text.ttls[ttl]}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : null}
        <Field id={`${id}-label`} label={text.labelField} hint={text.labelHint}>
          {(control) => <Input {...control} name="label" defaultValue={initial.label} autoComplete="off" maxLength={ALIAS_LABEL_MAX_LENGTH * 2} />}
        </Field>
        <Field id={`${id}-folder`} label={text.folderField}>
          {(control) => (
            <select {...control} name="folderId" defaultValue={initial.folderId ?? INBOX_VALUE} className={INPUT_CLASS_NAME}>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.systemRole === "inbox" ? INBOX_VALUE : folder.id}>
                  {folderName(folder, messages.folders)}
                </option>
              ))}
            </select>
          )}
        </Field>
        {labels.length > 0 ? (
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">{text.labelsField}</legend>
            <div className="flex flex-wrap gap-2">
              {labels.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-2 rounded-control border border-line px-2.5 py-1.5 text-sm has-checked:border-fog has-checked:bg-surface-2"
                >
                  <input
                    type="checkbox"
                    name="labelIds"
                    value={option.id}
                    defaultChecked={initial.labelIds.includes(option.id)}
                    className="size-4 accent-red"
                  />
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: option.color }} />
                  {option.name ?? messages.page.form.unnamedLabel}
                </label>
              ))}
            </div>
            <p className="text-xs text-fog">{text.labelsHint}</p>
          </fieldset>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" disabled={isSubmitting} onClick={onClose}>
            {text.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? text.saving : mode === "create" ? text.submitCreate : text.submitEdit}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
