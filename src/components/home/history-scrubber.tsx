"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";
import {
  milestones,
  eraSegments,
  eraColorVar,
  MILESTONE_RANGE_START,
  MILESTONE_RANGE_END,
} from "@/features/home/milestones";

/**
 * HistoryScrubber — homepage hero element.
 *
 * A full-width scrubber spanning the web's history (1991→today). Renders:
 *  - era bands colored per the era-tint tokens
 *  - milestone dots with hover tooltips showing the year + label
 *  - a playhead that sweeps across on mount (or sits static under
 *    prefers-reduced-motion)
 *
 * Clicking a milestone jumps to a search for the associated site — so the
 * timeline functions as a discovery surface, not decoration (MOT.1.1).
 *
 * The scrubber is a discrete control (not free-form dragging): interaction
 * happens via milestone dots, matching MOT.3.5 ("no animation during scrub").
 *
 * Spec reference: MOT.1, MOT.2, MOT.3.5, ACC.3.1.
 */
export function HistoryScrubber() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const totalSpan = MILESTONE_RANGE_END - MILESTONE_RANGE_START || 1;

  const yearToPercent = (year: number) =>
    ((year - MILESTONE_RANGE_START) / totalSpan) * 100;

  // Playhead sweep. Animates from start to ~"today" once on mount.
  // Position stored as a percentage (0-100). Under reduced motion it
  // jumps directly to its resting position without transition.
  const [playhead, setPlayhead] = React.useState(
    reduced ? 100 : 0
  );
  const animatingRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (reduced) {
      setPlayhead(100);
      return;
    }
    // Use rAF to animate the playhead; CSS transitions are off-limits
    // here because we're driving position imperatively.
    const start = performance.now();
    const duration = 1600; // single cinematic sweep, ~MOT.1.2 ceiling
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setPlayhead(eased * 100);
      if (t < 1) {
        animatingRef.current = requestAnimationFrame(tick);
      }
    };
    animatingRef.current = requestAnimationFrame(tick);
    return () => {
      if (animatingRef.current) cancelAnimationFrame(animatingRef.current);
    };
  }, [reduced]);

  const handleMilestoneClick = (site: string) => {
    router.push(`/search?q=${encodeURIComponent(site)}`);
  };

  return (
    <div className="w-full select-none" aria-label="Web history timeline, 1991 to today">
      {/* Era bands */}
      <div className="relative h-7 rounded-md overflow-hidden border border-border-subtle bg-bg-surface">
        {eraSegments.map((era) => {
          const left = yearToPercent(era.start);
          const width = yearToPercent(era.end) - left;
          return (
            <div
              key={era.slug}
              className="absolute top-0 bottom-0 border-r border-bg-base/40 last:border-r-0"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: eraColorVar[era.slug],
                opacity: 0.22,
              }}
            >
              {width > 8 && (
                <span className="absolute top-1 left-1.5 text-2xs uppercase tracking-wider font-medium text-text-tertiary">
                  {era.name}
                </span>
              )}
            </div>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-temporal-primary shadow-temporal pointer-events-none"
          style={{ left: `${playhead}%`, opacity: 0.9 }}
          aria-hidden="true"
        >
          <div className="absolute -top-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-temporal-primary" />
        </div>
      </div>

      {/* Milestone dots + axis */}
      <div className="relative h-12 mt-1">
        {milestones.map((m) => {
          const pct = yearToPercent(m.year);
          return (
            <div
              key={m.label}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${pct}%` }}
            >
              <Tooltip content={`${m.year} · ${m.label}`}>
                <button
                  onClick={() => handleMilestoneClick(m.site)}
                  className="group flex flex-col items-center pt-1.5"
                  style={{ marginLeft: "50%" }}
                  aria-label={`${m.label} (${m.year}) — search ${m.site}`}
                >
                  <span className="w-2 h-2 rounded-full bg-temporal-primary/70 group-hover:bg-temporal-primary group-hover:scale-125 transition-transform duration-150" />
                </button>
              </Tooltip>
            </div>
          );
        })}

        {/* Year axis */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-2xs font-mono text-text-muted px-0.5">
          <span>{MILESTONE_RANGE_START}</span>
          <span className="opacity-60">2000</span>
          <span className="opacity-60">2010</span>
          <span className="opacity-60">2020</span>
          <span>{MILESTONE_RANGE_END}</span>
        </div>
      </div>
    </div>
  );
}
