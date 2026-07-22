"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * SiteHeader — COMP.2 (shared chrome).
 *
 * One fixed top bar used by every secondary route (search, explore,
 * compare, collections). Replaces the four bespoke fixed headers that
 * had drifted apart in height, padding, and back-button styling.
 *
 * Slots:
 *  - `wordmark`            show serif "Timeframe" wordmark on the left
 *  - `backHref`            render a back button targeting this URL
 *  - `backLabel`           accessible label for the back button
 *  - `title`               inline title beside the back button
 *  - `subtitle`            smaller text beneath the title
 *  - `children`            right-side or fill content (forms, actions)
 *  - `expandChildren`      stretch children to fill horizontal space
 *
 * Spec reference: COMP.2, MOT.2 (backdrop blur is static, not animated).
 */
export interface SiteHeaderProps {
  wordmark?: boolean;
  backHref?: string;
  backLabel?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  expandChildren?: boolean;
  className?: string;
  /** Max-width container class. Defaults to the widest chrome layout. */
  innerClassName?: string;
}

export function SiteHeader({
  wordmark,
  backHref,
  backLabel = "Back",
  title,
  subtitle,
  children,
  expandChildren,
  className,
  innerClassName = "max-w-7xl mx-auto px-4 md:px-6",
}: SiteHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-sm border-b border-border-subtle">
      <div className={cn("h-[52px] flex items-center gap-4", innerClassName, className)}>
        {wordmark && (
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <span className="text-display text-base tracking-tight text-text-primary group-hover:text-temporal-text transition-colors">
              Timeframe
            </span>
          </Link>
        )}

        {backHref && (
          <Button variant="ghost" size="icon" aria-label={backLabel} asChild>
            <Link href={backHref}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
        )}

        {(title || subtitle) && (
          <div className="min-w-0">
            {title && (
              <div className="text-sm font-medium text-text-primary truncate">{title}</div>
            )}
            {subtitle && (
              <div className="text-xs text-text-tertiary truncate">{subtitle}</div>
            )}
          </div>
        )}

        {children && (
          <div className={cn(expandChildren ? "flex-1 min-w-0" : "ml-auto flex items-center gap-2")}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
