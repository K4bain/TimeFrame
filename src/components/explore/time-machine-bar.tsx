"use client";

import * as React from "react";
import { Play, Pause, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEra } from "@/utils";
import type { Capture } from "@/types";

/**
 * TimeMachineBar — playful navigation controls for the explore view.
 *
 * Makes the archive feel alive rather than static:
 *  - Play/Pause: auto-advances through snapshots on a timer (a flipbook
 *    of the site's evolution). Pauses at the end of the timeline.
 *  - Shuffle: jumps to a random capture — surfaces forgotten eras.
 *  - Era pills: jump to the first capture of each era this site lived
 *    through. A guided tour through web-history periods.
 *
 * Fully client-side; takes a `navigate(capture)` callback so it stays
 * decoupled from routing. Respects prefers-reduced-motion (longer interval).
 */

interface TimeMachineBarProps {
  captures: Capture[];
  selectedIndex: number;
  onNavigate: (capture: Capture) => void;
  className?: string;
}

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

const AUTOPLAY_INTERVAL = 1400;

export function TimeMachineBar({
  captures,
  selectedIndex,
  onNavigate,
  className,
}: TimeMachineBarProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop autoplay when the user reaches the final snapshot.
  const atEnd = selectedIndex >= captures.length - 1;

  // Compute which eras are present + the first capture index of each.
  const eras = React.useMemo(() => {
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

  // Drive the autoplay.
  React.useEffect(() => {
    if (!isPlaying) return;
    if (atEnd) {
      setIsPlaying(false);
      return;
    }
    const interval = prefersReducedMotion ? AUTOPLAY_INTERVAL * 2 : AUTOPLAY_INTERVAL;
    intervalRef.current = setInterval(() => {
      const next = captures[selectedIndex + 1];
      if (next) {
        onNavigate(next);
      } else {
        setIsPlaying(false);
      }
    }, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, selectedIndex, captures, atEnd, onNavigate, prefersReducedMotion]);

  // Clean up on unmount.
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const togglePlay = () => {
    if (atEnd && !isPlaying) return;
    setIsPlaying((p) => !p);
  };

  const handleShuffle = () => {
    setIsPlaying(false);
    if (captures.length === 0) return;
    const current = selectedIndex;
    let randomIndex = Math.floor(Math.random() * captures.length);
    // Avoid landing on the same snapshot.
    if (randomIndex === current && captures.length > 1) {
      randomIndex = (randomIndex + 1) % captures.length;
    }
    onNavigate(captures[randomIndex]);
  };

  const handleEraJump = (capture: Capture) => {
    setIsPlaying(false);
    onNavigate(capture);
  };

  if (captures.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-3", className)}>
      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        disabled={captures.length < 2}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 border text-xs font-mono uppercase tracking-wider transition-colors",
          isPlaying
            ? "border-gold text-gold bg-gold/5"
            : "border-rule text-paper-faint hover:border-gold hover:text-gold",
          captures.length < 2 && "opacity-40 cursor-not-allowed"
        )}
        aria-label={isPlaying ? "Pause time-lapse" : "Play time-lapse through snapshots"}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        {isPlaying ? "Pause" : atEnd ? "Replay" : "Play"}
      </button>

      {/* Shuffle */}
      <button
        onClick={handleShuffle}
        disabled={captures.length < 2}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 border border-rule text-xs font-mono uppercase tracking-wider text-paper-faint hover:border-gold hover:text-gold transition-colors",
          captures.length < 2 && "opacity-40 cursor-not-allowed"
        )}
        aria-label="Jump to a random moment"
      >
        <Shuffle className="w-3.5 h-3.5" />
        Random
      </button>

      {/* Position indicator */}
      <span className="text-2xs font-mono text-paper-dim tabular-nums">
        {selectedIndex + 1} / {captures.length}
      </span>

      {/* Divider */}
      <span className="hidden sm:block w-px h-4 bg-rule" aria-hidden="true" />

      {/* Era navigator */}
      <div className="flex flex-wrap items-center gap-1.5">
        {eras.map(({ era, label, capture }) => {
          const currentEra = getEra(captures[selectedIndex]?.timestamp || "");
          const isActive = era === currentEra;
          return (
            <button
              key={era}
              onClick={() => handleEraJump(capture)}
              className={cn(
                "text-2xs font-mono uppercase tracking-wider px-2 py-1 border transition-colors",
                isActive
                  ? "border-gold/40 text-gold bg-gold/5"
                  : "border-transparent text-paper-dim hover:text-paper-faint hover:border-rule"
              )}
              aria-label={`Jump to ${label} era`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}
