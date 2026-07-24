"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { collections } from "@/features/collections/data";
import { trpc } from "@/lib/api/trpc";
import { formatDate } from "@/utils";
import Link from "next/link";

const HERO_EASE = [0.16, 1, 0.3, 1] as const;

interface SiteData {
  site: string;
  firstCapture: string;
  lastCapture: string;
  totalCaptures: number;
  yearCounts: number[];
}

function MiniSparkline({ data, max }: { data: number[]; max: number }) {
  if (data.length === 0) return null;
  const localMax = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-px h-4">
      {data.map((count, i) => (
        <div
          key={i}
          className="flex-1 min-w-[2px] bg-gold/30 transition-colors duration-200"
          style={{ height: `${Math.max((count / localMax) * 100, 4)}%` }}
        />
      ))}
    </div>
  );
}

function CollectionsContent() {
  const [siteDataMap, setSiteDataMap] = useState<Record<string, SiteData>>({});
  const utils = trpc.useUtils();

  useEffect(() => {
    const allSites = collections.flatMap((c) => c.websites);
    const uniqueSites = [...new Set(allSites)];

    let cancelled = false;

    async function loadAll() {
      const results: Record<string, SiteData> = {};
      await Promise.all(
        uniqueSites.map(async (site) => {
          try {
            const data = await utils.archive.getTimeline.fetch({ domain: site });
            if (data.success && data.data.totalCount > 0) {
              const yearCounts: Record<number, number> = {};
              for (const capture of data.data.snapshots.slice(0, 200)) {
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

              results[site] = {
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
        })
      );
      if (!cancelled) setSiteDataMap(results);
    }

    loadAll();
    return () => { cancelled = true; };
  }, [utils]);

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: HERO_EASE }}
      >
        <div className="mb-12 pb-6 border-b border-rule">
          <span className="text-eyebrow">Exhibits</span>
          <h1 className="text-display text-4xl md:text-6xl text-paper mt-3 mb-4">
            Explore the web&rsquo;s history
          </h1>
          <p className="text-paper-faint max-w-xl leading-relaxed">
            Curated exhibits that trace the evolution of websites, platforms,
            and the internet itself — assembled from millions of archived snapshots.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {collections.map((collection, i) => {
            const siteData = collection.websites
              .map((site) => siteDataMap[site])
              .filter((d): d is SiteData => !!d);

            const totalCaptures = siteData.reduce((sum, d) => sum + d.totalCaptures, 0);
            const allYearCounts = siteData.reduce<number[]>((acc, d) => {
              if (acc.length === 0) return d.yearCounts;
              const merged = [...acc];
              for (let j = 0; j < d.yearCounts.length && j < merged.length; j++) {
                merged[merged.length - 1 - (merged.length - 1 - Math.min(j, merged.length - 1))] =
                  (merged[Math.min(j, merged.length - 1)] || 0) + d.yearCounts[j];
              }
              return merged;
            }, []);

            return (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: HERO_EASE, delay: i * 0.05 }}
              >
                <Link href={`/collections/${collection.id}`} className="group block h-full bg-ink-panel p-8 md:p-10 rounded-xl border border-rule hover:border-gold/30 hover:bg-ink-raised hover:shadow-[var(--shadow-glow-amber)] transition-all duration-300">
                  <div className="text-colophon mb-6">
                    {String(i + 1).padStart(2, "0")} — {collection.websites.length} sites
                    {totalCaptures > 0 && (
                      <span className="text-paper-dim ml-2">
                        {totalCaptures.toLocaleString()} snapshots
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl text-paper mb-3 leading-tight group-hover:text-gold transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-paper-faint leading-relaxed line-clamp-3 mb-6">
                    {collection.description}
                  </p>

                  {allYearCounts.length > 0 && (
                    <div className="mb-6 opacity-40 group-hover:opacity-80 transition-opacity">
                      <MiniSparkline data={allYearCounts} max={0} />
                    </div>
                  )}

                  <div className="space-y-1.5 mb-6">
                    {collection.websites.slice(0, 3).map((site) => {
                      const data = siteDataMap[site];
                      return (
                        <div key={site} className="flex items-center justify-between">
                          <span className="text-xs font-mono text-paper-dim group-hover:text-paper-faint transition-colors">
                            {site}
                          </span>
                          {data && (
                            <span className="text-2xs font-mono text-paper-dim">
                              {formatDate(data.firstCapture).slice(-4)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {collection.websites.length > 3 && (
                      <span className="text-2xs font-mono text-paper-dim">
                        +{collection.websites.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    View exhibit
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <main className="min-h-screen tf-aurora">
      <SiteHeader
        backHref="/"
        backLabel="Back to home"
        title="Collections"
        subtitle="Curated exhibits"
      />

      <div className="pt-[56px]">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading collections">
              <Loader2 className="w-6 h-6 text-paper-dim animate-spin" />
            </div>
          }
        >
          <CollectionsContent />
        </Suspense>
      </div>
    </main>
  );
}
