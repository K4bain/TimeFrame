"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[timeframe] root error boundary:", {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="text-eyebrow mb-8">Error</span>
      <h1 className="text-display text-3xl md:text-5xl text-paper mb-4 max-w-lg">
        Timeframe encountered an error.
      </h1>
      <div className="w-16 h-px bg-rule my-8" />
      <p className="max-w-sm text-sm text-paper-faint leading-relaxed">
        Something unexpected happened. We&apos;ve been notified.
      </p>
      <Button onClick={reset} variant="outline" className="mt-10">
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reload Timeframe
      </Button>
    </div>
  );
}
