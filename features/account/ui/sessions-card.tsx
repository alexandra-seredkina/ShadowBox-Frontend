"use client";

import type { ReactElement } from "react";
import { formatDay } from "@/shared/i18n/format-date";
import { formatMessage } from "@/shared/i18n/format-message";
import type { Locale } from "@/shared/i18n/locales";
import type { Messages } from "@/shared/i18n/messages";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import type { SessionInfo } from "../api/account-api";

type SessionsCardProps = {
  readonly sessions: readonly SessionInfo[];
  readonly locale: Locale;
  readonly messages: Messages["settingsPage"]["sessions"];
  readonly busyId: string | null;
  readonly onEnd: (session: SessionInfo) => void;
  readonly onEndOthers: () => void;
};

export function SessionsCard({ sessions, locale, messages, busyId, onEnd, onEndOthers }: SessionsCardProps): ReactElement {
  const hasOthers = sessions.some((session) => !session.isCurrent);

  return (
    <Card className="grid gap-5">
      <div className="grid gap-1">
        <h2 className="font-display text-lg font-medium">{messages.title}</h2>
        <p className="text-sm text-steel">{messages.text}</p>
      </div>
      <ul className="grid gap-3">
        {sessions.map((session) => (
          <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <div className="grid gap-1">
              <p className="flex flex-wrap items-center gap-2 font-medium">
                {session.device}
                {session.isCurrent ? <Badge tone="safe">{messages.current}</Badge> : null}
                {session.isIpBound ? <Badge tone="alias">{messages.ipBound}</Badge> : null}
              </p>
              <p className="font-mono text-xs text-fog">
                {formatMessage(messages.dates, {
                  created: formatDay(session.createdAt, locale),
                  active: formatDay(session.lastActiveAt, locale),
                })}
              </p>
            </div>
            <Button variant="ghost" disabled={busyId !== null} onClick={() => onEnd(session)}>
              {session.isCurrent ? messages.endCurrent : messages.end}
            </Button>
          </li>
        ))}
      </ul>
      {hasOthers ? (
        <Button variant="ghost" disabled={busyId !== null} onClick={onEndOthers} className="justify-self-start">
          {messages.endOthers}
        </Button>
      ) : null}
    </Card>
  );
}
