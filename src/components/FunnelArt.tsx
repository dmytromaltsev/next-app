"use client";

export function WorldMapIllustration() {
  return (
    <div
      className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-funnel-border bg-funnel-selected/40 p-3"
      role="img"
      aria-label="World map"
    >
      <svg viewBox="0 0 320 160" className="h-auto w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="160" rx="12" className="fill-funnel-selected" />
        <path
          d="M48 72c12-20 40-32 64-24 10 4 18 14 20 26 14-10 34-8 48 4 8 6 14 16 16 26 18-8 38-4 52 8 10 8 16 20 14 32 20-6 40 2 52 18"
          className="fill-funnel-primary/25"
        />
        <path
          d="M40 100c8-18 28-28 48-24 12 2 22 12 28 24 6-8 18-14 30-12 14 2 24 14 26 28 10-6 24-4 34 4M200 44c-6 10-4 24 6 32 10 8 24 8 34 0"
          className="stroke-funnel-primary/20"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
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
