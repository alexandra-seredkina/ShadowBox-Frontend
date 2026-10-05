import type { ReactElement, ReactNode } from "react";
import { joinClassNames } from "@/shared/lib/class-names";

type IconProps = {
  readonly className?: string;
  /** Filled shapes, e.g. a set star. */
  readonly isFilled?: boolean;
};

/** 24×24 line icons drawn for ShadowBox; decorative, so the control carries the label. */
function Icon({ className, isFilled = false, children }: IconProps & { readonly children: ReactNode }): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      fill={isFilled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={joinClassNames("size-[1.125rem] shrink-0", className)}
    >
      {children}
    </svg>
  );
}

export function InboxIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M3 13.5 5.6 5.4A2 2 0 0 1 7.5 4h9a2 2 0 0 1 1.9 1.4L21 13.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 13.5h5l1.5 2.5h5l1.5-2.5h5" />
    </Icon>
  );
}

export function ArchiveIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="4.5" rx="1" />
      <path d="M5 8.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5M10 12.5h4" />
    </Icon>
  );
}

export function SpamIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M4 7h16M9.5 7V4.5h5V7M6 7l1 12a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8L18 7M10 11v6M14 11v6" />
    </Icon>
  );
}

export function StarIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" />
    </Icon>
  );
}

export function FolderIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Icon>
  );
}

export function MoveIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M10 13.5h5M13 11l2.5 2.5L13 16" />
    </Icon>
  );
}

export function TagIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-2.1 0z" />
      <path d="M8 8h.01" />
    </Icon>
  );
}

export function MailIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </Icon>
  );
}

export function MailOpenIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M3 10v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9L12 3.5z" />
      <path d="m3.5 10.5 8.5 6 8.5-6" />
    </Icon>
  );
}

export function ShieldAlertIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z" />
      <path d="M12 8v4.5M12 15.8h.01" />
    </Icon>
  );
}

export function ShieldCheckIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </Icon>
  );
}

export function BlockIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function LinkIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
    </Icon>
  );
}

export function ExternalIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </Icon>
  );
}

export function AtIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.4 6.8" />
    </Icon>
  );
}

export function PaperclipIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M21 11.5 12.5 20a5 5 0 0 1-7-7L14 4.5a3.5 3.5 0 0 1 5 5L10.5 18a2 2 0 0 1-3-3L15 7.5" />
    </Icon>
  );
}

export function TimerIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9.5V13l2.5 1.5M9.5 3h5" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </Icon>
  );
}

export function BackIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function MenuIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function MoreIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth="2.6" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Icon>
  );
}

export function DownloadIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
    </Icon>
  );
}

export function RefreshIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M20 11a8 8 0 0 0-14.9-3.5M4 4v4h4M4 13a8 8 0 0 0 14.9 3.5M20 20v-4h-4" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}
