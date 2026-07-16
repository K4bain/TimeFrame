"use client";

import { Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  ArrowDown,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/features/compare/use-compare";
import { formatDate } from "@/utils";
import Link from "next/link";

function CompareContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const site = params.site as string;
  const leftTimestamp = searchParams.get("l") || "";
  const rightTimestamp = searchParams.get("r") || "";

  const { state } = useCompare(site, leftTimestamp, rightTimestamp);

  const renderPanel = (
    side: "left" | "right",
    label: string
  ) => {
    const panel = state[side];

    return (
      <div className="flex-1 flex flex-col min-w-0 min-h-[50vh] lg:min-h-0">
        <div className="px-4 py-3 bg-bg-surface border-b border-border-subtle flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
            {panel.isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-sm text-text-muted">Loading...</span>
              </div>
            ) : panel.error ? (
              <p className="text-sm text-error">{panel.error}</p>
            ) : panel.timestamp ? (
              <div>
                <p className="text-sm font-medium font-mono text-temporal-text">{formatDate(panel.timestamp)}</p>
                <p className="text-xs text-text-muted">{panel.era}</p>
              </div>
            ) : (
              <p className="text-sm text-text-muted">No snapshot selected</p>
            )}
          </div>
        </div>

        <div className="flex-1 relative bg-bg-base">
          {panel.isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 text-text-muted animate-spin mb-3" />
              <p className="text-sm text-text-muted">Rendering...</p>
            </div>
          )}

          {panel.error && !panel.isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
              <AlertCircle className="w-8 h-8 text-text-muted mb-3" />
              <p className="text-sm text-text-muted text-center">{panel.error}</p>
            </div>
          )}

          {!panel.isLoading && !panel.error && panel.waybackUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <iframe
                src={panel.waybackUrl}
                className="w-full h-full border-0 bg-bg-base"
                title={`Archived version of ${site} from ${formatDate(panel.timestamp)}`}
                sandbox="allow-scripts allow-same-origin"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          )}

          {!panel.isLoading && !panel.error && !panel.waybackUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-sm text-text-muted">Select a snapshot to compare</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 md:px-16 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" aria-label="Back to explore" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">Compare — {site}</h1>
            {state.left.timestamp && state.right.timestamp && (
              <p className="text-sm text-text-tertiary font-mono text-temporal-text">
                {formatDate(state.left.timestamp)} vs {formatDate(state.right.timestamp)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="h-screen flex flex-col">
        <div className="h-18 shrink-0" />
        <div className="flex-1 flex flex-col lg:flex-row">
          {renderPanel("left", "Before")}
          <div className="h-12 lg:h-auto lg:w-12 bg-bg-surface border-x border-y lg:border-y-0 border-border-subtle flex items-center justify-center shrink-0">
            <ArrowDown className="w-5 h-5 text-text-muted lg:hidden" />
            <GripVertical className="w-5 h-5 text-text-muted hidden lg:block" />
          </div>
          {renderPanel("right", "After")}
        </div>
      </div>
    </>
  );
}

export default function ComparePage() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
          </div>
        }
      >
        <CompareContent />
      </Suspense>
    </main>
  );
}
