"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 md:px-16">
      <div className="max-w-2xl w-full text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          style={{ letterSpacing: "-0.02em" }}
        >
          Timeframe
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="text-md text-text-tertiary mb-10"
        >
          Explore how websites evolve through time.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          onSubmit={handleSubmit}
          className="relative"
        >
          <div className="flex items-center gap-2 px-5 py-3.5 bg-bg-surface border border-border-default rounded-md focus-within:border-border-focus transition-colors duration-150">
            <Search className="w-5 h-5 text-text-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a website URL or name..."
              className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-muted text-base"
              aria-label="Search for a website"
            />
            <Button type="submit" size="sm" className="shrink-0">
              Explore
            </Button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex items-center justify-center gap-6 text-sm"
        >
          <Link href="/collections" className="text-text-tertiary hover:text-text-primary transition-colors">
            Collections
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
