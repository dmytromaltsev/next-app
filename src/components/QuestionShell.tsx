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
}: {
  stepKey: string;
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
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex min-h-[min(70dvh,28rem)] w-full flex-col sm:min-h-[26rem]"
        >
          <div className="flex flex-col gap-2">
            <TitleTag className="text-pretty text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
              {title}
            </TitleTag>
            {subtitle ? (
              <p className="text-pretty text-sm leading-6 text-zinc-600 sm:text-base sm:leading-7 dark:text-zinc-400">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex-1 sm:mt-8">{children}</div>

          {footer ? <div className="mt-8 sm:mt-10">{footer}</div> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
