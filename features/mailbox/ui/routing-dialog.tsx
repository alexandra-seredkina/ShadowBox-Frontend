"use client";

import { useState, type ReactElement } from "react";
import { labelText, type AliasView } from "@/features/alias/model/alias-view";
import { FormError } from "@/features/auth/ui/form-error";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Messages } from "@/shared/i18n/messages";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";

type RoutingDialogProps = {
  readonly isOpen: boolean;
  readonly title: string;
  readonly description: string;
  readonly aliases: readonly AliasView[];
  /** Whether new mail to this address already goes where the dialog is about. */
  readonly isRouted: (view: AliasView) => boolean;
  /** Where the address delivers now, when somewhere else; shown next to it. */
  readonly currentPlace?: (view: AliasView) => string | null;
  readonly messages: Messages["mailbox"]["routing"];
  readonly onClose: () => void;
  /** Gets the addresses whose state changed; resolves to an error message or null. */
  readonly onSave: (changed: ReadonlyMap<string, boolean>) => Promise<string | null>;
};

/** Which addresses deliver into a folder, or label their new mail: set from the folder or label side. */
export function RoutingDialog(props: RoutingDialogProps): ReactElement {
  const { isOpen, title, description, aliases, isRouted, currentPlace, messages, onClose, onSave } = props;
  const [changed, setChanged] = useState<ReadonlyMap<string, boolean>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function toggle(view: AliasView, isChecked: boolean): void {
    setChanged((current) => {
      const next = new Map(current);
      if (isChecked === isRouted(view)) next.delete(view.alias.id);
      else next.set(view.alias.id, isChecked);
      return next;
    });
  }

  async function save(): Promise<void> {
    setIsSaving(true);
    setError(null);
    setError(await onSave(changed));
    setIsSaving(false);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} description={description}>
      <div className="grid gap-5">
        {aliases.length === 0 ? (
          <p className="text-sm text-steel">{messages.noAddresses}</p>
        ) : (
          <ul className="-mx-2 grid max-h-80 gap-0.5 overflow-y-auto">
            {aliases.map((view) => {
              const isChecked = changed.get(view.alias.id) ?? isRouted(view);
              const place = isChecked ? null : (currentPlace?.(view) ?? null);
              const name = labelText(view);
              return (
                <li key={view.alias.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-control px-2 py-2 hover:bg-surface-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(event) => toggle(view, event.target.checked)}
                      className="size-4.5 accent-red"
                    />
                    <span className="grid min-w-0 flex-1">
                      {name ? <span className="truncate text-sm text-paper">{name}</span> : null}
                      <span className="truncate font-mono text-xs text-steel">{view.alias.address}</span>
                    </span>
                    {place ? <span className="shrink-0 text-xs text-fog">{formatMessage(messages.elsewhere, { name: place })}</span> : null}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        <FormError message={error} />
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" disabled={isSaving} onClick={onClose}>
            {messages.cancel}
          </Button>
          <Button disabled={isSaving || changed.size === 0} onClick={() => void save()}>
            {isSaving ? messages.saving : messages.save}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
