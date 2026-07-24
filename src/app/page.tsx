"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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

function TypewriterReveal({ children, className }: { children: string; className?: string }) {
  const lines = children.split("\n");
  return (
    <span>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split("").map((char, ci) => (
            <motion.span
              key={`${li}-${ci}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.08 + (li * line.length + ci) * 0.02,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={className}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}

function OrbitRing({ size, duration, offset }: { size: number; duration: number; offset: number }) {
  return (
    <motion.div
      className="absolute rounded-full border border-gold/10 pointer-events-none"
      style={{ width: size, height: size }}
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay: offset }}
    >
      <div
        className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold/40 rounded-full"
      />
    </motion.div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 8}s`,
    driftX: `${-40 + Math.random() * 80}px`,
    driftY: `${-60 + Math.random() * 40}px`,
  }));

  return (
    <div className="tf-particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            left: p.left,
            top: p.top,
            "--delay": p.delay,
            "--duration": p.duration,
            "--drift-x": p.driftX,
            "--drift-y": p.driftY,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function StatsCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1600;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(eased * value));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-display text-3xl md:text-5xl text-gold tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-colophon mt-2">{label}</p>
    </div>
  );
}


const FUN_FACTS = [
  "The first website is still online at info.cern.ch",
  "The Wayback Machine has saved over 835 billion web pages",
  "Google\u2019s first homepage had a simple exclamation point",
  "Facebook was originally called \u2018TheFacebook\u2019",
  "The first YouTube video was uploaded on April 23, 2005",
  "Amazon started as an online bookstore in Jeff Bezos\u2019s garage",
];

function FunFactTicker() {
  const [factIndex, setFactIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
        setIsVisible(true);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 py-3 px-5 bg-gold/5 border border-gold/20 rounded-lg max-w-2xl">
      <Sparkles className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.p
            key={factIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-paper-soft italic"
          >
            {FUN_FACTS[factIndex]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeExhibit, setActiveExhibit] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const featured = FEATURED_COLLECTION_IDS
    .map((id) => collections.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setActiveExhibit((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [featured.length]);

  const nextExhibit = useCallback(() => {
    setActiveExhibit((prev) => (prev + 1) % featured.length);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  }, [featured.length]);

  const prevExhibit = useCallback(() => {
    setActiveExhibit((prev) => (prev - 1 + featured.length) % featured.length);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  }, [featured.length]);

  const currentExhibit = featured[activeExhibit];

  return (
    <main className="relative min-h-screen tf-aurora">
      <FloatingParticles />
      <header className="relative z-10 border-b border-rule bg-ink-void/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          <span className="text-colophon">Timeframe</span>
          <span className="text-colophon hidden md:inline">A Field Guide to the Archived Web</span>
          <span className="text-colophon">No. 0001</span>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 md:px-10 pt-16 md:pt-28 pb-20 md:pb-32">
        <div className="absolute top-8 right-8 md:top-16 md:right-16 opacity-40 pointer-events-none" aria-hidden="true">
          <div className="relative" style={{ width: 200, height: 200 }}>
            <OrbitRing size={200} duration={40} offset={0} />
            <OrbitRing size={140} duration={28} offset={4} />
            <OrbitRing size={80} duration={18} offset={2} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-eyebrow mb-6"
          >
            Est. 1991 — Volume I
          </motion.p>

          <h1 className="text-display text-[clamp(3rem,11vw,8.5rem)] max-w-5xl leading-[0.95]">
            <TypewriterReveal className="tf-text-gradient">
Everything the web
ever was.
            </TypewriterReveal>
          </h1>

          <div className="mt-10 md:mt-14 grid md:grid-cols-12 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="md:col-span-5"
            >
              <p className="text-lg md:text-xl text-paper-soft leading-relaxed">
                Search any domain to browse decades of archived snapshots,
                compare eras side by side, and watch the internet evolve —
                one capture at a time.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-6">
                <StatsCounter value={835} suffix="B" label="Web pages" />
                <StatsCounter value={34} suffix="" label="Years" />
                <StatsCounter value={99} suffix="%" label="Preserved" />
              </div>
            </motion.div>

            <FunFactTicker />
          </div>

          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: HERO_EASE, delay: 0.6 }}
            onSubmit={handleSubmit}
            className="md:col-span-7 md:col-start-7 mt-8 md:mt-0"
          >
            <div className="group border-2 border-rule focus-within:border-gold rounded-lg focus-within:shadow-[0_0_20px_rgba(200,149,69,0.15)] transition-all duration-500 p-4 bg-ink-panel/50 backdrop-blur-sm flex items-center gap-3">
              <Search className="w-5 h-5 text-paper-dim shrink-0 group-focus-within:text-gold transition-colors" aria-hidden="true" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="enter a domain — nytimes.com"
                aria-label="Search for a website"
                className="text-base border-0"
              />
              <Button type="submit" size="sm" className="shrink-0 shadow-[var(--shadow-glow-amber)]">
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
      </section>

      <section className="relative z-10 border-t border-rule px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: HERO_EASE }}
          >
            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-eyebrow">I</span>
              <h2 className="text-display text-3xl md:text-5xl text-paper">
                The web, year by year.
              </h2>
            </div>

            <div className="border border-rule rounded-lg bg-ink-panel p-6 md:p-10 shadow-md">
              <HistoryScrubber />
            </div>

            <p className="mt-4 text-paper-dim text-sm font-mono max-w-2xl">
              Click any milestone to explore its archive. The bar represents 35 years of internet history — from the first website to the age of AI.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 border-t border-rule px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: HERO_EASE }}
          >
            <div className="flex items-baseline justify-between mb-10">
              <div className="flex items-baseline gap-4">
                <span className="text-eyebrow">II</span>
                <h2 className="text-display text-3xl md:text-5xl text-paper">
                  Featured Exhibit
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevExhibit}
                  className="w-10 h-10 border border-rule rounded-lg flex items-center justify-center hover:border-gold hover:text-gold hover:bg-gold/5 transition-all"
                  aria-label="Previous exhibit"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-2xs font-mono text-paper-dim tabular-nums min-w-[3rem] text-center">
                  {activeExhibit + 1} / {featured.length}
                </span>
                <button
                  onClick={nextExhibit}
                  className="w-10 h-10 border border-rule rounded-lg flex items-center justify-center hover:border-gold hover:text-gold hover:bg-gold/5 transition-all"
                  aria-label="Next exhibit"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {currentExhibit && (
                <motion.div
                  key={currentExhibit.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.5, ease: HERO_EASE }}
                >
                  <Link href={`/collections/${currentExhibit.id}`} className="group block">
                    <div className="border border-rule rounded-xl bg-ink-panel hover:border-gold/40 hover:shadow-[var(--shadow-glow-amber)] transition-all duration-500 overflow-hidden tf-grain">
                      <div className="relative p-8 md:p-14 grid md:grid-cols-12 gap-8 md:gap-14 z-10">
                        <div className="md:col-span-7">
                          <div className="text-eyebrow mb-6">
                            Plate {String(activeExhibit + 1).padStart(2, "0")}
                          </div>
                          <h3 className="text-display text-4xl md:text-6xl text-paper leading-[0.95] mb-6 group-hover:text-gold transition-colors duration-500">
                            {currentExhibit.title}
                          </h3>
                          <p className="text-paper-soft leading-relaxed max-w-lg">
                            {currentExhibit.description}
                          </p>
                        </div>
                        <div className="md:col-span-5">
                          <div className="border border-rule rounded-lg p-6 bg-ink-void/50">
                            <p className="text-colophon mb-4">Sites in this exhibit</p>
                            <div className="space-y-2">
                              {currentExhibit.websites.map((site) => (
                                <div
                                  key={site}
                                  className="flex items-center justify-between py-2 border-b border-rule last:border-b-0 group/site"
                                >
                                  <span className="font-mono text-sm text-paper-soft group-hover/site:text-gold transition-colors">
                                    {site}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-paper-dim opacity-0 group-hover/site:opacity-100 transition-opacity" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 border-t border-rule px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: HERO_EASE }}
            className="flex items-baseline justify-between mb-10"
          >
            <div className="flex items-baseline gap-4">
              <span className="text-eyebrow">III</span>
              <h2 className="text-display text-3xl md:text-5xl text-paper">
                All Exhibits
              </h2>
            </div>
            <Link
              href="/collections"
              className="text-colophon hover:text-gold transition-colors"
            >
              Browse archive →
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-3">
            {featured.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: HERO_EASE, delay: i * 0.08 }}
              >
                <Link href={`/collections/${collection.id}`} className="group block h-full bg-ink-panel p-8 md:p-10 rounded-xl hover:bg-ink-raised hover:shadow-md hover:border-gold/30 border border-transparent transition-all duration-300">
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

      <footer className="relative z-10 border-t border-rule px-6 md:px-10 py-12 bg-ink-panel/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div>
              <span className="font-display text-lg text-paper block mb-2">Timeframe</span>
              <p className="text-xs text-paper-faint leading-relaxed">
                A tool for exploring the internet&apos;s archived past.
                Built with data from the Wayback Machine.
              </p>
            </div>
            <div>
              <p className="text-colophon mb-3">Navigate</p>
              <div className="space-y-2">
                <Link href="/search" className="block text-sm text-paper-faint hover:text-gold transition-colors">Search</Link>
                <Link href="/collections" className="block text-sm text-paper-faint hover:text-gold transition-colors">Collections</Link>
              </div>
            </div>
            <div>
              <p className="text-colophon mb-3">Keyboard shortcuts</p>
              <div className="space-y-2 text-xs text-paper-dim font-mono">
                <div className="flex justify-between"><span>← →</span><span>Navigate snapshots</span></div>
                <div className="flex justify-between"><span>Shift + ← →</span><span>Jump months</span></div>
                <div className="flex justify-between"><span>Home / End</span><span>First / Last</span></div>
              </div>
            </div>
          </div>
          <div className="border-t border-rule pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <span className="text-colophon">No. 0001 · Volume I · Est. 1991</span>
            <p className="font-serif italic text-sm text-paper-faint">
              &ldquo;The web never forgets — if you know where to look.&rdquo;
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
