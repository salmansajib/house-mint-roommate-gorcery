"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { getUserColorTokens, getUserInitials } from "@/lib/user-identity";

export interface UserAvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showRing?: boolean;
  hueOverride?: number;
}

const sizeClasses = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm font-semibold",
  lg: "size-12 text-base font-bold",
  xl: "size-16 text-lg font-bold",
};

export const UserAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  UserAvatarProps
>(
  (
    {
      user,
      size = "md",
      showRing = false,
      hueOverride,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const { colorCss, subtleCss, borderCss, style: tokenStyle } =
      getUserColorTokens(user.id, hueOverride);
    const initials = getUserInitials(user.name);

    return (
      <AvatarPrimitive.Root
        ref={ref}
        style={{ ...tokenStyle, ...style }}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-full select-none overflow-hidden transition-transform duration-200",
          sizeClasses[size],
          showRing && "ring-2 ring-border ring-offset-2 ring-offset-background",
          className
        )}
        {...props}
      >
        {user.avatar_url && (
          <AvatarPrimitive.Image
            src={user.avatar_url}
            alt={user.name}
            className="aspect-square size-full object-cover"
          />
        )}
        <AvatarPrimitive.Fallback
          delayMs={100}
          className="flex size-full items-center justify-center rounded-full font-medium"
          style={{
            backgroundColor: subtleCss,
            color: colorCss,
            borderColor: borderCss,
          }}
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  }
);

UserAvatar.displayName = "UserAvatar";
