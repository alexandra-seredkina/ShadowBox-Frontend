"use client";

import type { ReactElement } from "react";
import { FormError } from "@/features/auth/ui/form-error";
import { ReauthDialog } from "@/features/auth/ui/reauth-dialog";
import type { FolderOption } from "@/features/folder/model/folder-option";
import type { Locale } from "@/shared/i18n/locales";
import { Button } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/empty-state";
import { Spinner } from "@/shared/ui/spinner";
import { describeAliasError } from "../model/alias-error";
import { labelText, type AliasView } from "../model/alias-view";
import { useAliases } from "../model/use-aliases";
import { AliasCard } from "./alias-card";
import { AliasFormDialog } from "./alias-form-dialog";
import type { AliasesMessages } from "./aliases-messages";
import { RevokeAliasDialog } from "./revoke-alias-dialog";
import { useAliasDialogs, type AliasDialogs } from "./use-alias-dialogs";

type AliasesScreenProps = { readonly locale: Locale; readonly messages: AliasesMessages };

export function AliasesScreen({ locale, messages }: AliasesScreenProps): ReactElement {
  const { state, ...actions } = useAliases();
  const dialogs = useAliasDialogs(actions, messages);

  if (state.kind === "loading") {
    return (
      <p className="flex items-center justify-center gap-3 py-24 text-steel">
        <Spinner label={messages.common.loading} />
        {messages.page.loading}
      </p>
    );
  }
  if (state.kind === "failed") {
    const message = describeAliasError(state.error, { aliases: messages.page.errors, common: messages.auth.errors });
    return (
      <div className="mx-auto max-w-xl py-12">
        <FormError message={message} />
      </div>
    );
  }
  return <AliasList locale={locale} messages={messages} aliases={state.aliases} folders={state.folders} dialogs={dialogs} />;
}

type AliasListProps = AliasesScreenProps & {
  readonly aliases: readonly AliasView[];
  readonly folders: readonly FolderOption[];
  readonly dialogs: AliasDialogs;
};

function AliasList({ locale, messages, aliases, folders, dialogs }: AliasListProps): ReactElement {
  const text = messages.page;
  const { dialog } = dialogs;
  const editing = dialog?.kind === "edit" ? dialog.view : null;
  const revoking = dialog?.kind === "revoke" || dialog?.kind === "reauth" ? dialog.view : null;

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-8 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="font-display text-2xl font-medium sm:text-3xl">{text.title}</h1>
          <p className="max-w-xl text-steel">{text.lede}</p>
        </div>
        <Button onClick={dialogs.openCreate}>{text.create}</Button>
      </div>

      {aliases.length === 0 ? (
        <EmptyState title={text.empty.title} description={text.empty.text} />
      ) : (
        <ul className="grid gap-4">
          {aliases.map((view) => (
            <AliasCard
              key={view.alias.id}
              view={view}
              folders={folders}
              locale={locale}
              messages={messages}
              isBusy={dialogs.busyId === view.alias.id}
              onAction={(action) => (action === "toggle" ? void dialogs.toggle(view) : dialogs.open(action, view))}
            />
          ))}
        </ul>
      )}

      <AliasFormDialog
        key={dialog?.kind === "create" ? dialog.idempotencyKey : (editing?.alias.id ?? "closed")}
        mode={editing ? "edit" : "create"}
        isOpen={dialog?.kind === "create" || editing !== null}
        initial={{ label: editing ? labelText(editing) : "", folderId: editing?.alias.folderId ?? null }}
        folders={folders}
        messages={messages}
        onClose={dialogs.close}
        onSubmit={dialogs.submitForm}
      />
      <RevokeAliasDialog
        key={revoking?.alias.id ?? "closed"}
        isOpen={dialog?.kind === "revoke"}
        address={revoking?.alias.address ?? ""}
        messages={text.revoke}
        onClose={dialogs.close}
        onConfirm={() => (revoking ? dialogs.revoke(revoking) : Promise.resolve(null))}
      />
      <ReauthDialog
        isOpen={dialog?.kind === "reauth"}
        messages={messages.auth}
        common={messages.common}
        onClose={dialogs.close}
        onConfirmed={() => {
          if (revoking) void dialogs.revokeAfterReauth(revoking);
        }}
      />
    </div>
  );
}
