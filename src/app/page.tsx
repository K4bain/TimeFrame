"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { HistoryScrubber } from "@/components/home/history-scrubber";
import { collections } from "@/features/collections/data";
import Link from "next/link";

const EXAMPLE_SITES = ["nytimes.com", "github.com", "apple.com", "wikipedia.org"];
const FEATURED_COLLECTION_IDS = [
  "google-through-time",
  "rise-of-social-media",
  "early-internet",
];

// Hero stagger — MOT.3.2 (slide-up). Durations kept under the MOT.5 ceiling.
const HERO_EASE = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const featured = FEATURED_COLLECTION_IDS
    .map((id) => collections.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero — editorial masthead */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 md:px-16 pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="max-w-3xl w-full text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: HERO_EASE }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="h-px w-8 bg-temporal-primary/60" />
            <span className="text-2xs uppercase tracking-[0.2em] text-temporal-text font-medium">
              Est. 1991
            </span>
            <span className="h-px w-8 bg-temporal-primary/60" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: HERO_EASE }}
            className="text-display text-6xl md:text-8xl text-text-primary mb-5"
          >
            Timeframe
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: HERO_EASE, delay: 0.1 }}
            className="text-display-italic text-xl md:text-2xl text-text-secondary mb-3"
          >
            The web, archived in time.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: HERO_EASE, delay: 0.15 }}
            className="text-sm md:text-base text-text-tertiary max-w-xl mx-auto mb-10"
          >
            Explore how any website has evolved across decades. Browse snapshots,
            compare eras, and travel through internet history.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: HERO_EASE, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="relative max-w-xl mx-auto"
          >
            <div className="flex items-center gap-2 px-5 py-3.5 bg-paper-surface border border-border-default rounded-lg focus-within:border-border-focus focus-within:shadow-md transition-all duration-150">
              <Search className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a website — nytimes.com, github.com…"
                aria-label="Search for a website"
                className="text-base"
              />
              <Button type="submit" size="sm" className="shrink-0">
                Explore
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Example chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-text-muted">Try:</span>
              {EXAMPLE_SITES.map((site) => (
                <button
                  key={site}
                  type="button"
                  onClick={() => router.push(`/search?q=${encodeURIComponent(site)}`)}
                  className="text-xs font-mono px-2.5 py-1 rounded-full border border-border-subtle bg-bg-surface text-text-tertiary hover:text-temporal-text hover:border-temporal-border transition-colors"
                >
                  {site}
                </button>
              ))}
            </div>
          </motion.form>
        </div>
      </section>

      {/* Animated web-history scrubber */}
      <section className="px-4 md:px-16 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: HERO_EASE, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-2xs uppercase tracking-[0.2em] text-text-muted font-medium">
              Three decades of the web
            </h2>
            <span className="text-2xs font-mono text-text-muted">
              click a moment to explore
            </span>
          </div>
          <HistoryScrubber />
        </motion.div>
      </section>

      {/* Featured collections */}
      <section className="px-4 md:px-16 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-display text-2xl md:text-3xl text-text-primary">
              Featured exhibits
            </h2>
            <Link
              href="/collections"
              className="text-sm text-text-tertiary hover:text-temporal-text transition-colors"
            >
              All collections →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {featured.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: HERO_EASE, delay: 0.5 + i * 0.06 }}
              >
                <Link href={`/collections/${collection.id}`} className="block group">
                  <Card className="h-full hover:border-border-focus hover:shadow-md transition-all duration-150">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-temporal-primary" />
                        <span className="text-2xs uppercase tracking-wider text-text-muted font-medium">
                          {collection.websites.length} site{collection.websites.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <h3 className="text-display text-lg text-text-primary mb-2 group-hover:text-temporal-text transition-colors">
                        {collection.title}
                      </h3>
                      <p className="text-sm text-text-tertiary leading-relaxed line-clamp-2">
                        {collection.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-4 md:px-16 py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-text-muted">
          <span className="font-mono">Snapshots via the Internet Archive</span>
          <span className="text-display-italic text-sm text-text-tertiary">
            Time is the longest distance between two places.
          </span>
        </div>
      </footer>
    </main>
  );
}
