"use client";

import { motion } from "framer-motion";
import { ArrowRight, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
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

      <div className="pt-[52px]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: HERO_EASE }}
          >
            <div className="mb-10">
              <span className="text-2xs uppercase tracking-[0.2em] text-temporal-text font-medium">
                Exhibits
              </span>
              <h1 className="text-display text-4xl md:text-5xl text-text-primary mt-3 mb-3">
                Explore the web&rsquo;s history
              </h1>
              <p className="text-text-tertiary max-w-xl leading-relaxed">
                Curated exhibits that trace the evolution of websites, platforms,
                and the internet itself — assembled from millions of archived snapshots.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {collections.map((collection, i) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: HERO_EASE, delay: i * 0.05 }}
                >
                  <Link href={`/collections/${collection.id}`} className="block group h-full">
                    <Card className="h-full hover:border-border-focus hover:shadow-md transition-all duration-150">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-lg bg-temporal-primary/10 flex items-center justify-center shrink-0 group-hover:bg-temporal-primary/20 transition-colors">
                            <Layers className="w-5 h-5 text-temporal-primary" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
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
                            <div className="flex items-center gap-1 mt-4 text-xs text-text-muted group-hover:text-temporal-text transition-colors">
                              Explore exhibit
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
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
