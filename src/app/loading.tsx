"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const LOADING_MESSAGES = [
  "Unearthing archived pages",
  "Traversing the timeline",
  "Restoring web history",
];

export default function RootLoading() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="w-48 h-0.5 bg-rule rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gold rounded-full"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "40%" }}
        />
      </div>

      <motion.p
        key={msgIndex}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-colophon"
      >
        {LOADING_MESSAGES[msgIndex]}
      </motion.p>
    </div>
  );
}
