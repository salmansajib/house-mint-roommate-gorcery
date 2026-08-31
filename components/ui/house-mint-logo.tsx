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
 * Represents Concept 1 (Option B): Geometric house silhouette crowned with a crisp mint leaf crest.
 */
export function HouseMintLogo({
  size = 32,
  variant = "glyph",
  className,
  ...props
}: HouseMintLogoProps) {
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
          <radialGradient id="hmLogoBg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="var(--popover, #16211e)" />
            <stop offset="60%" stopColor="var(--card, #0f1614)" />
            <stop offset="100%" stopColor="var(--background, #080c0a)" />
          </radialGradient>
          <linearGradient id="hmBadgeMint" x1="256" y1="86" x2="256" y2="432" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="45%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="hmBadgeRoof" x1="120" y1="210" x2="392" y2="432" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Rounded Container */}
        <rect width="512" height="512" rx="116" fill="url(#hmLogoBg)" />
        <rect
          width="508"
          height="508"
          x="2"
          y="2"
          rx="114"
          stroke="var(--primary, #10b981)"
          strokeOpacity="0.28"
          strokeWidth="2.5"
        />

        {/* House Foundation & Walls */}
        <path
          d="M172 268 L124 306 L154 306 L154 424 C154 428.418 157.582 432 162 432 L350 432 C354.418 432 358 428.418 358 424 L358 306 L388 306 L340 268"
          fill="url(#hmBadgeMint)"
        />

        {/* Door & Window Cutouts */}
        <rect x="238" y="342" width="36" height="90" rx="4" fill="var(--background, #080c0a)" />
        <rect x="180" y="324" width="30" height="38" rx="4" fill="var(--background, #080c0a)" />

        {/* Mint Leaf Crest */}
        <path
          d="M256 86
             C270 120 292 136 304 150
             C320 168 322 192 316 216
             C312 230 300 244 286 256
             C274 266 264 274 256 288
             C248 274 238 266 226 256
             C212 244 200 230 196 216
             C190 192 192 168 208 150
             C220 136 242 120 256 86 Z"
          fill="url(#hmBadgeMint)"
        />

        {/* Central Leaf Vein */}
        <path d="M256 102 L256 272" stroke="var(--background, #080c0a)" strokeWidth="8" strokeLinecap="round" />

        {/* Branching Veins */}
        <path d="M256 142 Q280 156 296 172" stroke="var(--background, #080c0a)" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M256 142 Q232 156 216 172" stroke="var(--background, #080c0a)" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M256 190 Q278 206 292 224" stroke="var(--background, #080c0a)" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M256 190 Q234 206 220 224" stroke="var(--background, #080c0a)" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M256 236 Q270 248 278 260" stroke="var(--background, #080c0a)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M256 236 Q242 248 234 260" stroke="var(--background, #080c0a)" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Roof Gable Wings */}
        <path d="M138 296 L226 230 C222 236 218 244 216 252 L150 302 Z" fill="url(#hmBadgeRoof)" opacity="0.85" />
        <path d="M374 296 L286 230 C290 236 294 244 296 252 L362 302 Z" fill="url(#hmBadgeRoof)" opacity="0.85" />
      </svg>
    );
  }

  // Pure Vector Glyph (Transparent, ideal for in-app headers, navbars, and buttons)
  return (
    <svg
      width={size}
      height={size}
      viewBox="110 70 292 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      <defs>
        <linearGradient id="hmGlyphMint" x1="256" y1="86" x2="256" y2="432" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="hmGlyphRoof" x1="120" y1="210" x2="392" y2="432" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      {/* House Foundation & Walls */}
      <path
        d="M172 268 L124 306 L154 306 L154 424 C154 428.418 157.582 432 162 432 L350 432 C354.418 432 358 428.418 358 424 L358 306 L388 306 L340 268"
        fill="url(#hmGlyphMint)"
      />

      {/* Cutout Door and Window */}
      <rect x="238" y="342" width="36" height="90" rx="4" fill="var(--card, #0f1614)" />
      <rect x="180" y="324" width="30" height="38" rx="4" fill="var(--card, #0f1614)" />

      {/* Stylized Mint Leaf Crest */}
      <path
        d="M256 86
           C270 120 292 136 304 150
           C320 168 322 192 316 216
           C312 230 300 244 286 256
           C274 266 264 274 256 288
           C248 274 238 266 226 256
           C212 244 200 230 196 216
           C190 192 192 168 208 150
           C220 136 242 120 256 86 Z"
        fill="url(#hmGlyphMint)"
      />

      {/* Vein Ribs */}
      <path d="M256 102 L256 272" stroke="var(--card, #0f1614)" strokeWidth="8" strokeLinecap="round" />
      <path d="M256 142 Q280 156 296 172" stroke="var(--card, #0f1614)" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M256 142 Q232 156 216 172" stroke="var(--card, #0f1614)" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M256 190 Q278 206 292 224" stroke="var(--card, #0f1614)" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M256 190 Q234 206 220 224" stroke="var(--card, #0f1614)" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M256 236 Q270 248 278 260" stroke="var(--card, #0f1614)" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M256 236 Q242 248 234 260" stroke="var(--card, #0f1614)" strokeWidth="6" strokeLinecap="round" fill="none" />

      {/* Roof Wings */}
      <path d="M138 296 L226 230 C222 236 218 244 216 252 L150 302 Z" fill="url(#hmGlyphRoof)" opacity="0.85" />
      <path d="M374 296 L286 230 C290 236 294 244 296 252 L362 302 Z" fill="url(#hmGlyphRoof)" opacity="0.85" />
    </svg>
  );
}
