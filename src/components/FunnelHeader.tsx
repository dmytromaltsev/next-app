"use client";

export function FunnelHeader({
  title,
  onBack,
  backDisabled,
}: {
  title: string;
  onBack: () => void;
  backDisabled?: boolean;
}) {
  return (
    <header className="relative flex shrink-0 items-center justify-between border-b border-funnel-border bg-funnel-surface px-3 py-3 sm:px-4">
      <button
        type="button"
        onClick={onBack}
        disabled={backDisabled}
        aria-label="Go back"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-funnel-ink transition hover:bg-funnel-selected disabled:pointer-events-none disabled:opacity-30"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1 className="pointer-events-none absolute left-1/2 max-w-[55%] -translate-x-1/2 truncate text-center text-base font-bold text-funnel-ink">
        {title}
      </h1>
      <button
        type="button"
        aria-label="Menu"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-funnel-ink transition hover:bg-funnel-selected"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  );
}
