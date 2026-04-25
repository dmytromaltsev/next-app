"use client";

import Image from "next/image";

export function WorldMapIllustration() {
  return (
    <div
      className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-funnel-border bg-funnel-surface shadow-sm sm:max-w-2xl"
      role="img"
      aria-label="World map with learner locations across the globe"
    >
      <Image
        src="/world-map-summary.png"
        alt="World map with pins showing learners worldwide"
        width={1024}
        height={551}
        className="h-auto w-full"
        priority
      />
    </div>
  );
}

export function LadderIllustration() {
  return (
    <div className="mx-auto flex w-full max-w-xs justify-center py-2" role="img" aria-label="Ladder toward a goal">
      <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="44" y="8" width="32" height="12" rx="4" fill="#fde68a" stroke="#ca8a04" strokeWidth="1.5" />
        <path d="M52 20v132M68 20v132" stroke="#3454a1" strokeWidth="4" strokeLinecap="round" />
        {[36, 56, 76, 96, 116].map((y) => (
          <line key={y} x1="48" y1={y} x2="72" y2={y} stroke="#93b4c8" strokeWidth="3" strokeLinecap="round" />
        ))}
        <circle cx="60" cy="14" r="4" fill="#fef9c3" />
      </svg>
    </div>
  );
}
