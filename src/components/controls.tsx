"use client";

import type React from "react";

const btnPrimary =
  "inline-flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-lg bg-funnel-primary px-5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition active:scale-[0.99] hover:bg-funnel-primary-hover disabled:cursor-not-allowed disabled:opacity-45";

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={[btnPrimary, className].filter(Boolean).join(" ")}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-lg border border-funnel-border bg-funnel-surface px-5 text-sm font-semibold text-funnel-ink transition hover:bg-funnel-selected disabled:opacity-40 sm:w-auto",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  autoFocus,
  type = "text",
  invalid,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  type?: React.HTMLInputTypeAttribute;
  /** When true, show error border (e.g. after failed validation). */
  invalid?: boolean;
  className?: string;
}) {
  const borderRing = invalid
    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/25"
    : "border-funnel-border focus:border-funnel-primary focus:ring-2 focus:ring-funnel-primary/20";
  return (
    <input
      value={value}
      type={type}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      aria-invalid={invalid || undefined}
      className={[
        "h-14 w-full min-h-14 rounded-2xl border bg-funnel-surface px-4 text-base text-funnel-ink outline-none placeholder:text-funnel-muted",
        borderRing,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <span
      className={[
        "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        selected ? "border-funnel-primary" : "border-funnel-border bg-white",
      ].join(" ")}
      aria-hidden
    >
      {selected ? <span className="h-2.5 w-2.5 rounded-full bg-funnel-primary" /> : null}
    </span>
  );
}

export function RadioList({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string; hint?: string }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "flex min-h-[56px] w-full touch-manipulation items-center justify-between gap-4 rounded-xl border bg-funnel-surface px-4 py-3.5 text-left transition active:scale-[0.99]",
              selected ? "border-funnel-primary bg-funnel-selected" : "border-funnel-border hover:border-funnel-muted/50",
            ].join(" ")}
          >
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold text-funnel-ink">{opt.label}</div>
              {opt.hint ? <div className="mt-0.5 text-sm font-normal text-funnel-muted">{opt.hint}</div> : null}
            </div>
            <RadioCircle selected={selected} />
          </button>
        );
      })}
    </div>
  );
}

export function ChoiceGrid({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string; hint?: string }>;
}) {
  return <RadioList value={value} onChange={onChange} options={options} />;
}

function CheckboxBox({ selected }: { selected: boolean }) {
  return (
    <span
      className={[
        "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded border-2 text-[11px] font-bold leading-none text-white",
        selected ? "border-funnel-primary bg-funnel-primary" : "border-funnel-border bg-white",
      ].join(" ")}
      aria-hidden
    >
      {selected ? "✓" : ""}
    </span>
  );
}

export function MultiChoiceGrid<T extends string>({
  values,
  onChange,
  options,
  columns = 1,
}: {
  values: T[];
  onChange: (v: T[]) => void;
  options: Array<{ value: T; label: string }>;
  /** `2` = two-column grid (e.g. goals step). */
  columns?: 1 | 2;
}) {
  function toggle(val: T) {
    if (values.includes(val)) onChange(values.filter((x) => x !== val));
    else onChange([...values, val]);
  }

  const layoutClass =
    columns === 2 ? "grid grid-cols-2 gap-2.5 sm:gap-3" : "flex flex-col gap-3";

  return (
    <div className={layoutClass}>
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={[
              "flex min-h-[56px] w-full min-w-0 touch-manipulation items-center justify-between gap-2 rounded-xl border bg-funnel-surface px-3 py-3 text-left transition active:scale-[0.99] sm:min-h-[60px] sm:gap-3 sm:px-4 sm:py-3.5",
              selected ? "border-funnel-primary bg-funnel-selected" : "border-funnel-border hover:border-funnel-muted/50",
            ].join(" ")}
          >
            <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-funnel-ink sm:text-base">
              {opt.label}
            </span>
            <CheckboxBox selected={selected} />
          </button>
        );
      })}
    </div>
  );
}

export function LanguageChoiceGrid<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | null;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; flag: string }>;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "relative flex min-h-[5.5rem] touch-manipulation flex-col items-center justify-center gap-1 rounded-xl border bg-funnel-surface px-2 py-3 pt-7 text-center transition active:scale-[0.99] sm:min-h-[6rem]",
              selected ? "border-funnel-primary bg-funnel-selected" : "border-funnel-border hover:border-funnel-muted/50",
            ].join(" ")}
          >
            <span className="absolute right-2 top-2" aria-hidden>
              <RadioCircle selected={selected} />
            </span>
            <span className="text-2xl leading-none sm:text-[1.75rem]" aria-hidden>
              {opt.flag}
            </span>
            <span className="line-clamp-2 text-center text-[11px] font-bold leading-tight text-funnel-ink sm:text-xs">
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
