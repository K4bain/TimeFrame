"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { getCollection } from "@/features/collections/data";
import { formatDate, getEra } from "@/utils";
import Link from "next/link";
import { trpc } from "@/lib/api/trpc";
import type { Collection } from "@/types";

const HERO_EASE = [0.16, 1, 0.3, 1] as const;

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

interface SiteSnapshot {
  site: string;
  firstCapture: string;
  lastCapture: string;
  totalCaptures: number;
  yearCounts: number[];
}

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null;
  const localMax = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-px h-3 opacity-30 group-hover:opacity-70 transition-opacity">
      {data.map((count, i) => (
        <div
          key={i}
          className="flex-1 min-w-[1px] bg-gold/40"
          style={{ height: `${Math.max((count / localMax) * 100, 6)}%` }}
        />
      ))}
    </div>
  );
}

function CollectionDetailContent() {
  const params = useParams();
  const id = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [snapshots, setSnapshots] = useState<SiteSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const utils = trpc.useUtils();
  const utilsRef = useRef(utils);
  utilsRef.current = utils;

  useEffect(() => {
    const coll = getCollection(id);
    if (!coll) {
      setIsLoading(false);
      return;
    }
    setCollection(coll);

    let cancelled = false;

    async function loadSites() {
      const results = await Promise.all(
        coll!.websites.map(async (site) => {
          try {
            const data = await utilsRef.current.archive.getTimeline.fetch({ domain: site });
            if (data.success && data.data.totalCount > 0) {
              // Build year counts
              const yearCounts: Record<number, number> = {};
              for (const capture of data.data.captures.slice(0, 200)) {
                const year = parseInt(capture.timestamp.slice(0, 4), 10);
                yearCounts[year] = (yearCounts[year] || 0) + 1;
              }
              const years = Object.keys(yearCounts).map(Number).sort();
              const minYear = years[0] || 2000;
              const maxYear = years[years.length - 1] || 2024;
              const fullYears: number[] = [];
              for (let y = minYear; y <= maxYear; y++) {
                fullYears.push(yearCounts[y] || 0);
              }

              return {
                site,
                firstCapture: data.data.firstSnapshot,
                lastCapture: data.data.lastSnapshot,
                totalCaptures: data.data.totalCount,
                yearCounts: fullYears,
              };
            }
          } catch {
            // Skip failed sites
          }
          return null;
        })
      );
      if (!cancelled) {
        setSnapshots(results.filter((r): r is NonNullable<typeof r> => r !== null));
        setIsLoading(false);
      }
    }

    loadSites();

    return () => { cancelled = true; };
  }, [id]);

  const totalAllCaptures = snapshots.reduce((sum, s) => sum + s.totalCaptures, 0);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16">
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-paper-dim animate-spin mb-4" />
          <p className="text-colophon">Loading collection</p>
        </div>
      )}

      {!isLoading && !collection && (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-paper-faint mb-6">Collection not found</p>
          <Link href="/collections">
            <Button variant="outline">Browse collections</Button>
          </Link>
        </div>
      )}

      {!isLoading && collection && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: HERO_EASE }}
        >
          {/* Header */}
          <div className="mb-12 pb-6 border-b border-rule">
            <Link
              href="/collections"
              className="text-colophon hover:text-gold transition-colors"
            >
              ← Exhibit
            </Link>
            <h1 className="text-display text-4xl md:text-6xl text-paper mt-4 mb-4">
              {collection.title}
            </h1>
            <p className="text-paper-faint max-w-2xl leading-relaxed mb-6">
              {collection.description}
            </p>

            {/* Collection stats */}
            <div className="grid grid-cols-3 gap-px bg-rule max-w-md">
              <div className="bg-ink-panel p-4">
                <p className="text-display text-2xl text-gold">{snapshots.length}</p>
                <p className="text-2xs font-mono text-paper-dim mt-1">Sites</p>
              </div>
              <div className="bg-ink-panel p-4">
                <p className="text-display text-2xl text-gold">{totalAllCaptures.toLocaleString()}</p>
                <p className="text-2xs font-mono text-paper-dim mt-1">Snapshots</p>
              </div>
              <div className="bg-ink-panel p-4">
                <p className="text-display text-2xl text-gold">
                  {snapshots.length > 0
                    ? (() => {
                        const earliest = snapshots.reduce((min, s) =>
                          s.firstCapture < min ? s.firstCapture : min,
                          snapshots[0].firstCapture
                        );
                        return formatDate(earliest).slice(-4);
                      })()
                    : "—"}
                </p>
                <p className="text-2xs font-mono text-paper-dim mt-1">Earliest</p>
              </div>
            </div>
          </div>

          {snapshots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <p className="text-paper-faint">No sites with archive data found</p>
            </div>
          )}

          {/* Sites list */}
          <div className="border-t border-rule">
            {snapshots.map((snapshot, i) => {
              const firstEra = getEra(snapshot.firstCapture);
              const lastEra = getEra(snapshot.lastCapture);
              return (
                <motion.div
                  key={snapshot.site}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: HERO_EASE, delay: i * 0.04 }}
                >
                  <Link href={`/explore/${snapshot.site}/${snapshot.firstCapture}`} className="group block border-b border-rule hover:bg-ink-panel transition-colors duration-200">
                    <div className="py-6 px-1 flex items-start justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-colophon">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <h3 className="font-display text-xl text-paper group-hover:text-gold transition-colors">
                            {snapshot.site}
                          </h3>
                        </div>

                        {/* Sparkline */}
                        <div className="mb-2 max-w-xs">
                          <MiniSparkline data={snapshot.yearCounts} />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-paper-dim font-mono">
                          <span>{snapshot.totalCaptures.toLocaleString()} snapshots</span>
                          {firstEra === lastEra ? (
                            <span className="text-gold/60">{ERA_NAMES[firstEra] || firstEra}</span>
                          ) : (
                            <span className="text-gold/60">
                              {ERA_NAMES[firstEra]} → {ERA_NAMES[lastEra]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-paper-dim font-mono space-y-0.5">
                          <p>First <span className="text-gold">{formatDate(snapshot.firstCapture)}</span></p>
                          <p>Last <span className="text-gold">{formatDate(snapshot.lastCapture)}</span></p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gold mt-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function CollectionDetailPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader
        backHref="/collections"
        backLabel="Back to collections"
        title="Collection"
      />

      <div className="pt-[56px]">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading collection">
              <Loader2 className="w-6 h-6 text-paper-dim animate-spin" />
            </div>
          }
        >
          <CollectionDetailContent />
        </Suspense>
      </div>
    </main>
  );
}
