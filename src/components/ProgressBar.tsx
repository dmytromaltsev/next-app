"use client";

import { motion } from "framer-motion";

export function ProgressBar({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-zinc-200/80 dark:bg-zinc-800">
        <motion.div
          className="h-2 rounded-full bg-zinc-900 dark:bg-zinc-100"
          initial={false}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        />
      </div>
    </div>
  );
}

