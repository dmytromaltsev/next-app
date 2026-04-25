"use client";

import { OTHER_LANGUAGES } from "@/lib/onboarding/otherLanguages";

export function OtherLanguageSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="relative w-full">
      <select
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : v);
        }}
        className={[
          "h-12 w-full cursor-pointer appearance-none rounded-xl border border-funnel-border bg-funnel-surface py-3 pl-4 pr-11 text-base outline-none transition",
          value ? "font-medium text-funnel-ink" : "text-funnel-muted",
          "focus:border-funnel-primary focus:ring-2 focus:ring-funnel-primary/15",
        ].join(" ")}
        aria-label="Other languages"
      >
        <option value="" disabled hidden>
          Other languages
        </option>
        {OTHER_LANGUAGES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-funnel-ink"
        aria-hidden
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
