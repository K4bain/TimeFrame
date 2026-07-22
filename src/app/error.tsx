"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/aurora-background";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring system (see 16_MONITORING / ERR.5)
    console.error("[timeframe] root error boundary:", {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center">
      <AuroraBackground />
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="tf-glass-strong rounded-2xl p-10 md:p-14 max-w-md">
          <AlertCircle className="mb-6 h-10 w-10 text-error" aria-hidden="true" />
          <span className="text-2xs uppercase tracking-[0.2em] text-text-muted font-medium mb-3 block">
            Error
          </span>
          <h1 className="text-display text-2xl md:text-3xl text-text-primary mb-3">
            Timeframe encountered an error.
          </h1>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Something unexpected happened. We&apos;ve been notified.
          </p>
          <Button onClick={reset} variant="secondary" className="mt-8">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reload Timeframe
          </Button>
        </div>
      </div>
    </main>
  );
}
