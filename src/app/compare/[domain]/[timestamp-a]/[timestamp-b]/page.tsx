"use client";

import { Suspense, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/features/compare/use-compare";
import { formatDate } from "@/utils";
import Link from "next/link";

function CompareContent() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;
  const timestampA = params["timestamp-a"] as string;
  const timestampB = params["timestamp-b"] as string;

  const { state } = useCompare(domain, timestampA, timestampB);

  const navigateTo = useCallback(
    (offset: number) => {
      const dateA = new Date(
        parseInt(timestampA.slice(0, 4), 10),
        parseInt(timestampA.slice(4, 6), 10) - 1,
        parseInt(timestampA.slice(6, 8), 10)
      );
      const dateB = new Date(
        parseInt(timestampB.slice(0, 4), 10),
        parseInt(timestampB.slice(4, 6), 10) - 1,
        parseInt(timestampB.slice(6, 8), 10)
      );
      dateA.setDate(dateA.getDate() + offset);
      dateB.setDate(dateB.getDate() + offset);
      const newA = dateA.toISOString().slice(0, 10).replace(/-/g, "") + "000000";
      const newB = dateB.toISOString().slice(0, 10).replace(/-/g, "") + "000000";
      router.push(`/compare/${domain}/${newA}/${newB}`);
    },
    [domain, timestampA, timestampB, router]
  );

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 md:px-16 py-4 flex items-center gap-4">
          <Link href={`/explore/${domain}/${timestampA}`}>
            <Button variant="ghost" size="icon" aria-label="Back to explore">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">Compare — {domain}</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono text-temporal-text">
                {formatDate(timestampA)}
              </span>
              <span className="text-text-tertiary">vs</span>
              <span className="font-mono text-temporal-text">
                {formatDate(timestampB)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateTo(-30)}
              aria-label="Go back 30 days"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateTo(30)}
              aria-label="Go forward 30 days"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-8 px-4 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Panel */}
            <div className="bg-bg-surface border border-border-default rounded-md overflow-hidden">
              <div className="p-4 border-b border-border-subtle">
                <p className="font-medium font-mono text-temporal-text">
                  {formatDate(timestampA)}
                </p>
              </div>
              <div className="aspect-video relative bg-bg-base">
                {state.left.isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-text-muted animate-spin mb-4" />
                    <p className="text-text-muted">Loading...</p>
                  </div>
                )}

                {state.left.error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                    <AlertCircle className="w-8 h-8 text-text-muted mb-2" />
                    <p className="text-text-muted text-center text-sm">{state.left.error}</p>
                  </div>
                )}

                {!state.left.isLoading && !state.left.error && state.left.waybackUrl && (
                  <iframe
                    src={state.left.waybackUrl}
                    className="w-full h-full border-0 bg-bg-base"
                    title={`Archived version from ${formatDate(timestampA)}`}
                    sandbox="allow-scripts allow-same-origin"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div className="bg-bg-surface border border-border-default rounded-md overflow-hidden">
              <div className="p-4 border-b border-border-subtle">
                <p className="font-medium font-mono text-temporal-text">
                  {formatDate(timestampB)}
                </p>
              </div>
              <div className="aspect-video relative bg-bg-base">
                {state.right.isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-text-muted animate-spin mb-4" />
                    <p className="text-text-muted">Loading...</p>
                  </div>
                )}

                {state.right.error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                    <AlertCircle className="w-8 h-8 text-text-muted mb-2" />
                    <p className="text-text-muted text-center text-sm">{state.right.error}</p>
                  </div>
                )}

                {!state.right.isLoading && !state.right.error && state.right.waybackUrl && (
                  <iframe
                    src={state.right.waybackUrl}
                    className="w-full h-full border-0 bg-bg-base"
                    title={`Archived version from ${formatDate(timestampB)}`}
                    sandbox="allow-scripts allow-same-origin"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Mobile stacking notice */}
          <p className="text-xs text-text-muted mt-4 text-center md:hidden">
            Side-by-side view available on larger screens
          </p>
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
