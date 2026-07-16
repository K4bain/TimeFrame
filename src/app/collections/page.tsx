"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collections } from "@/features/collections/data";
import Link from "next/link";

export default function CollectionsPage() {
  return (
    <main className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 bg-bg-base/80 backdrop-blur-sm border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-4 md:px-16 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Back to home">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Collections</h1>
        </div>
      </div>

      <div className="pt-24 pb-8 px-4 md:px-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">Explore the Web&apos;s History</h2>
              <p className="text-text-tertiary">
                Curated exhibits that trace the evolution of websites, platforms, and the internet itself.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {collections.map((collection, i) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link
                    href={`/collections/${collection.id}`}
                    className="block p-6 bg-bg-surface border border-border-default rounded-md hover:border-border-focus transition-colors duration-150 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-md bg-temporal-primary/10 flex items-center justify-center shrink-0 group-hover:bg-temporal-primary/20 transition-colors">
                        <Layers className="w-5 h-5 text-temporal-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium mb-1 group-hover:text-temporal-text transition-colors">
                          {collection.title}
                        </h3>
                        <p className="text-sm text-text-muted line-clamp-2">
                          {collection.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                          <span>{collection.websites.length} site{collection.websites.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
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
