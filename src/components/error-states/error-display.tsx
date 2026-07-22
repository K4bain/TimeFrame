"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AppError } from "@/types/errors";
import { getErrorConfig } from "./error-catalogue";

export interface ErrorDisplayProps {
  error: AppError;
  /** Callback for the recovery action button. If omitted, the button is hidden. */
  onAction?: () => void;
  /** Render as a full-screen takeover instead of zone-scoped. Default: false. */
  fullScreen?: boolean;
  className?: string;
}

/**
 * ErrorDisplay — renders a zone-scoped error state per COMP.10.
 *
 * Layout: AlertCircle icon (--icon-lg, --color-error) → title (--text-lg,
 * --color-text-primary) → description (--text-sm, --color-text-secondary)
 * → action button (COMP.13, secondary variant).
 *
 * Errors render within their zone, not as full-page takeovers —
 * unless `fullScreen` is set (reserved for NETWORK_OFFLINE).
 *
 * Spec reference: COMP.10, ERR.3, ERR.4.
 */
export function ErrorDisplay({
  error,
  onAction,
  fullScreen = false,
  className,
}: ErrorDisplayProps) {
  const config = getErrorConfig(error);

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        fullScreen ? "min-h-screen justify-center px-6" : "justify-center py-12 px-6",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle
        className="mb-4 h-8 w-8 text-error"
        aria-hidden="true"
      />
      <h2 className="text-lg font-medium text-text-primary">
        {config.title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        {config.description}
      </p>
      {config.actionLabel && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          className="mt-6"
        >
          {config.actionLabel === "Reload page" && (
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          )}
          {config.actionLabel}
        </Button>
      )}
      {config.actionLabel === "Reload page" && !onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-6"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reload page
        </Button>
      )}
    </div>
  );
}
