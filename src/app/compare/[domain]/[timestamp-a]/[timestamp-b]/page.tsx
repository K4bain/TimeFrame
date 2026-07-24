"use client";

import { Suspense, useCallback, useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { useCompare } from "@/features/compare/use-compare";
import { formatDate, getEra } from "@/utils";
import type { AppError } from "@/types/errors";
import { errorMessage as appErrorMessage } from "@/types/errors";

const ERA_NAMES: Record<string, string> = {
  "early-web": "Early Web",
  "browser-wars": "Browser Wars",
  "post-crash": "Post-Crash",
  "web-20": "Web 2.0",
  "mobile-transition": "Mobile",
  "flat-design": "Flat Design",
  "platform-web": "Platform",
  "ai-transition": "AI Era",
};

function errorMessage(err: AppError | string | null): string | null {
  if (!err) return null;
  if (typeof err === "string") return err;
  return appErrorMessage(err);
}

/**
 * BeforeAfterSlider — an interactive slider overlay that reveals the
 * "before" and "after" panels. Drag the divider to compare.
 * Premium, editorial implementation.
 */
function BeforeAfterSlider({
  leftContent,
  rightContent,
  leftLabel,
  rightLabel,
}: {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  leftLabel: string;
  rightLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  }, [isDragging, updatePosition]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle touch events for mobile
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !e.touches[0]) return;
    updatePosition(e.touches[0].clientX);
  }, [isDragging, updatePosition]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden border border-rule bg-ink-panel select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePointerUp}
    >
      {/* Right panel (full width, behind) */}
      <div className="w-full">
        {rightContent}
      </div>

      {/* Left panel (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${(100 - position)}% 0 0)` }}
      >
        {leftContent}
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-gold z-10"
        style={{ left: `${position}%` }}
      />

      {/* Draggable handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 z-20 cursor-ew-resize"
        style={{ left: `${position}%`, transform: `translate(-50%, -50%)` }}
        onPointerDown={handlePointerDown}
        role="slider"
        aria-label="Comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 2));
          if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + 2));
        }}
      >
        <div className="w-10 h-10 border-2 border-gold bg-ink-void flex items-center justify-center">
          <ArrowLeftRight className="w-4 h-4 text-gold" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10">
        <span className="font-mono text-xs px-2 py-1 bg-ink-void/80 border border-gold/30 text-gold">
          {leftLabel}
        </span>
      </div>
      <div className="absolute top-3 right-3 z-10">
        <span className="font-mono text-xs px-2 py-1 bg-ink-void/80 border border-gold/30 text-gold">
          {rightLabel}
        </span>
      </div>
    </div>
  );
}

function CompareContent() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;
  const timestampA = params["timestamp-a"] as string;
  const timestampB = params["timestamp-b"] as string;

  const { state } = useCompare(domain, timestampA, timestampB);

  const [viewMode, setViewMode] = useState<"side-by-side" | "slider">("slider");

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

  const eraA = getEra(timestampA);
  const eraB = getEra(timestampB);
  const eraNameA = ERA_NAMES[eraA] || eraA;
  const eraNameB = ERA_NAMES[eraB] || eraB;
  const yearsDiff = Math.abs(
    parseInt(timestampB.slice(0, 4), 10) - parseInt(timestampA.slice(0, 4), 10)
  );

  const renderPanelFrame = (
    timestamp: string,
    isLoading: boolean,
    error: AppError | string | null,
    waybackUrl: string | null
  ) => {
    const message = errorMessage(error);
    return (
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
        {/* View mode toggle */}
        <div className="flex items-center gap-1 border border-rule">
          <button
            onClick={() => setViewMode("slider")}
            className={`px-3 py-1.5 text-2xs font-mono uppercase tracking-wider transition-colors ${
              viewMode === "slider" ? "bg-gold/10 text-gold border-r border-rule" : "text-paper-dim hover:text-paper"
            }`}
          >
            Slider
          </button>
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1.5 text-2xs font-mono uppercase tracking-wider transition-colors ${
              viewMode === "side-by-side" ? "bg-gold/10 text-gold" : "text-paper-dim hover:text-paper"
            }`}
          >
            Split
          </button>
        </div>

        <div className="w-px h-6 bg-rule" aria-hidden="true" />

        <Button variant="outline" size="icon" onClick={() => navigateTo(-30)} aria-label="Go back 30 days">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => navigateTo(30)} aria-label="Go forward 30 days">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </SiteHeader>

      <div className="pt-[56px]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
          {/* Comparison summary bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule mb-8"
          >
            <div className="bg-ink-panel p-4">
              <p className="text-colophon mb-1">Earlier</p>
              <p className="font-mono text-gold">{formatDate(timestampA)}</p>
              <p className="text-2xs font-mono text-paper-dim mt-1">{eraNameA}</p>
            </div>
            <div className="bg-ink-panel p-4">
              <p className="text-colophon mb-1">Later</p>
              <p className="font-mono text-gold">{formatDate(timestampB)}</p>
              <p className="text-2xs font-mono text-paper-dim mt-1">{eraNameB}</p>
            </div>
            <div className="bg-ink-panel p-4">
              <p className="text-colophon mb-1">Span</p>
              <p className="font-mono text-paper">{yearsDiff} year{yearsDiff !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-ink-panel p-4">
              <p className="text-colophon mb-1">Era change</p>
              <p className="font-mono text-paper">{eraA === eraB ? "Same era" : `${eraNameA} → ${eraNameB}`}</p>
            </div>
          </motion.div>

          {/* View */}
          {viewMode === "slider" ? (
            <motion.div
              key="slider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <BeforeAfterSlider
                leftLabel={formatDate(timestampA)}
                rightLabel={formatDate(timestampB)}
                leftContent={renderPanelFrame(timestampA, state.left.isLoading, state.left.error, state.left.waybackUrl)}
                rightContent={renderPanelFrame(timestampB, state.right.isLoading, state.right.error, state.right.waybackUrl)}
              />
              <p className="text-colophon text-center mt-4">
                Drag the handle to compare · Use ← → to shift both dates
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="side-by-side"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="border border-rule bg-ink-panel overflow-hidden">
                <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
                  <span className="text-colophon">Earlier</span>
                  <p className="font-mono text-gold text-sm">{formatDate(timestampA)}</p>
                </div>
                {renderPanelFrame(timestampA, state.left.isLoading, state.left.error, state.left.waybackUrl)}
              </div>
              <div className="border border-rule bg-ink-panel overflow-hidden">
                <div className="px-4 py-3 border-b border-rule flex items-center justify-between">
                  <span className="text-colophon">Later</span>
                  <p className="font-mono text-gold text-sm">{formatDate(timestampB)}</p>
                </div>
                {renderPanelFrame(timestampB, state.right.isLoading, state.right.error, state.right.waybackUrl)}
              </div>
            </motion.div>
          )}

          <p className="text-colophon text-center mt-6 md:hidden">
            Swipe to compare on mobile
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
