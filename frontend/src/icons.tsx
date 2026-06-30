import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

/* Base line-icon wrapper — inherits color via `currentColor`, sized via `size` prop. */
function Svg({ size = 24, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ── Navigation ─────────────────────────────────────────── */
export const HomeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 10.75 12 3l9 7.75" />
    <path d="M5.5 9.5V21h13V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </Svg>
);

export const CatalogIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3.5 6h.01" />
    <path d="M3.5 12h.01" />
    <path d="M3.5 18h.01" />
  </Svg>
);

export const PurchasesIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-3-1.8L12 21l-3-1.8L6 21V3Z" />
    <path d="M9.5 8.5h5" />
    <path d="M9.5 12h5" />
  </Svg>
);

export const ProfileIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </Svg>
);

/* ── Categories ─────────────────────────────────────────── */
export const FacebookIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M13.5 21v-7h2.4l.45-3h-2.85V9c0-.87.3-1.5 1.6-1.5h1.4V4.85C16.1 4.75 15.05 4.7 14 4.7c-2.3 0-3.9 1.4-3.9 4V11H7.5v3h2.6v7h3.4Z"
      fill="currentColor"
    />
  </svg>
);

export const ProxiesIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
  </Svg>
);

export const BmIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18" />
    <rect x="5" y="11" width="3.5" height="7" rx="1" />
    <rect x="10.25" y="6" width="3.5" height="12" rx="1" />
    <rect x="15.5" y="13" width="3.5" height="5" rx="1" />
  </Svg>
);

export const BusinessIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2.5" />
    <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" />
    <path d="M3 12.5h18" />
  </Svg>
);

export const AdsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 10v4a1 1 0 0 0 1 1h2l4 3.5V5.5L7 9H5a1 1 0 0 0-1 1Z" />
    <path d="M15 8.5a4 4 0 0 1 0 7" />
  </Svg>
);

/* Agency / ad-cabinet office building */
export const AgencyIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18" />
    <path d="M5 21V6a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15" />
    <path d="M14 21V10h4a1 1 0 0 1 1 1v10" />
    <path d="M8 8h2M8 11.5h2M8 15h2" />
  </Svg>
);

export const ToolsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.7 6.3a4 4 0 0 0-5.3 5.2l-5 5a1.6 1.6 0 0 0 2.3 2.3l5-5a4 4 0 0 0 5.2-5.3l-2.3 2.3-2-2 2.1-2.5Z" />
  </Svg>
);

export const OtherIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </Svg>
);

/* ── Money / commerce ───────────────────────────────────── */
export const BalanceIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10" />
    <path d="M14.6 9.4c0-1.1-1.2-2-2.6-2s-2.6.9-2.6 2 1.2 1.8 2.6 2 2.6.9 2.6 2-1.2 2-2.6 2-2.6-.9-2.6-2" />
  </Svg>
);

export const WalletIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="14" rx="2.5" />
    <path d="M3 10h18" />
    <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
  </Svg>
);

export const CartIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <path d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h7.7a1.5 1.5 0 0 0 1.5-1.2L20 8H6" />
  </Svg>
);

/* ── UI controls ────────────────────────────────────────── */
export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 7h17" />
    <path d="M3.5 12h17" />
    <path d="M3.5 17h17" />
  </Svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.2-3.2" />
  </Svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);

/* ── Menu / info ────────────────────────────────────────── */
export const SupportIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
    <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
    <path d="M20 19a3 3 0 0 1-3 3h-3" />
  </Svg>
);

export const TermsIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </Svg>
);

export const PartnersIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="9" r="3" />
    <path d="M3.5 19c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" />
    <circle cx="17" cy="8" r="2.5" />
    <path d="M16 14.2c2.4.2 4.5 1.7 4.5 4.3" />
  </Svg>
);

/* ── Brand mark ─────────────────────────────────────────── */
export const BlaLogo = ({ size = 40, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" {...props}>
    <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="#f5c518" />
    <path
      d="M14 11V29M14 11h7a4 4 0 0 1 0 8h-7M14 19h8a5 5 0 0 1 0 10h-8"
      stroke="#0a0a0a"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
