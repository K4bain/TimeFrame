"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
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
      <SiteHeader
        backHref="/collections"
        backLabel="Back to collections"
        title={collection?.title || "Collection"}
      />

      <div className="pt-[56px]">
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
                <p className="text-paper-faint max-w-2xl leading-relaxed">
                  {collection.description}
                </p>
              </div>

              {snapshots.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24">
                  <p className="text-paper-faint">No sites with archive data found</p>
                </div>
              )}

              <div className="border-t border-rule">
                {snapshots.map((snapshot, i) => (
                  <motion.div
                    key={snapshot.site}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, ease: HERO_EASE, delay: i * 0.05 }}
                  >
                    <Link href={`/explore/${snapshot.site}/${snapshot.firstCapture}`} className="group block border-b border-rule hover:bg-ink-panel transition-colors duration-200">
                      <div className="py-6 px-1 flex items-start justify-between gap-6">
                        <div className="min-w-0">
                          <div className="text-colophon mb-2">
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <h3 className="font-display text-xl text-paper mb-1 group-hover:text-gold transition-colors">
                            {snapshot.site}
                          </h3>
                          <p className="text-xs text-paper-dim font-mono">
                            {snapshot.totalCaptures.toLocaleString()} snapshots
                          </p>
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
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
