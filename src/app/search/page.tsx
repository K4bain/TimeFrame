"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/layout/site-header";
import { ErrorDisplay } from "@/components/error-states/error-display";
import { AuroraBackground } from "@/components/aurora-background";
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
      <AuroraBackground />
      <div className="relative z-10">
      <SiteHeader backHref="/" backLabel="Back to home" expandChildren>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="flex items-center gap-2 px-4 py-2 tf-glass rounded-lg focus-within:shadow-glow-amber transition-shadow duration-300">
            <Search className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a website URL or name…"
              aria-label="Search for a website"
              size="sm"
            />
            <Button type="submit" size="sm" disabled={isLoading} className="shrink-0">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Explore"}
            </Button>
          </div>
        </form>
      </SiteHeader>

      <div className="pt-[52px]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-8 h-8 text-text-muted animate-spin mb-4" />
              <p className="text-text-muted">Searching the archive…</p>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: HERO_EASE }}
            >
              <div className="mb-8">
                <span className="text-2xs uppercase tracking-[0.2em] text-temporal-text font-medium">
                  Results
                </span>
                <h1 className="text-display text-4xl md:text-5xl tf-text-gradient mt-3 mb-2">
                  {result.site}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-tertiary">
                  <span>{result.totalCaptures.toLocaleString()} snapshots</span>
                  <span className="w-1 h-1 bg-border-subtle rounded-full" aria-hidden="true" />
                  <span className="font-mono text-temporal-text">
                    {formatDate(result.firstCapture)} — {formatDate(result.lastCapture)}
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                {result.captures.slice(0, 20).map((capture) => {
                  const era = getEra(capture.timestamp);
                  const eraName = era ? ERA_NAMES[era] : null;
                  return (
                    <Link
                      key={capture.timestamp}
                      href={`/explore/${result.site}/${capture.timestamp}`}
                      className="block group"
                    >
                      <Card className="hover:shadow-glow-amber transition-all duration-300">
                        <div className="p-4 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-mono text-temporal-text text-sm font-medium">
                                {formatDate(capture.timestamp)}
                              </p>
                              {eraName && (
                                <Badge variant="temporal" className="shrink-0">
                                  {eraName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-text-muted truncate">{capture.url}</p>
                          </div>
                          <span className="text-2xs font-mono text-text-muted px-2 py-1 bg-bg-base rounded-sm shrink-0">
                            {capture.mimetype}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {result.captures.length > 20 && (
                <div className="mt-8 text-center">
                  <Link href={`/explore/${result.site}/${result.captures[0]?.timestamp || ""}`}>
                    <Button variant="outline">
                      View all {result.totalCaptures.toLocaleString()} snapshots on the timeline
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {!isLoading && !error && !result && initialQuery && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-text-muted">No results found for &ldquo;{initialQuery}&rdquo;</p>
            </div>
          )}

          {!isLoading && !error && !result && !initialQuery && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-10 h-10 text-amber-400/50 mb-4" aria-hidden="true" />
              <h2 className="text-display text-2xl tf-text-gradient mb-2">Search a website</h2>
              <p className="text-text-tertiary max-w-md">
                Enter a domain or URL to explore its archive history.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {["nytimes.com", "apple.com", "wikipedia.org"].map((site) => (
                  <button
                    key={site}
                    onClick={() => router.push(`/search?q=${encodeURIComponent(site)}`)}
                    className="text-xs font-mono px-3 py-1.5 rounded-full tf-glass text-text-tertiary hover:text-amber-300 hover:border-glass-border-hover transition-all duration-200"
                  >
                    {site}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
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
            <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
}
