"use client";

import { Suspense, useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { MailboxAliasesProvider } from "@/features/alias/ui/mailbox-aliases-context";
import { FoldersProvider } from "@/features/folder/ui/folders-context";
import { LabelsProvider } from "@/features/label/ui/labels-context";
import type { Locale } from "@/shared/i18n/locales";
import { IconButton } from "@/shared/ui/icon-button";
import { CloseIcon } from "@/shared/ui/icons";
import { MailboxDrawerContext } from "./mailbox-drawer";
import type { MailboxMessages } from "./mailbox-messages";
import { MailboxSidebar } from "./mailbox-sidebar";

type MailboxShellProps = {
  readonly locale: Locale;
  readonly messages: MailboxMessages;
  readonly children: ReactNode;
};

/** Folders and labels on the left; on narrow screens they slide in as a drawer. */
export function MailboxShell({ locale, messages, children }: MailboxShellProps): ReactElement {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawer = useMemo(() => ({ open: () => setIsDrawerOpen(true) }), []);

  useEffect(() => {
    if (!isDrawerOpen) return undefined;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setIsDrawerOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen]);

  return (
    <FoldersProvider>
      <LabelsProvider>
        <MailboxAliasesProvider>
          <MailboxDrawerContext value={drawer}>
            <div className="-mx-4 grid h-full min-h-0 grid-cols-[minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)]">
              <aside className="hidden min-h-0 border-r border-line lg:block">
                <MailboxSidebar locale={locale} messages={messages} />
              </aside>
              {isDrawerOpen ? (
                <div className="fixed inset-0 z-40 lg:hidden">
                  <button
                    type="button"
                    aria-label={messages.mailbox.closeMenu}
                    onClick={() => setIsDrawerOpen(false)}
                    className="absolute inset-0 bg-night/70 backdrop-blur-sm"
                  />
                  <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-ink">
                    <div className="flex justify-end px-2 pt-2">
                      <IconButton label={messages.mailbox.closeMenu} icon={<CloseIcon />} onClick={() => setIsDrawerOpen(false)} />
                    </div>
                    <div className="min-h-0 flex-1">
                      <MailboxSidebar locale={locale} messages={messages} onNavigate={() => setIsDrawerOpen(false)} />
                    </div>
                  </aside>
                </div>
              ) : null}
              <div className="min-h-0 min-w-0">
                <Suspense fallback={null}>{children}</Suspense>
              </div>
            </div>
          </MailboxDrawerContext>
        </MailboxAliasesProvider>
      </LabelsProvider>
    </FoldersProvider>
  );
}
