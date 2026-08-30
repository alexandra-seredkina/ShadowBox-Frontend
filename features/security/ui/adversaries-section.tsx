import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { Container } from "@/shared/ui/container";

type AdversariesSectionProps = {
  readonly messages: Messages["securityPage"]["adversaries"];
};

// On phones the rows stack, so the table never scrolls sideways.
export function AdversariesSection({ messages }: AdversariesSectionProps): ReactElement {
  return (
    <section aria-labelledby="adversaries" className="pb-20">
      <Container className="grid gap-8">
        <h2 id="adversaries" className="font-display text-xl font-medium text-balance sm:text-2xl">
          {messages.title}
        </h2>
        <table className="w-full border-collapse text-left">
          <thead className="max-sm:sr-only">
            <tr className="border-b border-line font-mono text-xs tracking-[0.12em] text-fog uppercase">
              <th scope="col" className="w-1/3 py-3 pr-6 font-normal">
                {messages.whoLabel}
              </th>
              <th scope="col" className="py-3 font-normal">
                {messages.getsLabel}
              </th>
            </tr>
          </thead>
          <tbody className="max-sm:grid max-sm:gap-6">
            {messages.rows.map((row) => (
              <tr key={row.who} className="border-b border-line max-sm:grid max-sm:gap-1 max-sm:pb-6">
                <th scope="row" className="py-4 pr-6 align-top font-medium max-sm:p-0">
                  {row.who}
                </th>
                <td className="py-4 text-steel max-sm:p-0">{row.gets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Container>
    </section>
  );
}
