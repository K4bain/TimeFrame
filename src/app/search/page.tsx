"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/features/search/use-search";
import { formatDate } from "@/utils";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const { result, isLoading, error, search } = useSearch();

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
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-4 md:px-16 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Back to home">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-text-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a website URL or name..."
              className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-muted text-base"
              aria-label="Search for a website"
            />
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Explore"
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="pt-24 px-4 md:px-16">
        <div className="max-w-5xl mx-auto">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-8 h-8 text-text-muted animate-spin mb-4" />
              <p className="text-text-muted">Searching archive...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <AlertCircle className="w-12 h-12 text-text-muted mb-4" />
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-text-muted text-center max-w-md">{error}</p>
              <Link href="/">
                <Button variant="outline" className="mt-6">
                  Try another search
                </Button>
              </Link>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold mb-2">{result.site}</h1>
                <div className="flex items-center gap-4 text-sm text-text-tertiary">
                  <span>{result.totalCaptures.toLocaleString()} snapshots</span>
                  <span className="w-1 h-1 bg-border-subtle rounded-full" />
                  <span className="font-mono text-temporal-text">
                    {formatDate(result.firstCapture)} — {formatDate(result.lastCapture)}
                  </span>
                </div>
              </div>

              <div className="grid gap-4">
                {result.captures.slice(0, 20).map((capture) => (
                  <Link
                    key={capture.timestamp}
                    href={`/explore/${result.site}/${capture.timestamp}`}
                    className="block p-4 bg-bg-surface border border-border-default rounded-md hover:border-border-focus transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium font-mono text-temporal-text">{formatDate(capture.timestamp)}</p>
                        <p className="text-sm text-text-muted truncate">{capture.url}</p>
                      </div>
                      <span className="text-xs text-text-muted px-2 py-1 bg-bg-base rounded-sm">
                        {capture.mimetype}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {result.captures.length > 20 && (
                <div className="mt-6 text-center">
                  <Link href={`/explore/${result.site}/${result.captures[0]?.timestamp || ""}`}>
                    <Button variant="outline">
                      View all {result.totalCaptures.toLocaleString()} snapshots on timeline
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
            <div className="flex flex-col items-center justify-center py-20">
              <Search className="w-12 h-12 text-text-muted mb-4" />
              <h2 className="text-xl font-semibold mb-2">Search for a website</h2>
              <p className="text-text-muted text-center max-w-md">
                Enter a domain or URL to explore its archive history.
              </p>
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
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
}
