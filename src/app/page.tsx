"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight, Clock, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuroraBackground } from "@/components/aurora-background";
import { HistoryScrubber } from "@/components/home/history-scrubber";
import { collections } from "@/features/collections/data";
import Link from "next/link";

const EXAMPLE_SITES = ["nytimes.com", "github.com", "apple.com", "wikipedia.org"];
const FEATURED_COLLECTION_IDS = [
  "google-through-time",
  "rise-of-social-media",
  "early-internet",
];

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
    <main className="relative min-h-screen">
      <AuroraBackground />

      <div className="relative z-10">
        {/* ─── Hero ─────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-16 py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: HERO_EASE }}
            className="mb-8 flex items-center gap-2 tf-glass rounded-full px-4 py-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span className="text-xs text-text-tertiary tracking-wide">
              Powered by the Internet Archive · 28 billion snapshots
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: HERO_EASE }}
            className="text-display text-center text-7xl sm:text-8xl md:text-[9rem] lg:text-[11rem] mb-6"
          >
            <span className="tf-text-gradient">Time</span>
            <span className="tf-text-gradient-cool">frame</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: HERO_EASE, delay: 0.15 }}
            className="text-center text-xl md:text-2xl text-text-secondary mb-3 max-w-2xl"
          >
            Travel through the history of any website.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: HERO_EASE, delay: 0.3 }}
            className="text-center text-sm md:text-base text-text-muted max-w-xl mb-12"
          >
            Search any domain to browse decades of archived snapshots,
            compare eras side by side, and watch the web evolve.
          </motion.p>

          {/* Glass search */}
          <motion.form
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: HERO_EASE, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="w-full max-w-2xl"
          >
            <div className="tf-glass-strong rounded-2xl p-2 flex items-center gap-2 focus-within:shadow-glow-amber transition-shadow duration-300">
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter a website — nytimes.com, github.com…"
                  aria-label="Search for a website"
                  className="text-base bg-transparent border-0"
                />
              </div>
              <Button type="submit" size="lg" className="shrink-0">
                Explore
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-text-muted">Try:</span>
              {EXAMPLE_SITES.map((site) => (
                <button
                  key={site}
                  type="button"
                  onClick={() => router.push(`/search?q=${encodeURIComponent(site)}`)}
                  className="text-xs font-mono px-3 py-1.5 rounded-full tf-glass text-text-tertiary hover:text-amber-300 hover:border-glass-border-hover transition-all duration-200"
                >
                  {site}
                </button>
              ))}
            </div>
          </motion.form>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-2xs uppercase tracking-[0.2em] text-text-muted">
              Three decades below
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8 bg-gradient-to-b from-amber-400/50 to-transparent"
            />
          </motion.div>
        </section>

        {/* ─── Living timeline ──────────────────────────── */}
        <section className="px-4 md:px-16 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: HERO_EASE }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="text-xs uppercase tracking-[0.2em] text-amber-400 font-medium">
                  The web, year by year
                </span>
              </div>
              <h2 className="text-display text-4xl md:text-5xl text-text-primary mb-4">
                From 1991 to today.
              </h2>
              <p className="text-text-tertiary max-w-lg mx-auto">
                Click any moment to jump into the archive. Every dot is a piece
                of internet history you can explore.
              </p>
            </div>

            <div className="tf-glass-strong rounded-2xl p-6 md:p-8">
              <HistoryScrubber />
            </div>
          </motion.div>
        </section>

        {/* ─── Featured exhibits ────────────────────────── */}
        <section className="px-4 md:px-16 py-24 md:py-32">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: HERO_EASE }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
                    Curated exhibits
                  </span>
                </div>
                <h2 className="text-display text-4xl md:text-5xl text-text-primary">
                  Featured collections
                </h2>
              </div>
              <Link
                href="/collections"
                className="hidden md:inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-amber-300 transition-colors"
              >
                All collections
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              {featured.map((collection, i) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: HERO_EASE, delay: i * 0.1 }}
                >
                  <Link href={`/collections/${collection.id}`} className="group block h-full">
                    <div className="tf-glass rounded-2xl p-8 h-full hover:border-glass-border-hover hover:shadow-glow-amber hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-6">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-glow" style={{ animation: "var(--animate-pulse-glow)" }} />
                        <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
                          {collection.websites.length} site{collection.websites.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <h3 className="text-display text-2xl text-text-primary mb-3 group-hover:tf-text-gradient transition-all">
                        {collection.title}
                      </h3>
                      <p className="text-sm text-text-tertiary leading-relaxed line-clamp-2 mb-6">
                        {collection.description}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore exhibit
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Footer ───────────────────────────────────── */}
        <footer className="border-t border-glass-border px-4 md:px-16 py-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-display text-lg tf-text-gradient">Timeframe</span>
              <span className="text-xs text-text-muted font-mono">
                · snapshots via the Internet Archive
              </span>
            </div>
            <p className="text-sm text-text-muted italic">
              &ldquo;The web never forgets — if you know where to look.&rdquo;
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
