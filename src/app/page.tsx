"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      {/* ─── Masthead ────────────────────────────────────── */}
      <header className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <span className="text-colophon">Timeframe</span>
          <span className="text-colophon hidden md:inline">A Field Guide to the Archived Web</span>
          <span className="text-colophon">No. 0001</span>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="px-6 md:px-10 pt-20 md:pt-32 pb-20 md:pb-28">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-eyebrow mb-8"
          >
            Est. 1991 — Volume I
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: HERO_EASE }}
            className="text-display text-[clamp(3.5rem,11vw,8.5rem)] text-paper max-w-5xl"
          >
            Everything the web
            <br />
            <span className="italic">ever was.</span>
          </motion.h1>

          <div className="mt-12 md:mt-16 grid md:grid-cols-12 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-5"
            >
              <p className="text-lg md:text-xl text-paper-soft leading-relaxed">
                Search any domain to browse decades of archived snapshots,
                compare eras side by side, and watch the internet evolve —
                one capture at a time.
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: HERO_EASE, delay: 0.4 }}
              onSubmit={handleSubmit}
              className="md:col-span-7 md:col-start-7"
            >
              <div className="group border-b border-rule focus-within:border-gold transition-colors duration-300 pb-3 flex items-center gap-3">
                <Search className="w-5 h-5 text-paper-dim shrink-0 group-focus-within:text-gold transition-colors" aria-hidden="true" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="enter a domain — nytimes.com"
                  aria-label="Search for a website"
                  className="text-base border-0"
                />
                <Button type="submit" size="sm" className="shrink-0">
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-colophon">Try</span>
                {EXAMPLE_SITES.map((site) => (
                  <button
                    key={site}
                    type="button"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(site)}`)}
                    className="text-xs font-mono text-paper-faint hover:text-gold transition-colors"
                  >
                    {site}
                  </button>
                ))}
              </div>
            </motion.form>
          </div>
        </div>
      </section>

      {/* ─── The Index (timeline) ────────────────────────── */}
      <section className="border-t border-rule px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: HERO_EASE }}
          >
            <div className="flex items-baseline gap-4 mb-12">
              <span className="text-eyebrow">§ I</span>
              <h2 className="text-display text-3xl md:text-5xl text-paper">
                The web, year by year.
              </h2>
            </div>

            <div className="border border-rule bg-ink-panel p-6 md:p-10">
              <HistoryScrubber />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Exhibits ────────────────────────────────────── */}
      <section className="border-t border-rule px-6 md:px-10 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: HERO_EASE }}
            className="flex items-baseline justify-between mb-12"
          >
            <div className="flex items-baseline gap-4">
              <span className="text-eyebrow">§ II</span>
              <h2 className="text-display text-3xl md:text-5xl text-paper">
                Exhibits
              </h2>
            </div>
            <Link
              href="/collections"
              className="text-colophon hover:text-gold transition-colors"
            >
              All collections →
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-rule">
            {featured.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: HERO_EASE, delay: i * 0.08 }}
              >
                <Link href={`/collections/${collection.id}`} className="group block h-full bg-ink-void p-8 md:p-10 hover:bg-ink-panel transition-colors duration-300">
                  <div className="text-colophon mb-8">
                    Plate {String(i + 1).padStart(2, "0")} — {collection.websites.length} sites
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl text-paper leading-tight mb-4 group-hover:text-gold transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-paper-faint leading-relaxed mb-8 line-clamp-3">
                    {collection.description}
                  </p>
                  <div className="text-colophon text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    View exhibit →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Colophon / Footer ───────────────────────────── */}
      <footer className="border-t border-rule px-6 md:px-10 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-base text-paper">Timeframe</span>
            <span className="text-colophon">· snapshots via the Internet Archive</span>
          </div>
          <p className="font-serif italic text-sm text-paper-faint">
            &ldquo;The web never forgets — if you know where to look.&rdquo;
          </p>
        </div>
      </footer>
    </main>
  );
}
