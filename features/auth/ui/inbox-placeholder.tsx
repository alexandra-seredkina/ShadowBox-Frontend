import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { EmptyState } from "@/shared/ui/empty-state";

/** Stands in for the inbox until the mail screens arrive. */
export function InboxPlaceholder({ messages }: { readonly messages: Messages["auth"]["app"] }): ReactElement {
  return <EmptyState title={messages.title} description={messages.text} />;
}
