import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      display: "text-display font-extrabold text-foreground",
      h1: "text-h1 font-bold text-foreground",
      h2: "text-h2 font-semibold text-foreground",
      h3: "text-h3 font-semibold text-foreground",
      h4: "text-h4 font-semibold text-foreground",
      bodyLg: "text-body-lg text-foreground/90",
      body: "text-body text-foreground/85",
      bodySm: "text-body-sm text-muted-foreground",
      caption: "text-xs text-muted-foreground",
      label: "text-label text-muted-foreground tracking-wider font-semibold",
      numeral: "font-numeral tabular-nums text-foreground",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean;
  as?: React.ElementType;
}

export function Text({
  className,
  variant,
  as: Component = "p",
  asChild = false,
  ...props
}: TextProps) {
  const Comp = asChild ? Slot : Component;
  return (
    <Comp
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  );
}
