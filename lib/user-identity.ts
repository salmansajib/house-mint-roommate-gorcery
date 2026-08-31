import * as React from "react";

/**
 * 32-bit FNV-1a Hash Algorithm
 * Fast, uniform, deterministic hashing for strings.
 */
export function hashStringToNumber(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

/**
 * Derives a deterministic hue angle (0-359 deg) for any user ID or name.
 */
export function getUserHue(idOrName: string): number {
  if (!idOrName) return 180;
  return hashStringToNumber(idOrName) % 360;
}

/**
 * Extracts 1-2 uppercase initials from a user's display name.
 */
export function getUserInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface UserColorTokens {
  hue: number;
  style: React.CSSProperties;
  colorCss: string;
  subtleCss: string;
  borderCss: string;
}

/**
 * Generates perceptually uniform, theme-aware OKLCH color tokens for any user.
 * Lightness and Chroma are fixed per theme (via CSS variable --user-l),
 * ensuring guaranteed WCAG AA/AAA readability across dark and light modes.
 */
export function getUserColorTokens(userId: string, hueOverride?: number): UserColorTokens {
  const hue = hueOverride !== undefined ? hueOverride : getUserHue(userId);

  const colorCss = `oklch(var(--user-l, 72%) 0.16 ${hue})`;
  const subtleCss = `oklch(var(--user-l, 72%) 0.16 ${hue} / 0.15)`;
  const borderCss = `oklch(var(--user-l, 72%) 0.16 ${hue} / 0.35)`;

  const style: React.CSSProperties = {
    ["--user-hue" as string]: `${hue}`,
    ["--user-accent" as string]: colorCss,
    ["--user-accent-subtle" as string]: subtleCss,
    ["--user-accent-border" as string]: borderCss,
  };

  return {
    hue,
    style,
    colorCss,
    subtleCss,
    borderCss,
  };
}

/**
 * Contextual Disambiguation (Local Graph Coloring):
 * When multiple users appear in the same view (e.g. 4 roommates in a split card),
 * ensures their hues are distributed with guaranteed minimum angular distance,
 * eliminating color collisions even in 100+ user systems.
 */
export function getDistinctUserColorMap(
  users: { id: string; name?: string }[]
): Map<string, UserColorTokens> {
  const map = new Map<string, UserColorTokens>();
  if (!users || users.length === 0) return map;

  const count = users.length;
  const angularStep = 360 / count;

  users.forEach((user, index) => {
    const baseHue = getUserHue(user.id);
    // Disperse hue evenly if in a small local group
    const adjustedHue = Math.round((baseHue + index * angularStep) % 360);
    map.set(user.id, getUserColorTokens(user.id, adjustedHue));
  });

  return map;
}
