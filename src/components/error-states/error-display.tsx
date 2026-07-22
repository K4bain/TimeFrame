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
 * ErrorDisplay — renders a zone-scoped error state.
 *
 * Minimal editorial layout: small mono eyebrow, serif headline, body text,
 * optional action. No icons in editorial mode — type does the work.
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
        fullScreen ? "min-h-screen justify-center px-6" : "justify-center py-16 px-6",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle
        className="mb-4 h-7 w-7 text-paper-dim"
        aria-hidden="true"
      />
      <h2 className="text-lg font-display text-paper">
        {config.title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-paper-faint">
        {config.description}
      </p>
      {config.actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="mt-8"
        >
          {config.actionLabel === "Reload page" && (
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          )}
          {config.actionLabel}
        </Button>
      )}
      {config.actionLabel === "Reload page" && !onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="mt-8"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reload page
        </Button>
      )}
    </div>
  );
}
