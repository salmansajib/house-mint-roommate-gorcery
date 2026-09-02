"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface HouseMintLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: "badge" | "glyph";
  className?: string;
}

/**
 * HouseMint Brand Logo & Icon Component
 * Concept 1: The Minted Token (Fintech Medallion)
 * Represents household finances, roommate shared expenses, and equal split in mint condition.
 */
export function HouseMintLogo({
  size = 32,
  variant = "glyph",
  className,
  ...props
}: HouseMintLogoProps) {
  const reactId = React.useId();
  const id = React.useMemo(() => reactId.replace(/[^a-zA-Z0-9]/g, ""), [reactId]);

  if (variant === "badge") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 select-none", className)}
        {...props}
      >
        <defs>
          <radialGradient id={`hmBgGrad_${id}`} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="var(--popover, #162e24)" />
            <stop offset="60%" stopColor="var(--card, #0e1a15)" />
            <stop offset="100%" stopColor="var(--background, #080c0a)" />
          </radialGradient>

          <linearGradient id={`hmTokenGrad_${id}`} x1="64" y1="64" x2="448" y2="448" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="30%" stopColor="#34d399" />
            <stop offset="70%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <radialGradient id={`hmCoinFace_${id}`} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--background, #080c0a)" stopOpacity="0.85" />
          </radialGradient>

          <linearGradient id={`hmHighlight_${id}`} x1="140" y1="126" x2="370" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Squircle Container Base */}
        <rect width="512" height="512" rx="116" fill={`url(#hmBgGrad_${id})`} />
        <rect
          width="508"
          height="508"
          x="2"
          y="2"
          rx="114"
          stroke="var(--primary, #10b981)"
          strokeOpacity="0.25"
          strokeWidth="2.5"
        />

        {/* Outer Minted Coin Ring */}
        <circle cx="256" cy="256" r="214" fill={`url(#hmCoinFace_${id})`} stroke={`url(#hmTokenGrad_${id})`} strokeWidth="14" />
        <circle
          cx="256"
          cy="256"
          r="188"
          stroke="var(--primary, #10b981)"
          strokeOpacity="0.25"
          strokeWidth="2"
          strokeDasharray="6 8"
        />

        {/* Precision Mint Stamps (Coin Edge Indices) */}
        <rect x="34" y="250" width="14" height="12" rx="4" fill="#38bdf8" />
        <rect x="464" y="250" width="14" height="12" rx="4" fill="#10b981" />

        {/* Architectural House Silhouette - Pitched Roof Crest */}
        <path
          d="M 256,126
             L 372,224
             C 378,229 379,239 373,246
             C 367,253 357,254 350,248
             L 256,168
             L 162,248
             C 155,254 145,253 139,246
             C 133,239 134,229 140,224
             Z"
          fill={`url(#hmTokenGrad_${id})`}
        />

        {/* Specular highlight on roof slope */}
        <path
          d="M 256,134 L 364,226"
          stroke={`url(#hmHighlight_${id})`}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* House Body & Negative Space Vault Archway */}
        <path
          d="M 174,258
             L 338,258
             C 346,258 352,264 352,272
             L 352,366
             C 352,374 346,380 338,380
             L 174,380
             C 166,380 160,374 160,366
             L 160,272
             C 160,264 166,258 174,258
             Z"
          fill={`url(#hmTokenGrad_${id})`}
        />

        {/* Vault Doorway Arch Cutout */}
        <path
          d="M 224,380
             L 224,312
             C 224,294 238,280 256,280
             C 274,280 288,294 288,312
             L 288,380
             Z"
          fill="var(--background, #080c0a)"
        />

        {/* Equal-Split Balance Ledger (=) inside Vault */}
        <rect x="238" y="324" width="36" height="7" rx="3.5" fill={`url(#hmTokenGrad_${id})`} />
        <rect x="238" y="342" width="36" height="7" rx="3.5" fill={`url(#hmTokenGrad_${id})`} />

        {/* Center Minted Coin Disc at Hearth */}
        <circle cx="256" cy="214" r="18" fill={`url(#hmTokenGrad_${id})`} />
        <circle cx="256" cy="214" r="11" fill="var(--background, #080c0a)" />
        <circle cx="256" cy="214" r="5" fill="#38bdf8" />
      </svg>
    );
  }

  // Pure Vector Glyph (Transparent, ideal for in-app headers, navbars, and buttons)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      <defs>
        <linearGradient id={`hmGlyphToken_${id}`} x1="64" y1="64" x2="448" y2="448" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="30%" stopColor="#34d399" />
          <stop offset="70%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={`hmGlyphHighlight_${id}`} x1="140" y1="126" x2="370" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer Minted Coin Ring */}
      <circle cx="256" cy="256" r="214" stroke={`url(#hmGlyphToken_${id})`} strokeWidth="16" />
      <circle
        cx="256"
        cy="256"
        r="188"
        stroke={`url(#hmGlyphToken_${id})`}
        strokeOpacity="0.3"
        strokeWidth="2.5"
        strokeDasharray="6 8"
      />

      {/* Precision Mint Stamps */}
      <rect x="34" y="250" width="14" height="12" rx="4" fill="#38bdf8" />
      <rect x="464" y="250" width="14" height="12" rx="4" fill="#10b981" />

      {/* Architectural House Roof */}
      <path
        d="M 256,126
           L 372,224
           C 378,229 379,239 373,246
           C 367,253 357,254 350,248
           L 256,168
           L 162,248
           C 155,254 145,253 139,246
           C 133,239 134,229 140,224
           Z"
        fill={`url(#hmGlyphToken_${id})`}
      />

      {/* Roof Highlight Line */}
      <path d="M 256,134 L 364,226" stroke={`url(#hmGlyphHighlight_${id})`} strokeWidth="3.5" strokeLinecap="round" />

      {/* House Body with Hollow Vault Archway (Compound Path with Even-Odd Rule) */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 174,258 L 338,258 C 346,258 352,264 352,272 L 352,366 C 352,374 346,380 338,380 L 174,380 C 166,380 160,374 160,366 L 160,272 C 160,264 166,258 174,258 Z
           M 224,380 L 224,312 C 224,294 238,280 256,280 C 274,280 288,294 288,312 L 288,380 Z"
        fill={`url(#hmGlyphToken_${id})`}
      />

      {/* Equal-Split Ledger (=) inside Hollow Vault */}
      <rect x="238" y="324" width="36" height="7" rx="3.5" fill={`url(#hmGlyphToken_${id})`} />
      <rect x="238" y="342" width="36" height="7" rx="3.5" fill={`url(#hmGlyphToken_${id})`} />

      {/* Center Minted Coin Medallion Ring & Pip */}
      <circle cx="256" cy="214" r="18" stroke={`url(#hmGlyphToken_${id})`} strokeWidth="4.5" />
      <circle cx="256" cy="214" r="4.5" fill="#38bdf8" />
    </svg>
  );
}
