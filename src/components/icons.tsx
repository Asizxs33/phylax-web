/*
 * Единый набор линейных иконок SAQ.
 * Все — 24×24, stroke=currentColor, наследуют цвет и размер от родителя.
 * Стиль: тонкая линия 1.6, круглые концы — спокойный «сторожевой» характер.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/* ── расследование / поиск ── */
export const IconScan = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-3.5-3.5" />
    <path d="M11 8v6M8 11h6" strokeWidth={1.2} />
  </Base>
);

export const IconRadar = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3a9 9 0 1 0 9 9" />
    <path d="M12 12 20 6" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <path d="M12 12a4.5 4.5 0 0 0 4.4-3.6" strokeWidth={1.2} opacity={0.7} />
  </Base>
);

export const IconShield = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3 5 5.6v5.2c0 4.8 3 7.9 7 9.2 4-1.3 7-4.4 7-9.2V5.6L12 3Z" />
    <path d="m9 11.5 2 2 4-4" />
  </Base>
);

export const IconDossier = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3h8l4 4v14H6Z" />
    <path d="M14 3v4h4" />
    <path d="M9 12h6M9 15.5h6M9 8.5h2" strokeWidth={1.3} />
  </Base>
);

/* ── экосистема ── */
export const IconLens = (p: IconProps) => (
  <Base {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.2-4.2" />
    <circle cx="10.5" cy="10.5" r="2.6" strokeWidth={1.2} opacity={0.7} />
  </Base>
);

export const IconBroadcast = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 10v4l9 4V6l-9 4Z" />
    <path d="M13 8.5h3.5v7H13" />
    <path d="M19 7a7 7 0 0 1 0 10" strokeWidth={1.2} opacity={0.7} />
  </Base>
);

export const IconGraduation = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 9 12 5l9.5 4L12 13 2.5 9Z" />
    <path d="M6 11v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V11" />
    <path d="M21.5 9v4" strokeWidth={1.3} />
  </Base>
);

/* ── метод / шаги ── */
export const IconTarget = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
  </Base>
);

export const IconSatellite = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 13 11 7l3 3-6 6-3-3Z" />
    <path d="m3 15 2 2M15 8l2-2M13 4l3 3M20 11l-3-3" strokeWidth={1.3} />
    <path d="M14 14a4 4 0 0 0 4 4" strokeWidth={1.2} opacity={0.7} />
  </Base>
);

export const IconScore = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 18a8 8 0 1 1 16 0" />
    <path d="M12 18 16 9" />
    <path d="M4 18h16" strokeWidth={1.3} />
  </Base>
);

export const IconReport = IconDossier;

/* ── принципы ── */
export const IconBot = (p: IconProps) => (
  <Base {...p}>
    <rect x="5" y="8" width="14" height="11" rx="3" />
    <path d="M12 5v3M9 13h.01M15 13h.01" />
    <path d="M2.5 12v3M21.5 12v3" strokeWidth={1.3} />
  </Base>
);

export const IconWeb = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v18M3 12h18" strokeWidth={1.2} opacity={0.6} />
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" strokeWidth={1.2} opacity={0.6} />
  </Base>
);

export const IconScale = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v16M7 20h10" />
    <path d="M12 6 5 8l-2.5 5a3 3 0 0 0 5 0L5 8M12 6l7 2 2.5 5a3 3 0 0 1-5 0L19 8" />
  </Base>
);

export const IconUnlock = (p: IconProps) => (
  <Base {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 7.5-1.8" />
    <path d="M12 15v2" strokeWidth={1.3} />
  </Base>
);

/* ── источники ── */
export const IconGlobe = IconWeb;

export const IconNetwork = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="5" r="2.2" />
    <circle cx="5" cy="18" r="2.2" />
    <circle cx="19" cy="18" r="2.2" />
    <path d="M12 7.2 6.5 16M12 7.2 17.5 16M7 18h10" strokeWidth={1.3} />
  </Base>
);

export const IconBank = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 9 12 4l8 5" />
    <path d="M5 9v9M9 9v9M15 9v9M19 9v9" strokeWidth={1.3} />
    <path d="M3 21h18M3 9h18" />
  </Base>
);

export const IconCoin = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 0 1 0 3.5H9.5h4a1.8 1.8 0 0 1 0 3.5H9.5" strokeWidth={1.3} />
  </Base>
);

export const IconUser = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Base>
);

export const IconTor = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 4v16" />
    <path d="M12 7a5 5 0 0 1 0 10M12 9.5a2.5 2.5 0 0 1 0 5" strokeWidth={1.2} opacity={0.7} />
  </Base>
);

/* ── статус / вердикт ── */
export const IconAlert = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4 2.5 20h19L12 4Z" />
    <path d="M12 10v4M12 17h.01" strokeWidth={1.5} />
  </Base>
);

export const IconWarning = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8v5M12 16h.01" strokeWidth={1.5} />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.5 12 2.4 2.4 4.6-4.8" strokeWidth={1.5} />
  </Base>
);

export const IconWallet = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" strokeWidth={1.3} />
    <circle cx="16.5" cy="14.5" r="1.3" fill="currentColor" stroke="none" />
  </Base>
);

export const IconArrowDown = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Base>
);

/* ── рабочие панели расследования ── */
export const IconChat = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5Z" />
    <path d="M8.5 10h7" strokeWidth={1.3} opacity={0.7} />
  </Base>
);

export const IconClip = (p: IconProps) => (
  <Base {...p}>
    <path d="M16.5 8 9.8 14.7a2.1 2.1 0 0 0 3 3l6.7-6.7a4.2 4.2 0 0 0-6-6l-6.7 6.7a6.3 6.3 0 0 0 9 9L21 15" />
  </Base>
);

export const IconArchive = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4.5" width="18" height="4" rx="1.4" />
    <path d="M5 8.5V18a1.6 1.6 0 0 0 1.6 1.6h10.8A1.6 1.6 0 0 0 19 18V8.5" />
    <path d="M10 12h4" strokeWidth={1.3} />
  </Base>
);

export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" strokeWidth={1.5} />
  </Base>
);
