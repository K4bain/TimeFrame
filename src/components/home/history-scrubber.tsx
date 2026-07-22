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
 *
 * Year labels are staggered into two rows to prevent collisions when
 * milestones are temporally close (e.g. 2004/2005).
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

  // Pre-compute milestone positions and detect collisions to stagger labels.
  // Milestones within 6% width of each other get alternated to row 1 / row 2.
  const positionedMilestones = React.useMemo(() => {
    let currentRow = 0;
    let prevPct = -Infinity;
    return milestones.map((m) => {
      const pct = yearToPercent(m.year);
      if (pct - prevPct < 6) {
        // Collides with previous — flip the row.
        currentRow = currentRow === 0 ? 1 : 0;
      } else {
        currentRow = 0;
      }
      prevPct = pct;
      return { ...m, pct, labelRow: currentRow };
    });
  }, [totalSpan]); // eslint-disable-line react-hooks/exhaustive-deps

  // Decade ticks positioned by actual temporal position (NOT evenly spaced).
  const decadeTicks = React.useMemo(() => {
    const ticks: { year: number; pct: number }[] = [];
    for (let y = Math.ceil(MILESTONE_RANGE_START / 10) * 10; y <= MILESTONE_RANGE_END; y += 10) {
      ticks.push({ year: y, pct: yearToPercent(y) });
    }
    return ticks;
  }, [totalSpan]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full select-none" aria-label="Web history timeline, 1991 to today">
      {/* Era bands */}
      <div className="relative h-9 border border-rule bg-ink-void overflow-hidden">
        {eraSegments.map((era) => {
          const left = yearToPercent(era.start);
          const width = yearToPercent(era.end) - left;
          return (
            <div
              key={era.slug}
              className="absolute top-0 bottom-0 border-r border-rule last:border-r-0 hover:opacity-70 transition-opacity duration-300"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                backgroundColor: eraColorVar[era.slug],
                opacity: 0.18,
              }}
            >
              {width > 9 && (
                <span className="absolute top-1.5 left-2 text-2xs font-mono uppercase tracking-wider text-paper-dim">
                  {era.name}
                </span>
              )}
            </div>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-gold pointer-events-none z-10"
          style={{ left: `${playhead}%` }}
          aria-hidden="true"
        >
          <div className="absolute -top-0.5 -translate-x-1/2 w-2 h-2 rotate-45 bg-gold" />
        </div>
      </div>

      {/* Milestone dots (positioned on a baseline row) */}
      <div className="relative h-6 mt-1">
        {positionedMilestones.map((m) => (
          <div
            key={m.label}
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `${m.pct}%` }}
          >
            <Tooltip content={`${m.year} · ${m.label}`}>
              <button
                onClick={() => handleMilestoneClick(m.site)}
                className="group flex flex-col items-center pt-1"
                aria-label={`${m.label} (${m.year}) — search ${m.site}`}
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-gold/50 group-hover:bg-gold group-hover:scale-[1.8] transition-all duration-200" />
              </button>
            </Tooltip>
          </div>
        ))}
      </div>

      {/* Year labels — staggered into two rows to prevent collision */}
      <div className="relative h-10">
        {positionedMilestones.map((m) => (
          <div
            key={`label-${m.label}`}
            className="absolute -translate-x-1/2 group/label"
            style={{
              left: `${m.pct}%`,
              top: m.labelRow === 1 ? "20px" : "0px",
            }}
          >
            <Tooltip content={`${m.label}`}>
              <span className="text-2xs font-mono text-paper-dim group-hover/label:text-gold transition-colors whitespace-nowrap cursor-default">
                {m.year}
              </span>
            </Tooltip>
          </div>
        ))}
      </div>

      {/* Decade axis — positioned by actual temporal position */}
      <div className="relative h-6 mt-1 border-t border-rule pt-1">
        {decadeTicks.map((tick) => (
          <div
            key={tick.year}
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `${tick.pct}%` }}
          >
            <div className="w-px h-1.5 bg-rule-bright mx-auto" />
            <span className="absolute top-2.5 left-1/2 -translate-x-1/2 text-2xs font-mono text-paper-dim whitespace-nowrap">
              {tick.year}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
