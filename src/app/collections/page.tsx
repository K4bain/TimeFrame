"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { collections } from "@/features/collections/data";
import Link from "next/link";

const HERO_EASE = [0.16, 1, 0.3, 1] as const;

export default function CollectionsPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader
        backHref="/"
        backLabel="Back to home"
        title="Collections"
        subtitle="Curated exhibits"
      />

      <div className="pt-[56px]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: HERO_EASE }}
          >
            <div className="mb-12 pb-6 border-b border-rule">
              <span className="text-eyebrow">Exhibits</span>
              <h1 className="text-display text-4xl md:text-6xl text-paper mt-3 mb-4">
                Explore the web&rsquo;s history
              </h1>
              <p className="text-paper-faint max-w-xl leading-relaxed">
                Curated exhibits that trace the evolution of websites, platforms,
                and the internet itself — assembled from millions of archived snapshots.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-px bg-rule">
              {collections.map((collection, i) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: HERO_EASE, delay: i * 0.05 }}
                >
                  <Link href={`/collections/${collection.id}`} className="group block h-full bg-ink-void p-8 md:p-10 hover:bg-ink-panel transition-colors duration-300">
                    <div className="text-colophon mb-6">
                      {String(i + 1).padStart(2, "0")} — {collection.websites.length} sites
                    </div>
                    <h3 className="font-display text-2xl text-paper mb-3 leading-tight group-hover:text-gold transition-colors">
                      {collection.title}
                    </h3>
                    <p className="text-sm text-paper-faint leading-relaxed line-clamp-3 mb-6">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-mono text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                      View exhibit
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
