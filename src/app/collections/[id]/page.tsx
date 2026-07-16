"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCollection } from "@/features/collections/data";
import { formatDate } from "@/utils";
import Link from "next/link";
import type { Collection } from "@/types";

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

  useEffect(() => {
    const coll = getCollection(id);
    if (!coll) {
      setIsLoading(false);
      return;
    }

    setCollection(coll);

    let cancelled = false;

    async function loadSites() {
      const results: SiteSnapshot[] = [];
      for (const site of coll!.websites) {
        try {
          const res = await fetch(
            `https://timeframe-backend.vercel.app/api/trpc/archive.getTimeline?batch=1&input=${encodeURIComponent(
              JSON.stringify({ 0: { json: { domain: site } } })
            )}`
          );
          const json = await res.json();
          const data = json[0]?.result?.data?.json;
          if (data?.success && data.data.totalCount > 0) {
            results.push({
              site,
              firstCapture: data.data.firstSnapshot,
              lastCapture: data.data.lastSnapshot,
              totalCaptures: data.data.totalCount,
            });
          }
        } catch {
          // Skip failed sites
        }
      }
      if (!cancelled) {
        setSnapshots(results);
        setIsLoading(false);
      }
    }

    loadSites();

    return () => { cancelled = true; };
  }, [id]);

  return (
    <main className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-4 md:px-16 py-4 flex items-center gap-4">
          <Link href="/collections">
            <Button variant="ghost" size="icon" aria-label="Back to collections">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold truncate">{collection?.title || "Collection"}</h1>
        </div>
      </div>

      <div className="pt-24 pb-8 px-4 md:px-16">
        <div className="max-w-5xl mx-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-text-muted animate-spin mb-4" />
              <p className="text-text-muted">Loading collection...</p>
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
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold mb-2">{collection.title}</h2>
                <p className="text-text-tertiary max-w-2xl">{collection.description}</p>
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
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link
                      href={`/explore/${snapshot.site}/${snapshot.lastCapture}`}
                      className="block p-6 bg-bg-surface border border-border-default rounded-md hover:border-border-focus transition-colors duration-150 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-medium group-hover:text-temporal-text transition-colors">
                            {snapshot.site}
                          </h3>
                          <p className="text-sm text-text-muted">
                            {snapshot.totalCaptures.toLocaleString()} snapshots
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-temporal-text transition-colors" />
                      </div>

                      <div className="text-xs text-text-muted font-mono">
                        <p>First: {formatDate(snapshot.firstCapture)}</p>
                        <p>Last: {formatDate(snapshot.lastCapture)}</p>
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
