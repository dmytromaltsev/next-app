"use client";

import { AnimatePresence, motion } from "framer-motion";
import type React from "react";

export function QuestionShell({
  stepKey,
  title,
  subtitle,
  children,
  footer,
  titleAs = "h1",
  align = "start",
  hideTitleArea = false,
  /** Less space between title block and main content (e.g. summary hero + image). */
  tightTitleToContent = false,
}: {
  stepKey: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  titleAs?: "h1" | "h2";
  align?: "start" | "center";
  /** When true, only children + optional footer render (e.g. full-bleed loader layout). */
  hideTitleArea?: boolean;
  tightTitleToContent?: boolean;
}) {
  const TitleTag = titleAs;
  const isCenter = align === "center";
  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex min-h-0 w-full flex-col"
        >
          {hideTitleArea ? null : (
            <div
              className={[
                "flex flex-col",
                tightTitleToContent ? "relative z-10 gap-0" : "gap-2",
                isCenter ? "items-center text-center" : "",
              ].join(" ")}
            >
              <TitleTag
                className={[
                  "text-pretty text-2xl font-bold leading-tight tracking-tight text-funnel-ink sm:text-[1.65rem]",
                  isCenter ? "max-w-xl" : "",
                ].join(" ")}
              >
                {title}
              </TitleTag>
              {subtitle ? (
                <div
                  className={[
                    "max-w-xl text-pretty text-lg leading-[1.6] tracking-normal text-slate-600 antialiased sm:text-xl sm:leading-[1.62]",
                    isCenter ? "text-center" : "",
                  ].join(" ")}
                >
                  {subtitle}
                </div>
              ) : null}
            </div>
          )}

          <div
            className={[
              hideTitleArea
                ? "mt-0"
                : tightTitleToContent
                  ? "relative z-0 -mt-[30px]"
                  : "mt-6 sm:mt-7",
              "flex-1",
              isCenter ? "flex flex-col items-center" : "",
            ].join(" ")}
          >
            {children}
          </div>

          {footer ? <div className="mt-8 sm:mt-9">{footer}</div> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
