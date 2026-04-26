"use client";

import Image from "next/image";

/** Matches `public/worldmap_sumaryOLA.webp` (max 1280px wide, RGBA). */
const MAP_W = 1280;
const MAP_H = 853;

/** `public/ladder-summary2.webp` */
const LADDER_W = 1280;
const LADDER_H = 853;

/** `public/ai_coach_summary.webp` (max 1280px wide, RGBA). */
const AI_COACH_SUMMARY_W = 1280;
const AI_COACH_SUMMARY_H = 853;

/** `public/ai_coach_vs_traditional1.webp` (max 1280px wide, RGBA). */
const AI_COACH_VS_TRADITIONAL_W = 1280;
const AI_COACH_VS_TRADITIONAL_H = 853;

/** `public/struggle-summary3.webp` (portrait) */
const STRUGGLE_SUMMARY_W = 853;
const STRUGGLE_SUMMARY_H = 1280;

export function WorldMapIllustration() {
  return (
    <div
      className="mx-auto w-full max-w-xl sm:max-w-2xl"
      role="img"
      aria-label="World map with learner locations across the globe"
    >
      <Image
        src="/worldmap_sumaryOLA.webp"
        alt="World map with pins showing learners worldwide"
        width={MAP_W}
        height={MAP_H}
        className="h-auto w-full rounded-2xl"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 672px"
        priority
        quality={82}
      />
    </div>
  );
}

export function LadderIllustration() {
  return (
    <div
      className="mx-auto w-full max-w-xl sm:max-w-2xl"
      role="img"
      aria-label="Ladder illustrating progress toward your language goals"
    >
      <Image
        src="/ladder-summary2.webp"
        alt="Ladder illustrating progress toward your language goals"
        width={LADDER_W}
        height={LADDER_H}
        className="h-auto w-full rounded-2xl"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 672px"
        quality={82}
      />
    </div>
  );
}

export function AiCoachSummaryIllustration() {
  return (
    <div
      className="mx-auto w-full max-w-xl sm:max-w-2xl"
      role="img"
      aria-label="AI Language Tutor illustration"
    >
      <Image
        src="/ai_coach_summary.webp"
        alt="AI Language Tutor illustration"
        width={AI_COACH_SUMMARY_W}
        height={AI_COACH_SUMMARY_H}
        className="h-auto w-full rounded-2xl"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 672px"
        quality={82}
      />
    </div>
  );
}

export function AiCoachVsTraditionalIllustration() {
  return (
    <div
      className="mx-auto w-full max-w-xl sm:max-w-2xl"
      role="img"
      aria-label="AI coach compared to traditional learning illustration"
    >
      <Image
        src="/ai_coach_vs_traditional1.webp"
        alt="AI coach compared to traditional learning"
        width={AI_COACH_VS_TRADITIONAL_W}
        height={AI_COACH_VS_TRADITIONAL_H}
        className="h-auto w-full rounded-2xl"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 672px"
        quality={82}
      />
    </div>
  );
}

export function StruggleSummaryIllustration() {
  return (
    <div
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl sm:max-w-lg"
      style={{
        aspectRatio: `${STRUGGLE_SUMMARY_W} / ${STRUGGLE_SUMMARY_H}`,
        maxHeight: "min(52vh, 640px)",
      }}
      role="img"
      aria-label="Illustration about learning method and progress"
    >
      <Image
        src="/struggle-summary3.webp"
        alt="Illustration about learning method and progress"
        fill
        className="object-contain object-top [clip-path:inset(10px_0_0_0)]"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 512px"
        quality={82}
      />
    </div>
  );
}
