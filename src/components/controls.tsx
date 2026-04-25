"use client";

import type React from "react";

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
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition active:scale-[0.99] hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
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
        "inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition active:scale-[0.99] hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-950",
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
      className="h-12 w-full min-h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-950 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-600"
    />
  );
}

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
    <div className={["grid gap-2", columnsClass].join(" ")}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "group flex min-h-[3.25rem] touch-manipulation flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99]",
              selected
                ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-950",
            ].join(" ")}
          >
            <span className="text-sm font-medium">{opt.label}</span>
            {opt.hint ? (
              <span
                className={[
                  "text-xs leading-5",
                  selected
                    ? "text-white/80 dark:text-zinc-700"
                    : "text-zinc-500 dark:text-zinc-400",
                ].join(" ")}
              >
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
    <div className="grid grid-cols-1 gap-2">
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={[
              "flex min-h-[3.25rem] touch-manipulation items-center rounded-2xl border px-4 py-3 text-left text-sm font-medium transition active:scale-[0.99]",
              selected
                ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-950",
            ].join(" ")}
          >
            <span
              className={[
                "mr-3 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px]",
                selected
                  ? "border-white/30 bg-white/10 dark:border-zinc-900/30 dark:bg-zinc-900/10"
                  : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900",
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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "flex min-h-[3.5rem] touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 text-center transition active:scale-[0.99]",
              selected
                ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-950",
            ].join(" ")}
          >
            <span className="text-2xl leading-none" aria-hidden>
              {opt.flag}
            </span>
            <span className="text-xs font-medium leading-tight">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
