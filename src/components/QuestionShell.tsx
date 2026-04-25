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
}: {
  stepKey: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  titleAs?: "h1" | "h2";
  align?: "start" | "center";
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
          <div className={["flex flex-col gap-2", isCenter ? "items-center text-center" : ""].join(" ")}>
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
                  "max-w-xl text-pretty text-sm leading-relaxed text-funnel-muted sm:text-[15px] sm:leading-relaxed",
                  isCenter ? "text-center" : "",
                ].join(" ")}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          <div className={["mt-6 flex-1 sm:mt-7", isCenter ? "flex flex-col items-center" : ""].join(" ")}>{children}</div>

          {footer ? <div className="mt-8 sm:mt-9">{footer}</div> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
