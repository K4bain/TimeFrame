"use client";

import { Suspense, useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  Maximize2,
  Minimize2,
  ExternalLink,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ContextPanel } from "@/components/context/context-panel";
import { useTimeline } from "@/features/timeline/use-timeline";
import { useViewer } from "@/features/viewer/use-viewer";
import { formatDate, getEra, normalizeUrl } from "@/utils";
import Link from "next/link";
import type { Capture } from "@/types";

const MAX_DOTS = 100;

function EraBand({
  era,
  startYear,
  endYear,
  totalStart,
  totalEnd,
}: {
  era: string;
  startYear: number;
  endYear: number;
  totalStart: number;
  totalEnd: number;
}) {
  const totalSpan = totalEnd - totalStart || 1;
  const left = ((startYear - totalStart) / totalSpan) * 100;
  const width = ((endYear - startYear) / totalSpan) * 100;

  if (width < 2) return null;

  const ERA_NAMES: Record<string, string> = {
    "Early Web": "Early Web",
    "Dot-com Era": "Dot-Com",
    "Post Bubble": "Post-Crash",
    "Web 2.0 Rise": "Web 2.0",
    "Social Emergence": "Social",
    "Mobile Shift": "Mobile",
    "Modern Web": "Modern",
    "Contemporary": "Platform",
    "Current Era": "Current",
  };

  return (
    <div
      className="absolute top-0 bottom-0 bg-temporal-bg opacity-60 pointer-events-none"
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      {width > 8 && (
        <span className="absolute top-1 left-1 text-2xs uppercase tracking-wider text-temporal-text/50 font-medium">
          {ERA_NAMES[era] || era}
        </span>
      )}
    </div>
  );
}

function ChangeMarker({
  index,
  total,
  score,
  timestamp,
  onClick,
}: {
  index: number;
  total: number;
  score: number;
  timestamp: string;
  onClick: () => void;
}) {
  const height = score > 0.7 ? 16 : score > 0.4 ? 12 : 8;
  const diamond = score > 0.7 ? 8 : score > 0.4 ? 6 : 4;
  const opacity = score > 0.7 ? 1 : score > 0.4 ? 0.8 : 0.6;

  return (
    <Tooltip content={`Change detected: ${formatDate(timestamp)}`}>
      <button
        onClick={onClick}
        className="absolute flex flex-col items-center -translate-x-1/2"
        style={{
          left: `${(index / (total - 1)) * 100}%`,
          opacity,
        }}
        aria-label={`Change detected: ${formatDate(timestamp)}. Click to navigate.`}
      >
        <div
          className="bg-temporal-primary rotate-45"
          style={{ width: `${diamond}px`, height: `${diamond}px` }}
        />
        <div
          className="w-px bg-temporal-primary"
          style={{ height: `${height}px` }}
        />
      </button>
    </Tooltip>
  );
}

function ExploreContent() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;
  const timestamp = params.timestamp as string;

  const {
    captures,
    years,
    selectedCapture,
    isLoading: timelineLoading,
    error: timelineError,
    gaps,
    selectedIndex,
    goToNext,
    goToPrevious,
    goToYear,
  } = useTimeline(domain, timestamp);

  const { state: viewerState } = useViewer(domain, timestamp);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const lastWaybackUrl = useRef("");

  useEffect(() => {
    if (viewerState.waybackUrl && !viewerState.error) {
      lastWaybackUrl.current = viewerState.waybackUrl;
    }
  }, [viewerState.waybackUrl, viewerState.error]);

  useEffect(() => {
    setCanFullscreen(!!document.documentElement.requestFullscreen);
  }, []);

  useEffect(() => {
    setIsIframeLoading(true);
  }, [timestamp]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      function captureDate(ts: string): Date {
        return new Date(
          parseInt(ts.slice(0, 4), 10),
          parseInt(ts.slice(4, 6), 10) - 1,
          parseInt(ts.slice(6, 8), 10)
        );
      }
      function findNearest(ts: string): Capture | undefined {
        if (captures.length === 0) return;
        const target = captureDate(ts);
        let best = captures[0];
        let bestDiff = Math.abs(captureDate(best.timestamp).getTime() - target.getTime());
        for (let i = 1; i < captures.length; i++) {
          const diff = Math.abs(captureDate(captures[i].timestamp).getTime() - target.getTime());
          if (diff < bestDiff) { best = captures[i]; bestDiff = diff; }
        }
        return best;
      }
      function shiftMonths(ts: string, months: number): string {
        const d = captureDate(ts);
        d.setMonth(d.getMonth() + months);
        return d.toISOString().slice(0, 10).replace(/-/g, "") + "000000";
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.shiftKey) {
          if (selectedIndex < 0) return;
          const target = shiftMonths(captures[selectedIndex].timestamp, -1);
          const match = findNearest(target);
          if (match) router.push(`/explore/${domain}/${match.timestamp}`);
        } else if (e.ctrlKey || e.metaKey) {
          const idx = selectedIndex;
          if (idx > 0) {
            const targetYear = parseInt(captures[idx].timestamp.slice(0, 4), 10) - 1;
            const target = captures.find(
              (c) => parseInt(c.timestamp.slice(0, 4), 10) === targetYear
            );
            if (target) router.push(`/explore/${domain}/${target.timestamp}`);
          }
        } else {
          const prev = goToPrevious();
          if (prev) router.push(`/explore/${domain}/${prev.timestamp}`);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (e.shiftKey) {
          if (selectedIndex < 0) return;
          const target = shiftMonths(captures[selectedIndex].timestamp, 1);
          const match = findNearest(target);
          if (match) router.push(`/explore/${domain}/${match.timestamp}`);
        } else if (e.ctrlKey || e.metaKey) {
          const idx = selectedIndex;
          if (idx < captures.length - 1) {
            const targetYear = parseInt(captures[idx].timestamp.slice(0, 4), 10) + 1;
            const target = [...captures].reverse().find(
              (c) => parseInt(c.timestamp.slice(0, 4), 10) === targetYear
            );
            if (target) router.push(`/explore/${domain}/${target.timestamp}`);
          }
        } else {
          const next = goToNext();
          if (next) router.push(`/explore/${domain}/${next.timestamp}`);
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        if (captures.length > 0) {
          router.push(`/explore/${domain}/${captures[0].timestamp}`);
        }
      } else if (e.key === "End") {
        e.preventDefault();
        if (captures.length > 0) {
          router.push(`/explore/${domain}/${captures[captures.length - 1].timestamp}`);
        }
      }
    },
    [goToPrevious, goToNext, captures, selectedIndex, domain, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        const normalized = normalizeUrl(searchQuery.trim());
        if (normalized) {
          router.push(`/search?q=${encodeURIComponent(normalized)}`);
          setSearchQuery("");
        }
      }
    },
    [searchQuery, router]
  );

  const navigateTo = useCallback(
    (offset: number) => {
      if (selectedIndex < 0) return;
      const newIdx = selectedIndex + offset;
      if (newIdx >= 0 && newIdx < captures.length) {
        router.push(`/explore/${domain}/${captures[newIdx].timestamp}`);
      }
    },
    [selectedIndex, captures, domain, router]
  );

  const selectedYear = selectedCapture
    ? parseInt(selectedCapture.timestamp.slice(0, 4), 10)
    : null;

  const sampledDots = useMemo(() => {
    if (captures.length <= MAX_DOTS) return captures;
    const step = captures.length / MAX_DOTS;
    return Array.from({ length: MAX_DOTS }, (_, i) =>
      captures[Math.min(Math.round(i * step), captures.length - 1)]
    );
  }, [captures]);

  const eras = useMemo(() => {
    if (captures.length === 0) return [];
    const eraMap = new Map<string, { start: number; end: number }>();
    for (const capture of captures) {
      const year = parseInt(capture.timestamp.slice(0, 4), 10);
      const era = getEra(capture.timestamp);
      const existing = eraMap.get(era);
      if (existing) {
        existing.end = year;
      } else {
        eraMap.set(era, { start: year, end: year });
      }
    }
    return Array.from(eraMap.entries()).map(([era, { start, end }]) => ({
      era,
      start,
      end: end + 1,
    }));
  }, [captures]);

  const changeScores = useMemo(() => {
    function parseDate(ts: string): Date {
      return new Date(
        parseInt(ts.slice(0, 4), 10),
        parseInt(ts.slice(4, 6), 10) - 1,
        parseInt(ts.slice(6, 8), 10)
      );
    }
    const scores: { index: number; score: number; timestamp: string }[] = [];
    for (let i = 1; i < captures.length; i++) {
      const prev = captures[i - 1];
      const curr = captures[i];
      if (prev && curr) {
        const diffMs = Math.abs(
          parseDate(curr.timestamp).getTime() -
            parseDate(prev.timestamp).getTime()
        );
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 90) {
          scores.push({ index: i, score: 0.6, timestamp: curr.timestamp });
        }
      }
    }
    return scores;
  }, [captures]);

  const totalStart = captures.length > 0
    ? parseInt(captures[0].timestamp.slice(0, 4), 10)
    : 1990;
  const totalEnd = captures.length > 0
    ? parseInt(captures[captures.length - 1].timestamp.slice(0, 4), 10) + 1
    : 2025;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Chrome - COMP.2 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg-surface border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-[52px] flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-sm">Timeframe</span>
          </Link>

          {/* Search Field - COMP.1 (Chrome configuration) */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-base border border-border-subtle rounded-sm focus-within:border-temporal-border transition-colors">
              <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a site…"
                className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-muted text-sm"
                aria-label="Search for a website"
              />
            </div>
          </form>

          {captures.length > 0 && (
            <div className="flex items-center gap-2">
              <Link
                href={`/compare/${domain}/${captures[0].timestamp}/${captures[captures.length - 1].timestamp}`}
              >
                <Button variant="ghost" size="sm">
                  <GitCompare className="w-4 h-4 mr-1" />
                  Compare
                </Button>
              </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateTo(-1)}
              disabled={selectedIndex <= 0}
              aria-label="Previous snapshot"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateTo(1)}
              disabled={selectedIndex >= captures.length - 1}
              aria-label="Next snapshot"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {viewerState.waybackUrl && (
              <Button variant="ghost" size="icon" asChild aria-label="Open in Wayback Machine">
                <a href={viewerState.waybackUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}

            {canFullscreen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex pt-[52px]">
        {/* Left: Timeline + Viewer */}
        <div className="flex-1 min-w-0 px-4 md:px-6 py-6">
          <div className="max-w-5xl mx-auto">
            {timelineLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="w-8 h-8 text-text-muted animate-spin mb-4" />
                <p className="text-text-muted">Loading timeline...</p>
              </motion.div>
            )}

            {timelineError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <AlertCircle className="w-12 h-12 text-text-muted mb-4" />
                <h2 className="text-xl font-semibold mb-2">No timeline available</h2>
                <p className="text-text-muted text-center max-w-md">{timelineError}</p>
                <Link href="/">
                  <Button variant="outline" className="mt-6">
                    Try another search
                  </Button>
                </Link>
              </motion.div>
            )}

            {!timelineLoading && !timelineError && captures.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Snapshot Metadata Bar - COMP.9 */}
                {selectedCapture && (
                  <div className="mb-4 flex items-center gap-3 text-sm">
                    <span className="font-medium">{domain}</span>
                    <span className="text-text-muted">/</span>
                    <span className="font-mono text-temporal-text">
                      {formatDate(selectedCapture.timestamp)}
                    </span>
                    <span className="text-text-muted">/</span>
                    <span className="text-text-muted">
                      {selectedIndex + 1} of {captures.length}
                    </span>
                  </div>
                )}

                {/* Timeline with Era Bands - COMP.3 + COMP.8 */}
                <div className="mb-6">
                  {/* Era Bands */}
                  <div className="relative h-6 mb-1">
                    {eras.map(({ era, start, end }) => (
                      <EraBand
                        key={era}
                        era={era}
                        startYear={start}
                        endYear={end}
                        totalStart={totalStart}
                        totalEnd={totalEnd}
                      />
                    ))}
                  </div>

                  {/* Year Density Chart */}
                  <div className="flex items-end gap-px h-20">
                    {years.map((yearData) => (
                      <button
                        key={yearData.year}
                        onClick={() => {
                          const target = goToYear(yearData.year);
                          if (target) router.push(`/explore/${domain}/${target.timestamp}`);
                        }}
                        className="flex-1 flex flex-col items-center justify-end h-full group"
                        aria-label={`Jump to ${yearData.year}`}
                      >
                        <div
                          className={`w-full transition-colors duration-150 rounded-t-xs cursor-pointer ${
                            selectedYear === yearData.year
                              ? "bg-temporal-primary"
                              : "bg-temporal-primary/20 group-hover:bg-temporal-primary/40"
                          }`}
                          style={{ height: `${Math.max(yearData.density * 100, 4)}%` }}
                          title={`${yearData.year}: ${yearData.captures.length} snapshots`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-end gap-px mt-1">
                    {years.map((yearData) => (
                      <div
                        key={yearData.year}
                        className={`flex-1 text-center text-xs font-mono ${
                          selectedYear === yearData.year
                            ? "text-temporal-text font-medium"
                            : "text-text-muted"
                        }`}
                      >
                        {yearData.year % 5 === 0 ||
                        yearData.year === years[0]?.year ||
                        yearData.year === years[years.length - 1]?.year
                          ? yearData.year
                          : ""}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scrubber with Change Markers - COMP.3 + COMP.7 */}
                <div className="mb-6">
                  <div
                    className="relative h-12 bg-bg-surface rounded-md overflow-hidden"
                    role="slider"
                    aria-label="Timeline scrubber"
                    aria-valuemin={0}
                    aria-valuemax={captures.length - 1}
                    aria-valuenow={selectedIndex}
                    tabIndex={0}
                  >
                    {/* Change Markers */}
                    {changeScores.map(({ index, score, timestamp }) => (
                      <ChangeMarker
                        key={timestamp}
                        index={index}
                        total={captures.length}
                        score={score}
                        timestamp={timestamp}
                        onClick={() => router.push(`/explore/${domain}/${timestamp}`)}
                      />
                    ))}

                    {/* Snapshot Dots */}
                    <div className="absolute inset-0 flex items-center">
                      {sampledDots.map((capture) => {
                        const realIndex = captures.findIndex(
                          (c) => c.timestamp === capture.timestamp
                        );
                        const prevCapture = realIndex > 0 ? captures[realIndex - 1] : null;
                        const hasGap = prevCapture ? gaps.has(realIndex) : false;

                        return (
                          <div
                            key={capture.timestamp}
                            className="absolute h-full flex items-center"
                            style={{
                              left: `${captures.length > 1 ? (realIndex / (captures.length - 1)) * 100 : 0}%`,
                            }}
                          >
                            {hasGap && (
                              <div
                                className="absolute -left-1 w-3 h-full bg-temporal-primary/20 rounded-sm"
                                title="Coverage gap"
                              />
                            )}
                            <button
                              onClick={() =>
                                router.push(`/explore/${domain}/${capture.timestamp}`)
                              }
                              className={`w-2 h-2 rounded-full transition-all duration-150 ${
                                selectedCapture?.timestamp === capture.timestamp
                                  ? "bg-temporal-primary scale-150 shadow-temporal"
                                  : "bg-text-muted/50 hover:bg-temporal-hover hover:scale-125"
                              }`}
                              aria-label={`Select snapshot from ${formatDate(capture.timestamp)}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-xs text-text-muted mt-2 text-center">
                    Use ← → arrow keys to navigate
                  </p>
                </div>

                  {/* Viewer - COMP.4 */}
                {selectedCapture && (
                  <motion.div
                    key={selectedCapture.timestamp}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-bg-surface border border-border-default rounded-md overflow-hidden"
                  >
                    <div className="aspect-video relative bg-bg-base">
                      {(() => {
                        const showUrl = viewerState.waybackUrl || lastWaybackUrl.current;

                        if (viewerState.isLoading && !showUrl) {
                          return (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <Loader2 className="w-8 h-8 text-text-muted animate-spin mb-4" />
                              <p className="text-text-muted">Loading snapshot...</p>
                            </div>
                          );
                        }

                        if (showUrl) {
                          return (
                            <>
                              {isIframeLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <Loader2 className="w-8 h-8 text-text-muted animate-spin mb-4" />
                                  <p className="text-text-muted">Rendering snapshot...</p>
                                </div>
                              )}
                              <div className={`h-full transition-opacity duration-300 ${isIframeLoading ? 'opacity-0' : 'opacity-100'}`}>
                                <iframe
                                  src={showUrl}
                                  className="w-full h-full border-0 bg-bg-base"
                                  title={`Archived version of ${domain} from ${formatDate(selectedCapture.timestamp)}`}
                                  sandbox="allow-scripts allow-same-origin"
                                  referrerPolicy="no-referrer"
                                  onLoad={() => setIsIframeLoading(false)}
                                />
                              </div>
                            </>
                          );
                        }

                        if (viewerState.error) {
                          return (
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                              <AlertCircle className="w-8 h-8 text-text-muted mb-2" />
                              <p className="text-text-muted text-center text-sm">
                                {viewerState.error}
                              </p>
                            </div>
                          );
                        }

                        return null;
                      })()}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {!timelineLoading && !timelineError && captures.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-text-muted mb-4" />
                <h2 className="text-xl font-semibold mb-2">No snapshots found</h2>
                <p className="text-text-muted text-center max-w-md mb-6">
                  The archive returned no results for this site.
                </p>
                <Link href="/">
                  <Button variant="outline">Try a different site</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Context Panel - COMP.5 */}
        <div className="hidden lg:block w-72 border-l border-border-subtle bg-bg-base">
          <ContextPanel
            domain={domain}
            captures={captures}
            selectedCapture={selectedCapture}
            isLoading={timelineLoading}
            changeScore={
              selectedCapture
                ? changeScores.find(
                    (c) => c.timestamp === selectedCapture.timestamp
                  )?.score
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
          </div>
        }
      >
        <ExploreContent />
      </Suspense>
    </main>
  );
}
