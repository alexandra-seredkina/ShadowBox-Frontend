import type { ReactElement } from "react";
import { PixelTrail } from "@/shared/ui/pixel-trail";

const FRAME = "fill-ink stroke-paper";

type SignUpLabels = { readonly login: string; readonly password: string };

export function SignUpIllustration({ labels }: { readonly labels: SignUpLabels }): ReactElement {
  return (
    <svg viewBox="0 0 240 160" aria-hidden className="h-auto w-full">
      <rect x="44" y="14" width="152" height="132" rx="12" strokeWidth="3" className={FRAME} />
      <rect x="62" y="32" width="116" height="24" rx="6" strokeWidth="2" className={FRAME} />
      <rect x="62" y="64" width="116" height="24" rx="6" strokeWidth="2" className={FRAME} />
      <text x="72" y="48.5" fontSize="13" className="fill-fog">
        {labels.login}
      </text>
      <text x="72" y="80.5" fontSize="13" className="fill-fog">
        {labels.password}
      </text>
      <path
        d="M113 106c2-2 5-2 6 0l3 4c1 2 0 3-1 4l-2 1c1 3 4 6 7 7l1-2c1-1 3-2 4-1l4 3c2 1 2 4 0 6-3 3-7 4-11 2-6-3-11-8-13-14-1-4 0-8 2-10z"
        className="fill-paper"
      />
      <circle cx="122" cy="118" r="18" strokeWidth="3.5" className="fill-none stroke-red" />
      <path d="m109 105 26 26" strokeWidth="3.5" strokeLinecap="round" className="stroke-red" />
    </svg>
  );
}


function Envelope({ x, y, isAccent }: { readonly x: number; readonly y: number; readonly isAccent: boolean }): ReactElement {
  const stroke = isAccent ? "stroke-red" : "stroke-paper";
  return (
    <g strokeWidth="2.5" strokeLinejoin="round">
      <rect x={x} y={y} width="36" height="25" rx="3" className={`fill-ink ${stroke}`} />
      <path d={`M${x + 1} ${y + 2}l17 12 17-12`} className={`fill-none ${stroke}`} />
    </g>
  );
}

const ENVELOPE_ROWS = [12, 47, 82, 117] as const;

export function AddressesIllustration({ labels }: { readonly labels: readonly string[] }): ReactElement {
  return (
    <svg viewBox="0 0 240 160" aria-hidden className="h-auto w-full">
      <circle cx="40" cy="62" r="15" className="fill-paper" />
      <path d="M14 110a26 26 0 0 1 52 0z" className="fill-paper" />
      <path
        d="M74 86h20M94 24.5v105M94 24.5h14M94 59.5h14M94 94.5h14M94 129.5h14"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="fill-none stroke-paper"
      />
      {ENVELOPE_ROWS.map((y, index) => (
        <g key={y}>
          <Envelope x={112} y={y} isAccent={index === 3} />
          <text x="156" y={y + 17} fontSize="14" className="fill-steel">
            {labels[index]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function PrivateReadingIllustration(): ReactElement {
  return (
    <svg viewBox="0 0 240 160" aria-hidden className="h-auto w-full">
      <path d="M150 34v92h-90a8 8 0 0 1-8-8V42a8 8 0 0 1 8-8z" className="fill-paper" />
      <rect x="62" y="44" width="78" height="72" rx="3" className="fill-night" />
      <path d="m64 48 37 30 37-30M64 112l26-24M138 112l-26-24" strokeWidth="5" className="fill-none stroke-paper" />
      <PixelTrail x={152} y={34} size={8} />
      <circle cx="150" cy="122" r="13" strokeWidth="7" className="fill-none stroke-red" />
      <path d="M163 122h40v14h-8v-8h-6v10h-8v-10h-18z" className="fill-red" />
    </svg>
  );
}
