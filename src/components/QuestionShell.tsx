"use client";

import { AnimatePresence, motion } from "framer-motion";
import type React from "react";

export function QuestionShell({
  stepKey,
  eyebrow,
  badge,
  title,
  subtitle,
  children,
  footer,
  titleAs = "h1",
}: {
  stepKey: string;
  eyebrow?: string;
  badge?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  titleAs?: "h1" | "h2";
}) {
  const TitleTag = titleAs;
  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex min-h-[min(70dvh,26rem)] w-full flex-col sm:min-h-[24rem]"
        >
          <div className="flex flex-col gap-3">
            {(eyebrow || badge) && (
              <div className="flex flex-wrap items-center gap-2">
                {eyebrow ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-funnel-muted">{eyebrow}</p>
                ) : null}
                {badge ? (
                  <span className="inline-flex rounded-full bg-funnel-pill px-2.5 py-0.5 text-[11px] font-semibold text-funnel-pill-text">
                    {badge}
                  </span>
                ) : null}
              </div>
            )}
            <TitleTag className="text-pretty text-[1.35rem] font-bold leading-snug tracking-tight text-funnel-ink sm:text-3xl sm:leading-tight">
              {title}
            </TitleTag>
            {subtitle ? (
              <p className="text-pretty text-sm leading-relaxed text-funnel-muted sm:text-base">{subtitle}</p>
            ) : null}
          </div>

          <div className="mt-6 flex-1 sm:mt-7">{children}</div>

          {footer ? <div className="mt-8 sm:mt-9">{footer}</div> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
