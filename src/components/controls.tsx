"use client";

import type React from "react";

const btnPrimary =
  "inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-2xl bg-funnel-primary px-6 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] hover:bg-funnel-primary-hover disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto";

const btnSecondary =
  "inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-2xl border border-funnel-border bg-funnel-surface px-6 text-sm font-semibold text-funnel-ink transition active:scale-[0.99] hover:bg-funnel-canvas disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto";

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
    <button type="button" disabled={disabled} onClick={onClick} className={[btnSecondary, className].filter(Boolean).join(" ")}>
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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <input
      value={value}
      type={type}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="h-12 w-full min-h-12 rounded-2xl border border-funnel-border bg-funnel-surface px-4 text-base text-funnel-ink outline-none ring-0 placeholder:text-funnel-muted/70 focus:border-funnel-bar focus:ring-2 focus:ring-funnel-bar/20"
    />
  );
}

const cardBase =
  "touch-manipulation rounded-2xl border px-4 py-3.5 text-left transition active:scale-[0.99]";
const cardIdle = "border-funnel-border bg-funnel-surface text-funnel-ink shadow-[0_1px_0_rgba(20,34,31,0.04)] hover:border-funnel-muted/40 hover:bg-funnel-canvas/50";
const cardSelected = "border-funnel-primary bg-funnel-selected text-funnel-ink shadow-[0_2px_8px_rgba(21,53,41,0.08)] ring-1 ring-funnel-primary/15";

export function ChoiceGrid({
  value,
  onChange,
  options,
  columnsClass = "grid-cols-1 sm:grid-cols-2",
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string; hint?: string }>;
  columnsClass?: string;
}) {
  return (
    <div className={["grid gap-2.5", columnsClass].join(" ")}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[cardBase, "flex min-h-[3.25rem] flex-col gap-0.5", selected ? cardSelected : cardIdle].join(" ")}
          >
            <span className="text-sm font-semibold">{opt.label}</span>
            {opt.hint ? (
              <span className={["text-xs leading-5", selected ? "text-funnel-muted" : "text-funnel-muted/90"].join(" ")}>
                {opt.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function MultiChoiceGrid<T extends string>({
  values,
  onChange,
  options,
}: {
  values: T[];
  onChange: (v: T[]) => void;
  options: Array<{ value: T; label: string }>;
}) {
  function toggle(val: T) {
    if (values.includes(val)) onChange(values.filter((x) => x !== val));
    else onChange([...values, val]);
  }

  return (
    <div className="grid grid-cols-1 gap-2.5">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={[
              cardBase,
              "flex min-h-[3.25rem] items-center text-sm font-semibold",
              selected ? cardSelected : cardIdle,
            ].join(" ")}
          >
            <span
              className={[
                "mr-3 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold",
                selected
                  ? "border-funnel-primary/40 bg-funnel-primary text-white"
                  : "border-funnel-border bg-funnel-surface text-transparent",
              ].join(" ")}
              aria-hidden
            >
              {selected ? "✓" : ""}
            </span>
            {opt.label}
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
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "flex min-h-[4rem] touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 text-center transition active:scale-[0.99]",
              selected ? cardSelected : cardIdle,
            ].join(" ")}
          >
            <span className="text-2xl leading-none" aria-hidden>
              {opt.flag}
            </span>
            <span className="text-[11px] font-semibold leading-tight text-funnel-ink">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
