"use client";

import { useEffect, useState } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("[timeframe] root error boundary:", {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center tf-aurora overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10"
      >
        <div className="relative mx-auto mb-8" style={{ width: 80, height: 80 }}>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-error/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-error/50"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
        </div>

        <span className="text-eyebrow mb-6 block">System Error</span>

        <h1 className="text-display text-3xl md:text-5xl text-paper mb-4 max-w-lg">
          Something went wrong.
        </h1>

        <div className="w-16 h-px bg-rule mx-auto my-8" />

        <p className="max-w-sm text-sm text-paper-faint leading-relaxed mb-6">
          Timeframe encountered an unexpected error. This has been logged.
        </p>

        {error.digest && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-mono text-paper-dim hover:text-paper-faint transition-colors mb-6"
          >
            {showDetails ? "Hide" : "Show"} details (digest: {error.digest})
          </button>
        )}

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6"
          >
            <pre className="text-xs text-paper-dim font-mono bg-ink-panel border border-rule rounded-lg p-4 max-w-md mx-auto overflow-auto">
              {error.message}
            </pre>
          </motion.div>
        )}

        <Button onClick={reset} variant="outline" className="shadow-sm">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reload Timeframe
        </Button>
      </motion.div>
    </div>
  );
}
