import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * GlassCard — frosted-glass surface for elevated content.
 *
 * Translucent background + backdrop-blur over the aurora layer, with a
 * hairline border that brightens on hover. Optionally emits a subtle
 * amber or cyan glow.
 *
 * Spec reference: 2026 glassmorphism trend, spatial depth.
 */
export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "amber" | "cyan" | "none";
  strong?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = "none", strong, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          strong ? "tf-glass-strong" : "tf-glass",
          "rounded-xl transition-all duration-300",
          glow === "amber" && "hover:shadow-glow-amber",
          glow === "cyan" && "hover:shadow-glow-cyan",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";
