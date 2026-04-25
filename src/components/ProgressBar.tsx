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
      <div className="h-1.5 w-full rounded-full bg-funnel-track">
        <motion.div
          className="h-1.5 rounded-full bg-funnel-bar"
          initial={false}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
        />
      </div>
    </div>
  );
}
