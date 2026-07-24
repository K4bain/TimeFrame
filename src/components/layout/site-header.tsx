"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SiteHeaderProps {
  wordmark?: boolean;
  backHref?: string;
  backLabel?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  expandChildren?: boolean;
  className?: string;
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
    <div className="fixed top-0 left-0 right-0 z-50 tf-glass border-b border-glass-border">
      <div className={cn("h-[56px] flex items-center gap-4", innerClassName, className)}>
        {wordmark && (
          <Link href="/" className="flex items-baseline gap-2 shrink-0 group">
            <span className="font-display text-lg tracking-tight text-paper group-hover:text-gold transition-colors">
              Timeframe
            </span>
            <span className="text-colophon hidden sm:inline">No. 0001</span>
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
              <div className="text-sm font-medium text-paper truncate">{title}</div>
            )}
            {subtitle && (
              <div className="text-xs text-paper-faint font-mono truncate">{subtitle}</div>
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
