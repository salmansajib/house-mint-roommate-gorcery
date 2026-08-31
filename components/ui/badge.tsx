import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/15 text-primary border border-primary/20",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground border border-border/50",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border border-destructive/25",
        outline: "text-foreground border border-border",
        groceries:
          "border-transparent bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
        rent: "border-transparent bg-indigo-500/15 text-indigo-400 border border-indigo-500/25",
        electricity:
          "border-transparent bg-amber-500/15 text-amber-400 border border-amber-500/25",
        gas: "border-transparent bg-orange-500/15 text-orange-400 border border-orange-500/25",
        internet:
          "border-transparent bg-cyan-500/15 text-cyan-400 border border-cyan-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
