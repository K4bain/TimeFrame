"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/layout/site-header";
import { ErrorDisplay } from "@/components/error-states/error-display";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSearch } from "@/features/search/use-search";
import { formatDate, getEra } from "@/utils";
import Link from "next/link";

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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const { result, isLoading, error, search } = useSearch();
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery);
    }
  }, [initialQuery, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search(query.trim());
    }
  };

  return (
    <>
      <SiteHeader backHref="/" backLabel="Back to home" expandChildren>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="group flex items-center gap-2 border-b border-rule focus-within:border-gold transition-colors duration-300 pb-1.5">
            <Search className="w-4 h-4 text-paper-dim shrink-0 group-focus-within:text-gold transition-colors" aria-hidden="true" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="enter a website url or name"
              aria-label="Search for a website"
              size="sm"
            />
            <Button type="submit" size="sm" disabled={isLoading} className="shrink-0">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Explore"}
            </Button>
          </div>
        </form>
      </SiteHeader>

      <div className="pt-[56px]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 relative z-10"
            >
              <Loader2 className="w-6 h-6 text-paper-dim animate-spin mb-4" />
              <p className="text-colophon">Searching the archive</p>
            </motion.div>
          )}

          {!isOnline && (
            <ErrorDisplay error={{ code: "NETWORK_OFFLINE" }} fullScreen={false} />
          )}

          {isOnline && error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ErrorDisplay
                error={error}
                onAction={() => {
                  if (query.trim()) search(query.trim());
                }}
              />
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: HERO_EASE }}
            >
              <div className="mb-12 pb-6 border-b border-rule">
                <span className="text-eyebrow">Results</span>
                <h1 className="text-display text-4xl md:text-6xl text-paper mt-3 mb-4">
                  {result.site}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-paper-faint font-mono">
                  <span>{result.totalCaptures.toLocaleString()} snapshots</span>
                  <span className="text-rule-bright">·</span>
                  <span className="text-gold">
                    {formatDate(result.firstCapture)} — {formatDate(result.lastCapture)}
                  </span>
                </div>
              </div>

              <div className="border-t border-rule">
                {result.captures.slice(0, 20).map((capture) => {
                  const era = getEra(capture.timestamp);
                  const eraName = era ? ERA_NAMES[era] : null;
                  return (
                    <Link
                      key={capture.timestamp}
                      href={`/explore/${result.site}/${capture.timestamp}`}
                      className="block group border-b border-rule hover:bg-ink-panel/50 rounded-lg mb-1 hover:shadow-sm hover:border-gold/20 transition-all duration-200"
                    >
                      <div className="py-4 px-3 flex items-center justify-between gap-6">
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-3 mb-1">
                            <span className="font-mono text-gold text-sm">
                              {formatDate(capture.timestamp)}
                            </span>
                            {eraName && (
                              <Badge variant="temporal" className="shrink-0">
                                {eraName}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-paper-dim font-mono truncate">{capture.url}</p>
                        </div>
                        <span className="text-2xs font-mono text-paper-dim shrink-0 hidden sm:block">
                          {capture.mimetype}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {result.captures.length > 20 && (
                <div className="mt-10">
                  <Link href={`/explore/${result.site}/${result.captures[0]?.timestamp || ""}`}>
                    <Button variant="outline">
                      View all {result.totalCaptures.toLocaleString()} snapshots
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {!isLoading && !error && !result && initialQuery && (
            <div className="flex flex-col items-center justify-center py-24 relative z-10">
              <p className="text-paper-faint">No results found for &ldquo;{initialQuery}&rdquo;</p>
            </div>
          )}

          {!isLoading && !error && !result && !initialQuery && (
            <div className="relative z-10 flex flex-col items-center justify-center py-24 text-center">
              <span className="text-eyebrow mb-4">Begin</span>
              <h2 className="text-display text-3xl text-paper mb-3">Search a website</h2>
              <p className="text-paper-faint max-w-md">
                Enter a domain or URL to explore its archive history.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-8">
                {["nytimes.com", "apple.com", "wikipedia.org"].map((site) => (
                  <button
                    key={site}
                    onClick={() => router.push(`/search?q=${encodeURIComponent(site)}`)}
                    className="text-xs font-mono text-paper-faint hover:text-gold transition-colors"
                  >
                    {site}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading search page">
            <Loader2 className="w-6 h-6 text-paper-dim animate-spin" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
}
