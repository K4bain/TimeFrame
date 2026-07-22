"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge — a catalogue tag.
 *
 * Sharp corners, hairline border, mono caps text.
 */

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2 py-0.5 text-2xs font-mono tracking-wider uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "border-rule text-paper-faint",
        temporal: "border-gold/40 text-gold",
        error: "border-error-border text-error",
        success: "border-success-border text-success",
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
