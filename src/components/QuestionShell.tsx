"use client";

import { AnimatePresence, motion } from "framer-motion";
import type React from "react";

export function QuestionShell({
  stepKey,
  title,
  subtitle,
  children,
  footer,
}: {
  stepKey: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full min-h-[420px] sm:min-h-[520px] flex flex-col"
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-pretty text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex-1">{children}</div>

          {footer ? <div className="mt-10">{footer}</div> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

