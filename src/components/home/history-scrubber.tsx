"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
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
 * One single coordinate frame: every element (era bands, milestone dots,
 * year labels, decade ticks) is positioned by its real temporal position
 * via `yearToPercent`. This guarantees the era bands, dots, and axis all
 * agree — nothing can drift out of alignment.
 *
 * Clicking a milestone jumps to a search for the associated site.
 *
 * Label collisions are resolved by a greedy column-packing algorithm that
 * assigns each label to one of three vertical lanes based on its x-position.
 */
export function HistoryScrubber() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const totalSpan = MILESTONE_RANGE_END - MILESTONE_RANGE_START || 1;

  const yearToPercent = (year: number) =>
    ((year - MILESTONE_RANGE_START) / totalSpan) * 100;

  const [playhead, setPlayhead] = React.useState(reduced ? 100 : 0);
  const animatingRef = React.useRef<number | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = React.useState<string | null>(null);

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

  // Greedy lane assignment: each label needs ~8% width to not collide.
  // Walk milestones left→right, assign the first lane whose last occupant
  // is far enough away. Three lanes is enough for this dataset.
  const MIN_LABEL_GAP = 8.5;
  const positionedMilestones = React.useMemo(() => {
    const lanes: number[] = [-Infinity, -Infinity, -Infinity];
    return milestones.map((m) => {
      const pct = yearToPercent(m.year);
      let lane = 0;
      for (let i = 0; i < lanes.length; i++) {
        if (pct - lanes[i] >= MIN_LABEL_GAP) {
          lane = i;
          break;
        }
        lane = i + 1 < lanes.length ? i + 1 : i;
      }
      if (lane >= lanes.length) lane = lanes.length - 1;
      lanes[lane] = pct;
      return { ...m, pct, lane };
    });
  }, [totalSpan]); // eslint-disable-line react-hooks/exhaustive-deps

  // Decade ticks at real temporal positions: 2000, 2010, 2020.
  const decadeTicks = React.useMemo(() => {
    const ticks: { year: number; pct: number }[] = [];
    for (let y = 2000; y < MILESTONE_RANGE_END; y += 10) {
      ticks.push({ year: y, pct: yearToPercent(y) });
    }
    return ticks;
  }, [totalSpan]); // eslint-disable-line react-hooks/exhaustive-deps

  const isHovered = (m: { label: string }) => hoveredMilestone === m.label;

  return (
    <div
      className="w-full select-none"
      aria-label="Web history timeline, 1991 to today"
    >
      {/* ─── The timeline rail (single coordinate frame) ─── */}
      <div className="relative">
        {/* Era bands */}
        <div className="relative h-10 border border-rule bg-ink-void overflow-hidden">
          {eraSegments.map((era) => {
            const left = yearToPercent(era.start);
            const width = yearToPercent(era.end) - left;
            return (
              <div
                key={era.slug}
                className="absolute top-0 bottom-0 border-r border-rule last:border-r-0 transition-opacity duration-300"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: eraColorVar[era.slug],
                  opacity: 0.16,
                }}
              >
                {width > 10 && (
                  <span className="absolute top-1.5 left-2 text-2xs font-mono uppercase tracking-wider text-paper-dim">
                    {era.name}
                  </span>
                )}
              </div>
            );
          })}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-px bg-gold pointer-events-none z-20"
            style={{ left: `${playhead}%` }}
            aria-hidden="true"
          >
            <div className="absolute -top-1 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-gold" />
          </div>

          {/* Milestone dots — sit ON the rail */}
          {positionedMilestones.map((m) => (
            <button
              key={`dot-${m.label}`}
              onClick={() => handleMilestoneClick(m.site)}
              onMouseEnter={() => setHoveredMilestone(m.label)}
              onMouseLeave={() => setHoveredMilestone(null)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 group"
              style={{ left: `${m.pct}%` }}
              aria-label={`${m.label} (${m.year}) — search ${m.site}`}
            >
              <span
                className={`block rounded-full transition-all duration-200 ${
                  isHovered(m)
                    ? "w-3 h-3 bg-gold ring-2 ring-gold/30 ring-offset-2 ring-offset-ink-void"
                    : "w-2 h-2 bg-gold/60 hover:bg-gold"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Hover tooltip — the label + year, shown on hover, anchored to dot */}
        {positionedMilestones.map((m) => (
          <div
            key={`tip-${m.label}`}
            className={`absolute z-30 pointer-events-none -translate-x-1/2 transition-opacity duration-150 ${
              isHovered(m) ? "opacity-100" : "opacity-0"
            }`}
            style={{ left: `${m.pct}%`, top: "-44px" }}
          >
            <div className="bg-ink-raised border border-gold/40 px-2.5 py-1 whitespace-nowrap text-center">
              <span className="block font-mono text-gold text-xs leading-tight">{m.year}</span>
              <span className="block font-serif text-paper text-xs leading-tight italic">{m.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Year labels — three staggered lanes below the rail ─── */}
      <div className="relative h-12 mt-1">
        {positionedMilestones.map((m) => (
          <button
            key={`lbl-${m.label}`}
            onClick={() => handleMilestoneClick(m.site)}
            onMouseEnter={() => setHoveredMilestone(m.label)}
            onMouseLeave={() => setHoveredMilestone(null)}
            className="absolute -translate-x-1/2"
            style={{
              left: `${m.pct}%`,
              top: `${m.lane * 16}px`,
            }}
          >
            <span
              className={`text-2xs font-mono whitespace-nowrap transition-colors ${
                isHovered(m) ? "text-gold font-medium" : "text-paper-dim hover:text-paper-faint"
              }`}
            >
              {m.year}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Decade axis — ticks at real temporal positions ─── */}
      <div className="relative h-5 mt-2 border-t border-rule">
        {decadeTicks.map((tick) => (
          <div
            key={tick.year}
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `${tick.pct}%` }}
          >
            <div className="w-px h-1.5 bg-rule-bright" />
            <span className="absolute top-2.5 left-1/2 -translate-x-1/2 text-2xs font-mono text-paper-dim whitespace-nowrap">
              {tick.year}
            </span>
          </div>
        ))}
      </div>

      {/* Range endpoints */}
      <div className="flex justify-between mt-7">
        <span className="text-2xs font-mono text-gold font-medium">{MILESTONE_RANGE_START}</span>
        <span className="text-2xs font-mono text-gold font-medium">{MILESTONE_RANGE_END}</span>
      </div>
    </div>
  );
}
