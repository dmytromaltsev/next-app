"use client";

export function SegmentedProgressBar({ value, max }: { value: number; max: number }) {
  const safeMax = Math.max(1, max);
  const filled = Math.max(0, Math.min(safeMax, value));
  return (
    <div className="flex w-full items-center gap-2">
      <span className="h-1 w-1 shrink-0 rounded-full bg-funnel-ink" aria-hidden />
      <div className="flex min-w-0 flex-1 gap-1 sm:gap-1.5">
        {Array.from({ length: safeMax }, (_, i) => (
          <div
            key={i}
            className={[
              "h-1 flex-1 rounded-sm sm:h-1.5",
              i < filled ? "bg-funnel-bar" : "bg-funnel-track",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
