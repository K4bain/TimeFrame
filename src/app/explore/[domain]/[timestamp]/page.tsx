"use client";

import { Suspense, useEffect, useMemo, useCallback, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  Maximize2,
  Minimize2,
  ExternalLink,
  Search,
  Play,
  Pause,
  Shuffle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/layout/site-header";
import { ErrorDisplay } from "@/components/error-states/error-display";
import { ContextPanel } from "@/components/context/context-panel";
import { TimeMachineBar } from "@/components/explore/time-machine-bar";
import { useTimeline } from "@/features/timeline/use-timeline";
import { useViewer } from "@/features/viewer/use-viewer";
import { formatDate, getEra, normalizeUrl } from "@/utils";
import Link from "next/link";
import type { Capture } from "@/types";

const MAX_DOTS = 100;
const AUTOPLAY_INTERVAL = 1400;

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

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{
        left: `${left}%`,
        width: `${width}%`,
        backgroundColor: "var(--color-gold-faint)",
        borderLeft: "1px solid var(--color-rule)",
      }}
    >
      {width > 8 && (
        <span className="absolute top-1 left-1.5 text-2xs font-mono uppercase tracking-wider text-paper-dim">
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
          className="bg-gold rotate-45"
          style={{ width: `${diamond}px`, height: `${diamond}px` }}
        />
        <div
          className="w-px bg-gold/60"
          style={{ height: `${height}px` }}
        />
      </button>
    </Tooltip>
  );
}

/**
 * EraFingerprint — a visual "DNA barcode" showing which eras this site
 * was active in. Each era is a vertical bar whose height represents
 * the number of captures in that era. Interactive: hover reveals details.
 */
function EraFingerprint({
  captures,
  selectedCapture,
  onSelectEra,
}: {
  captures: Capture[];
  selectedCapture: Capture | null;
  onSelectEra: (era: string) => void;
}) {
  const [hoveredEra, setHoveredEra] = useState<string | null>(null);

  const eraCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of captures) {
      const era = getEra(c.timestamp);
      counts[era] = (counts[era] || 0) + 1;
    }
    return counts;
  }, [captures]);

  const maxCount = Math.max(...Object.values(eraCounts), 1);
  const currentEra = selectedCapture ? getEra(selectedCapture.timestamp) : null;
  const eras = ["early-web", "browser-wars", "post-crash", "web-20", "mobile-transition", "flat-design", "platform-web", "ai-transition"];

  return (
    <div className="border border-rule bg-ink-panel p-4">
      <p className="text-colophon mb-3">Era fingerprint</p>
      <div className="flex items-end gap-1.5 h-16">
        {eras.map((era) => {
          const count = eraCounts[era] || 0;
          const height = count > 0 ? Math.max((count / maxCount) * 100, 8) : 0;
          const isActive = era === currentEra;
          const isHovered = era === hoveredEra;
          return (
            <Tooltip
              key={era}
              content={`${ERA_NAMES[era]}: ${count.toLocaleString()} snapshots`}
            >
              <button
                onClick={() => count > 0 && onSelectEra(era)}
                onMouseEnter={() => setHoveredEra(era)}
                onMouseLeave={() => setHoveredEra(null)}
                className={`
                  flex-1 min-h-[4px] transition-all duration-200 relative
                  ${count > 0 ? "cursor-pointer" : "cursor-default"}
                `}
                style={{ height: `${height}%` }}
                aria-label={`${ERA_NAMES[era]}: ${count} snapshots`}
              >
                <div
                  className={`
                    absolute inset-0 transition-colors duration-200
                    ${count === 0
                      ? "bg-rule/30"
                      : isActive
                        ? "bg-gold"
                        : isHovered
                          ? "bg-gold/60"
                          : "bg-gold/25"
                    }
                  `}
                />
              </button>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1">
        {eras.map((era) => (
          <div key={era} className="flex-1 text-center">
            <span className={`text-2xs font-mono transition-colors ${era === currentEra ? "text-gold" : "text-paper-dim"}`}>
              {ERA_NAMES[era]?.split(" ").map(w => w[0]).join("")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * QuickEraNav — era pills that jump to the first capture of each era.
 */
function QuickEraNav({
  captures,
  selectedIndex,
  onNavigate,
}: {
  captures: Capture[];
  selectedIndex: number;
  onNavigate: (capture: Capture) => void;
}) {
  const eras = useMemo(() => {
    const seen = new Map<string, number>();
    captures.forEach((c, i) => {
      const era = getEra(c.timestamp);
      if (!seen.has(era)) seen.set(era, i);
    });
    return Array.from(seen.entries()).map(([era, index]) => ({
      era,
      label: ERA_NAMES[era] || era,
      capture: captures[index],
    }));
  }, [captures]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {eras.map(({ era, label, capture }) => {
        const currentEra = getEra(captures[selectedIndex]?.timestamp || "");
        const isActive = era === currentEra;
        return (
          <button
            key={era}
            onClick={() => onNavigate(capture)}
            className={`text-2xs font-mono uppercase tracking-wider px-2.5 py-1 border transition-all duration-200 ${
              isActive
                ? "border-gold/40 text-gold bg-gold/5"
                : "border-transparent text-paper-dim hover:text-paper-faint hover:border-rule"
            }`}
            aria-label={`Jump to ${label} era`}
          >
            {label}
          </button>
        );
      })}
    </div>
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
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastWaybackUrl = useRef("");
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const atEnd = selectedIndex >= captures.length - 1;

  // Autoplay effect
  useEffect(() => {
    if (!isPlaying) return;
    if (atEnd) { setIsPlaying(false); return; }
    playRef.current = setInterval(() => {
      const next = captures[selectedIndex + 1];
      if (next) {
        router.push(`/explore/${domain}/${next.timestamp}`);
      } else {
        setIsPlaying(false);
      }
    }, AUTOPLAY_INTERVAL);
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [isPlaying, selectedIndex, captures, atEnd, domain, router]);

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
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
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

      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
        return;
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
            const target = captures.find(
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
      } else if (e.key === "r" || e.key === "R") {
        // Random jump
        if (captures.length < 2) return;
        setIsPlaying(false);
        let ri = Math.floor(Math.random() * captures.length);
        if (ri === selectedIndex) ri = (ri + 1) % captures.length;
        router.push(`/explore/${domain}/${captures[ri].timestamp}`);
      }
    },
    [goToPrevious, goToNext, captures, selectedIndex, domain, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
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

  const handleEraJump = useCallback((era: string) => {
    setIsPlaying(false);
    const firstCapture = captures.find((c) => getEra(c.timestamp) === era);
    if (firstCapture) router.push(`/explore/${domain}/${firstCapture.timestamp}`);
  }, [captures, domain, router]);

  const handleShuffle = useCallback(() => {
    setIsPlaying(false);
    if (captures.length < 2) return;
    let ri = Math.floor(Math.random() * captures.length);
    if (ri === selectedIndex) ri = (ri + 1) % captures.length;
    router.push(`/explore/${domain}/${captures[ri].timestamp}`);
  }, [captures, selectedIndex, domain, router]);

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
    <div className="relative min-h-screen flex flex-col">
      <SiteHeader wordmark innerClassName="max-w-7xl mx-auto px-4 md:px-6">
        <form onSubmit={handleSearch} className="flex-1 max-w-xs">
          <div className="group flex items-center gap-2 border-b border-rule focus-within:border-gold transition-colors duration-300 pb-1">
            <Search className="w-3.5 h-3.5 text-paper-dim shrink-0 group-focus-within:text-gold transition-colors" aria-hidden="true" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search a site"
              aria-label="Search for a website"
              size="sm"
            />
          </div>
        </form>

        {captures.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Link
              href={`/compare/${domain}/${captures[0].timestamp}/${captures[captures.length - 1].timestamp}`}
            >
              <Button variant="ghost" size="sm">
                <GitCompare className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Compare</span>
              </Button>
            </Link>

            {/* Play/Pause */}
            <Tooltip content={isPlaying ? "Pause time-lapse (Space)" : "Play time-lapse (Space)"}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying((p) => !p)}
                disabled={captures.length < 2 || (atEnd && !isPlaying)}
                aria-label={isPlaying ? "Pause time-lapse" : "Play time-lapse"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </Tooltip>

            {/* Random */}
            <Tooltip content="Random snapshot (R)">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShuffle}
                disabled={captures.length < 2}
                aria-label="Jump to random snapshot"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </Tooltip>

            <div className="w-px h-6 bg-rule" aria-hidden="true" />

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

            <div className="w-px h-6 bg-rule" aria-hidden="true" />

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

            {/* Keyboard shortcuts toggle */}
            <Tooltip content="Keyboard shortcuts">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShortcuts((s) => !s)}
                aria-label="Show keyboard shortcuts"
              >
                <Info className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        )}
      </SiteHeader>

      {/* Keyboard shortcuts overlay */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-ink-void/80 flex items-center justify-center"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border border-rule bg-ink-panel p-8 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-display text-xl text-paper mb-6">Keyboard shortcuts</h3>
              <div className="space-y-3">
                {[
                  ["← →", "Previous / Next snapshot"],
                  ["Shift + ← →", "Jump by month"],
                  ["Ctrl + ← →", "Jump by year"],
                  ["Home / End", "First / Last snapshot"],
                  ["Space", "Play / Pause time-lapse"],
                  ["R", "Random snapshot"],
                ].map(([key, desc]) => (
                  <div key={key} className="flex justify-between items-center">
                    <kbd className="font-mono text-xs px-2 py-1 border border-rule text-gold">{key}</kbd>
                    <span className="text-sm text-paper-faint">{desc}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-rule">
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-sm text-paper-dim hover:text-paper transition-colors"
                >
                  Press Esc or click outside to close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex pt-[56px]">
        {/* Left: Timeline + Viewer */}
        <div className="flex-1 min-w-0 px-6 md:px-10 py-8">
          <div className="max-w-5xl mx-auto">
            {timelineLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24"
              >
                <Loader2 className="w-6 h-6 text-paper-dim animate-spin mb-4" />
                <p className="text-colophon">Loading timeline</p>
              </motion.div>
            )}

            {timelineError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ErrorDisplay
                  error={timelineError}
                  onAction={() => window.location.reload()}
                />
              </motion.div>
            )}

            {!timelineLoading && !timelineError && captures.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Metadata bar */}
                {selectedCapture && (
                  <div className="mb-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
                      <span className="text-display text-2xl text-paper">{domain}</span>
                      <span className="text-paper-dim">/</span>
                      <span className="font-mono text-gold text-sm">
                        {formatDate(selectedCapture.timestamp)}
                      </span>
                      <span className="text-paper-dim font-mono text-xs">
                        — {selectedIndex + 1} of {captures.length.toLocaleString()}
                      </span>
                    </div>

                    {/* TimeMachineBar with play/random/era nav */}
                    <TimeMachineBar
                      captures={captures}
                      selectedIndex={selectedIndex}
                      onNavigate={(capture) => router.push(`/explore/${domain}/${capture.timestamp}`)}
                    />
                  </div>
                )}

                {/* Era Navigator Pills */}
                <div className="mb-6">
                  <QuickEraNav
                    captures={captures}
                    selectedIndex={selectedIndex}
                    onNavigate={(capture) => {
                      setIsPlaying(false);
                      router.push(`/explore/${domain}/${capture.timestamp}`);
                    }}
                  />
                </div>

                {/* Timeline with Era Bands */}
                <div className="mb-6">
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
                          className={`w-full transition-colors duration-150 cursor-pointer ${
                            selectedYear === yearData.year
                              ? "bg-gold"
                              : "bg-gold/25 group-hover:bg-gold/50"
                          }`}
                          style={{ height: `${Math.max(yearData.density * 100, 6)}%` }}
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
                            ? "text-gold font-medium"
                            : "text-paper-dim"
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

                {/* Scrubber with Change Markers */}
                <div className="mb-6">
                  <div
                    className="relative h-12 bg-ink-panel border border-rule overflow-hidden"
                    role="slider"
                    aria-label="Timeline scrubber"
                    aria-valuemin={0}
                    aria-valuemax={captures.length - 1}
                    aria-valuenow={selectedIndex}
                    aria-valuetext={selectedCapture ? formatDate(selectedCapture.timestamp) : ""}
                    tabIndex={0}
                  >
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
                                className="absolute -left-1 w-3 h-full bg-gold/10"
                                title="Coverage gap"
                              />
                            )}
                            <button
                              onClick={() =>
                                router.push(`/explore/${domain}/${capture.timestamp}`)
                              }
                              className={`w-1.5 h-1.5 rounded-full transition-colors duration-150 ${
                                selectedCapture?.timestamp === capture.timestamp
                                  ? "bg-gold scale-150"
                                  : "bg-paper-dim/50 hover:bg-gold hover:scale-125"
                              }`}
                              aria-label={`Select snapshot from ${formatDate(capture.timestamp)}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-colophon text-center mt-2">
                    ← → navigate · Shift ± month · Ctrl ± year · Space play · R random
                  </p>
                </div>

                {/* Era Fingerprint + Viewer */}
                <div className="grid lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-1 space-y-4">
                    {selectedCapture && (
                      <EraFingerprint
                        captures={captures}
                        selectedCapture={selectedCapture}
                        onSelectEra={handleEraJump}
                      />
                    )}

                    {/* Progress indicator */}
                    {captures.length > 0 && (
                      <div className="border border-rule bg-ink-panel p-4">
                        <p className="text-colophon mb-2">Position</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-display text-xl text-gold tabular-nums">{selectedIndex + 1}</span>
                          <span className="text-paper-dim font-mono text-xs">of {captures.length.toLocaleString()}</span>
                        </div>
                        <div className="mt-3 h-1 bg-ink-void">
                          <div
                            className="h-full bg-gold/40 transition-all duration-300"
                            style={{ width: `${((selectedIndex + 1) / captures.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-3">
                    {/* Viewer */}
                    {selectedCapture && (
                      <motion.div
                        key={selectedCapture.timestamp}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border border-rule bg-ink-panel overflow-hidden"
                      >
                        <div className="aspect-video relative bg-ink-void">
                          {(() => {
                            const showUrl = viewerState.waybackUrl || lastWaybackUrl.current;

                            if (viewerState.isLoading && !showUrl) {
                              return (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <Loader2 className="w-6 h-6 text-paper-dim animate-spin mb-4" />
                                  <p className="text-colophon">Loading snapshot</p>
                                </div>
                              );
                            }

                            if (showUrl) {
                              return (
                                <>
                                  {isIframeLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <Loader2 className="w-6 h-6 text-paper-dim animate-spin mb-4" />
                                      <p className="text-colophon">Rendering snapshot</p>
                                    </div>
                                  )}
                                  <div className={`h-full transition-opacity duration-300 ${isIframeLoading ? 'opacity-0' : 'opacity-100'}`}>
                                    <iframe
                                      src={showUrl}
                                      className="w-full h-full border-0 bg-ink-void"
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
                                <div className="absolute inset-0">
                                  <ErrorDisplay
                                    error={viewerState.error}
                                    onAction={() => window.location.reload()}
                                    className="h-full justify-center"
                                  />
                                </div>
                              );
                            }

                            return null;
                          })()}

                          {/* Playing indicator overlay */}
                          {isPlaying && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-ink-void/80 border border-gold/30"
                            >
                              <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                              <span className="text-2xs font-mono text-gold uppercase tracking-wider">Playing</span>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {!timelineLoading && !timelineError && captures.length === 0 && (
              <ErrorDisplay
                error={{ code: "NO_COVERAGE", domain }}
                onAction={() => router.push("/")}
              />
            )}
          </div>
        </div>

        {/* Right: Context Panel */}
        <div className="hidden lg:block w-72 border-l border-rule bg-ink-void">
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
          <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading explore page">
            <Loader2 className="w-6 h-6 text-paper-dim animate-spin" />
          </div>
        }
      >
        <ExploreContent />
      </Suspense>
    </main>
  );
}
