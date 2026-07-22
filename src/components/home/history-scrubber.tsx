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
 * timeline functions as a discovery surface, not decoration.
 */
export function HistoryScrubber() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const totalSpan = MILESTONE_RANGE_END - MILESTONE_RANGE_START || 1;

  const yearToPercent = (year: number) =>
    ((year - MILESTONE_RANGE_START) / totalSpan) * 100;

  const [playhead, setPlayhead] = React.useState(reduced ? 100 : 0);
  const animatingRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (reduced) {
      setPlayhead(100);
      return;
    }
    const start = performance.now();
    const duration = 1800;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
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
      <div className="relative h-10 rounded-lg overflow-hidden border border-glass-border bg-bg-surface">
        {eraSegments.map((era) => {
          const left = yearToPercent(era.start);
          const width = yearToPercent(era.end) - left;
          return (
            <div
              key={era.slug}
              className="absolute top-0 bottom-0 border-r border-bg-base/30 last:border-r-0 transition-opacity duration-500 hover:opacity-40"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: eraColorVar[era.slug],
                opacity: 0.25,
              }}
            >
              {width > 8 && (
                <span className="absolute top-1.5 left-2 text-2xs uppercase tracking-wider font-medium text-text-secondary">
                  {era.name}
                </span>
              )}
            </div>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-glow-amber pointer-events-none z-10"
          style={{ left: `${playhead}%` }}
          aria-hidden="true"
        >
          <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 rotate-45 bg-amber-400 shadow-glow-amber" />
        </div>
      </div>

      {/* Milestone dots */}
      <div className="relative h-16 mt-2">
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
                  className="group flex flex-col items-center gap-1.5 pt-2"
                  aria-label={`${m.label} (${m.year}) — search ${m.site}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60 group-hover:bg-amber-400 group-hover:scale-150 group-hover:shadow-glow-amber transition-all duration-200" />
                  <span className="text-2xs font-mono text-text-muted group-hover:text-amber-300 transition-colors whitespace-nowrap">
                    {m.year}
                  </span>
                </button>
              </Tooltip>
            </div>
          );
        })}

        {/* Year axis */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-2xs font-mono text-text-muted px-1 pt-3 border-t border-glass-border mt-8">
          <span>{MILESTONE_RANGE_START}</span>
          <span className="opacity-50">2000</span>
          <span className="opacity-50">2010</span>
          <span className="opacity-50">2020</span>
          <span>{MILESTONE_RANGE_END}</span>
        </div>
      </div>
    </div>
  );
}
