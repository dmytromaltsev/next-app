"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Piece = {
  id: number;
  driftX: string;
  fallY: string;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
  startX: string;
};

const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#06b6d4", "#eab308"];

function randomPiece(id: number): Piece {
  return {
    id,
    driftX: `${(Math.random() - 0.5) * 120}vw`,
    fallY: `${42 + Math.random() * 48}vh`,
    delay: Math.random() * 0.35,
    duration: 1.85 + Math.random() * 1.35,
    rotate: Math.random() * 540 - 270,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#2563eb",
    size: 5 + Math.floor(Math.random() * 5),
    startX: `${(Math.random() - 0.5) * 40}vw`,
  };
}

/** Full-screen burst for the email step (funnel “question” 10). */
export function EmailStepConfetti({ burstKey }: { burstKey: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    setPieces(Array.from({ length: 72 }, (_, i) => randomPiece(i)));
  }, [burstKey]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[45] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={`${burstKey}-${p.id}`}
          className="absolute rounded-[2px] shadow-sm will-change-transform"
          style={{
            left: "50%",
            top: "18%",
            width: p.size,
            height: p.size * 1.4,
            marginLeft: -p.size / 2,
            marginTop: -(p.size * 1.4) / 2,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 0, x: p.startX, y: "0vh", rotate: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: [p.startX, p.driftX, p.driftX],
            y: ["0vh", p.fallY, p.fallY],
            rotate: [0, p.rotate * 0.6, p.rotate],
            scale: [0.4, 1, 1, 0.85],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            times: [0, 0.08, 0.75, 1],
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
