"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass } from "lucide-react";

const YEAR_MESSAGES = [
  { year: 1996, msg: "This page doesn't exist in any timeline." },
  { year: 2003, msg: "Even the Wayback Machine can't find this one." },
  { year: 2010, msg: "This URL may have never been registered." },
  { year: 2024, msg: "Lost in the archives. Try navigating home." },
];

export default function NotFound() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % YEAR_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center tf-aurora overflow-hidden">
      <div className="absolute opacity-20 pointer-events-none" style={{ width: 300, height: 300 }}>
        <motion.div
          className="absolute inset-0 rounded-full border border-gold/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gold/50 rounded-full" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <span className="text-eyebrow mb-8 block">404 — Temporal Anomaly</span>

        <h1 className="text-display text-6xl md:text-8xl mb-4">
          <span className="tf-text-gradient">Lost in time</span>
        </h1>

        <div className="w-20 h-px bg-gold/30 mx-auto my-8" />

        <div className="h-12 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={msgIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-paper-faint text-sm font-mono mb-1">{YEAR_MESSAGES[msgIndex].year}</p>
              <p className="max-w-sm text-paper-soft leading-relaxed">
                {YEAR_MESSAGES[msgIndex].msg}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/search">
              <Compass className="w-4 h-4" />
              Explore Archive
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
