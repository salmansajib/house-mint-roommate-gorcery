"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getUserColorTokens, getUserInitials } from "@/lib/user-identity";

export interface UserBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  user: {
    id: string;
    name: string;
  };
  showDot?: boolean;
  showInitials?: boolean;
  hueOverride?: number;
  size?: "sm" | "md";
}

export function UserBadge({
  user,
  showDot = true,
  showInitials = false,
  hueOverride,
  size = "md",
  className,
  style,
  ...props
}: UserBadgeProps) {
  const { colorCss, subtleCss, borderCss, style: tokenStyle } =
    getUserColorTokens(user.id, hueOverride);

  const initials = getUserInitials(user.name);

  return (
    <span
      style={{
        ...tokenStyle,
        backgroundColor: subtleCss,
        borderColor: borderCss,
        color: colorCss,
        ...style,
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium select-none transition-colors",
        size === "sm"
          ? "px-2 py-0.5 text-[11px]"
          : "px-2.5 py-1 text-xs",
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className="size-1.5 rounded-full shrink-0 animate-pulse"
          style={{ backgroundColor: colorCss }}
        />
      )}
      {showInitials && (
        <span
          className="size-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
          style={{ backgroundColor: colorCss, color: "var(--background)" }}
        >
          {initials}
        </span>
      )}
      <span className="truncate max-w-[120px]">{user.name}</span>
    </span>
  );
}
