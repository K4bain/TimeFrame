"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/layout/site-header";
import { AuroraBackground } from "@/components/aurora-background";
import { getCollection } from "@/features/collections/data";
import { formatDate } from "@/utils";
import Link from "next/link";
import { trpc } from "@/lib/api/trpc";
import type { Collection } from "@/types";

const HERO_EASE = [0.16, 1, 0.3, 1] as const;

interface SiteSnapshot {
  site: string;
  firstCapture: string;
  lastCapture: string;
  totalCaptures: number;
}

export default function CollectionDetailPage() {
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
              return {
                site,
                firstCapture: data.data.firstSnapshot,
                lastCapture: data.data.lastSnapshot,
                totalCaptures: data.data.totalCount,
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

  return (
    <main className="min-h-screen">
      <AuroraBackground />
      <div className="relative z-10">
        <SiteHeader
          backHref="/collections"
          backLabel="Back to collections"
          title={collection?.title || "Collection"}
        />

        <div className="pt-[52px]">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-text-muted animate-spin mb-4" />
                <p className="text-text-muted">Loading collection…</p>
              </div>
            )}

            {!isLoading && !collection && (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-text-muted">Collection not found</p>
                <Link href="/collections">
                  <Button variant="outline" className="mt-4">
                    Browse collections
                  </Button>
                </Link>
              </div>
            )}

            {!isLoading && collection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: HERO_EASE }}
              >
                <div className="mb-10">
                  <Link
                    href="/collections"
                    className="text-2xs uppercase tracking-[0.2em] text-amber-400 font-medium hover:text-amber-300 transition-colors"
                  >
                    ← Exhibit
                  </Link>
                  <h1 className="text-display text-4xl md:text-5xl text-text-primary mt-3 mb-3">
                    {collection.title}
                  </h1>
                  <p className="text-text-tertiary max-w-2xl leading-relaxed">
                    {collection.description}
                  </p>
                </div>

                {snapshots.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-text-muted">No sites with archive data found</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {snapshots.map((snapshot, i) => (
                    <motion.div
                      key={snapshot.site}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: HERO_EASE, delay: i * 0.05 }}
                    >
                      <Link href={`/explore/${snapshot.site}/${snapshot.firstCapture}`} className="block group">
                        <Card className="h-full hover:shadow-glow-amber hover:-translate-y-0.5 transition-all duration-300">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-display text-lg text-text-primary group-hover:tf-text-gradient transition-all">
                                  {snapshot.site}
                                </h3>
                                <p className="text-sm text-text-muted">
                                  {snapshot.totalCaptures.toLocaleString()} snapshots
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                            </div>

                            <div className="text-xs text-text-muted font-mono space-y-1 pt-3 border-t border-glass-border">
                              <p>First: <span className="text-amber-300">{formatDate(snapshot.firstCapture)}</span></p>
                              <p>Last: <span className="text-amber-300">{formatDate(snapshot.lastCapture)}</span></p>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
