"use client";

import { Suspense, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { useCompare } from "@/features/compare/use-compare";
import { formatDate } from "@/utils";
import type { AppError } from "@/types/errors";
import { errorMessage as appErrorMessage } from "@/types/errors";

function errorMessage(err: AppError | string | null): string | null {
  if (!err) return null;
  if (typeof err === "string") return err;
  return appErrorMessage(err);
}

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

  const renderPanel = (
    side: "left" | "right",
    timestamp: string,
    isLoading: boolean,
    error: AppError | string | null,
    waybackUrl: string | null
  ) => {
    const message = errorMessage(error);
    return (
      <div className="border border-rule bg-ink-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
          <span className="text-colophon">
            {side === "left" ? "Earlier" : "Later"}
          </span>
          <p className="font-mono text-gold text-sm">
            {formatDate(timestamp)}
          </p>
        </div>
        <div className="aspect-video relative bg-ink-void">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 text-paper-dim animate-spin mb-3" />
              <p className="text-colophon">Loading</p>
            </div>
          )}

          {message && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <AlertCircle className="w-7 h-7 text-paper-dim mb-3" aria-hidden="true" />
              <p className="text-paper-faint text-sm">{message}</p>
            </div>
          )}

          {!isLoading && !message && waybackUrl && (
            <iframe
              src={waybackUrl}
              className="w-full h-full border-0 bg-ink-void"
              title={`Archived version from ${formatDate(timestamp)}`}
              sandbox="allow-scripts allow-same-origin"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <SiteHeader
        backHref={`/explore/${domain}/${timestampA}`}
        backLabel="Back to explore"
        title={
          <span className="flex items-baseline gap-2">
            <span className="text-paper">{domain}</span>
          </span>
        }
        subtitle={
          <span className="flex items-center gap-2">
            <span className="text-gold">{formatDate(timestampA)}</span>
            <span className="text-paper-dim">vs</span>
            <span className="text-gold">{formatDate(timestampB)}</span>
          </span>
        }
        innerClassName="max-w-6xl mx-auto px-4 md:px-6"
      >
        <Button variant="outline" size="icon" onClick={() => navigateTo(-30)} aria-label="Go back 30 days">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => navigateTo(30)} aria-label="Go forward 30 days">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </SiteHeader>

      <div className="pt-[56px]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderPanel("left", timestampA, state.left.isLoading, state.left.error, state.left.waybackUrl)}
            {renderPanel("right", timestampB, state.right.isLoading, state.right.error, state.right.waybackUrl)}
          </div>

          <p className="text-colophon text-center mt-6 md:hidden">
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
          <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading compare page">
            <Loader2 className="w-6 h-6 text-paper-dim animate-spin" />
          </div>
        }
      >
        <CompareContent />
      </Suspense>
    </main>
  );
}
