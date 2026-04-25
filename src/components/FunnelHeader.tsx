"use client";

export function FunnelHeader({
  title,
  onBack,
  showBack = true,
}: {
  title: string;
  onBack: () => void;
  /** When false, back control is hidden (e.g. first step). */
  showBack?: boolean;
}) {
  return (
    <header className="relative flex shrink-0 items-center justify-between border-b border-funnel-border bg-funnel-surface px-3 py-3 sm:px-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-funnel-ink transition hover:bg-funnel-selected"
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
        ) : null}
      </div>
      <h1 className="pointer-events-none absolute left-1/2 max-w-[70%] -translate-x-1/2 truncate text-center text-base font-bold text-funnel-ink">
        {title}
      </h1>
      <div className="h-10 w-10 shrink-0" aria-hidden />
    </header>
  );
}
