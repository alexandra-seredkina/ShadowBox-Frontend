import type { ReactElement } from "react";
import type { Messages } from "@/shared/i18n/messages";
import { PixelTrail } from "@/shared/ui/pixel-trail";

const FRAME = "fill-ink stroke-paper";
const NODE_CENTERS = [100, 300, 500, 700] as const;

function Arrow({ from, to }: { readonly from: number; readonly to: number }): ReactElement {
  return (
    <path
      d={`M${from} 78H${to}m-8-6 8 6-8 6`}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="fill-none stroke-steel"
    />
  );
}

function Sender(): ReactElement {
  return (
    <g strokeWidth="3" strokeLinejoin="round">
      <rect x="60" y="50" width="80" height="56" rx="6" className={FRAME} />
      <path d="m62 54 38 28 38-28" className="fill-none stroke-paper" />
    </g>
  );
}

function Server(): ReactElement {
  return (
    <g>
      <g strokeWidth="3">
        <rect x="250" y="40" width="100" height="34" rx="6" className={FRAME} />
        <rect x="250" y="82" width="100" height="34" rx="6" className={FRAME} />
      </g>
      <circle cx="267" cy="57" r="4" className="fill-paper" />
      <circle cx="267" cy="99" r="4" className="fill-paper" />
      <path d="M335 98v-7a9 9 0 0 1 18 0v7" strokeWidth="3.5" className="fill-none stroke-red" />
      <rect x="328" y="97" width="32" height="25" rx="4" className="fill-red" />
    </g>
  );
}

function Storage(): ReactElement {
  return (
    <g>
      <rect x="452" y="44" width="62" height="68" rx="6" className="fill-paper" />
      <PixelTrail x={518} y={44} size={6} />
    </g>
  );
}

function Browser(): ReactElement {
  return (
    <g>
      <rect x="648" y="42" width="104" height="66" rx="6" strokeWidth="3" className={FRAME} />
      <path d="M634 114h132l-8 8H642z" className="fill-paper" />
      <g strokeWidth="2.5" strokeLinejoin="round">
        <path d="M676 92V68l24-14 24 14v24z" className={FRAME} />
        <path d="m676 68 24 14 24-14" className="fill-none stroke-paper" />
      </g>
      <circle cx="744" cy="96" r="7" strokeWidth="4" className="fill-none stroke-red" />
      <path d="M751 96h18v7h-5v-4h-4v5h-5v-5h-4z" className="fill-red" />
    </g>
  );
}

type MailFlowDiagramProps = {
  readonly names: readonly string[];
  readonly labels: Messages["securityPage"]["flow"]["diagram"];
};

/** Decorative: the same steps are written out as text next to it. */
export function MailFlowDiagram({ names, labels }: MailFlowDiagramProps): ReactElement {
  return (
    <svg viewBox="0 0 800 190" aria-hidden className="h-auto w-full">
      <Sender />
      <Arrow from={160} to={232} />
      <text x="196" y="64" fontSize="13" textAnchor="middle" className="fill-fog font-mono">
        {labels.smtp}
      </text>
      <Server />
      <Arrow from={372} to={432} />
      <Storage />
      <Arrow from={578} to={628} />
      <Browser />
      {NODE_CENTERS.map((x, index) => (
        <g key={x} textAnchor="middle">
          <text x={x} y="152" fontSize="16" className="fill-paper font-medium">
            {names[index]}
          </text>
          <text x={x} y="176" fontSize="13" className="fill-fog">
            {labels.captions[index]}
          </text>
        </g>
      ))}
    </svg>
  );
}
