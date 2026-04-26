"use client";

import { Inter } from "next/font/google";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AiCoachSummaryIllustration,
  AiCoachVsTraditionalIllustration,
  LadderIllustration,
  StruggleSummaryIllustration,
  WorldMapIllustration,
} from "@/components/FunnelArt";
import { FunnelHeader } from "@/components/FunnelHeader";
import {
  ChoiceGrid,
  LanguageChoiceGrid,
  MultiChoiceGrid,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from "@/components/controls";
import { EmailStepConfetti } from "@/components/EmailStepConfetti";
import { OtherLanguageSelect } from "@/components/OtherLanguageSelect";
import { QuestionShell } from "@/components/QuestionShell";
import { SegmentedProgressBar } from "@/components/SegmentedProgressBar";
import {
  ageLabelForStats,
  languageLevelLabel,
  learnerCountForSummary,
  resolvedLanguageDisplay,
} from "@/lib/onboarding/copy";
import { useOnboarding } from "@/lib/onboarding/store";
import {
  isSummaryStep,
  questionProgressForStep,
  stepOrder,
  type DailyTimeCommitmentId,
  type GoalId,
  type LearningMediumId,
  type LearningStyleId,
  type OnboardingAnswers,
  type OnboardingStepId,
} from "@/lib/onboarding/types";

const quizSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Q1…Q10 → main questions + loader + email (summaries skipped). Indices resolved via `stepOrder`. */
const THANK_YOU_Q_STEP_IDS = [
  "language",
  "age",
  "level",
  "goals",
  "learningStyle",
  "struggles",
  "bobHeard",
  "learningMediums",
  "loading",
  "email",
] as const satisfies readonly OnboardingStepId[];

const LANGUAGE_OPTIONS: Array<{
  value: NonNullable<OnboardingAnswers["language"]>;
  label: string;
  flag: string;
}> = [
  { value: "english", label: "English", flag: "🇬🇧" },
  { value: "spanish", label: "Spanish", flag: "🇪🇸" },
  { value: "french", label: "French", flag: "🇫🇷" },
  { value: "german", label: "German", flag: "🇩🇪" },
  { value: "korean", label: "Korean", flag: "🇰🇷" },
  { value: "japanese", label: "Japanese", flag: "🇯🇵" },
  { value: "italian", label: "Italian", flag: "🇮🇹" },
  { value: "portuguese", label: "Portuguese", flag: "🇵🇹" },
  { value: "chinese", label: "Chinese", flag: "🇨🇳" },
];

/** Question 3 (level): `0bar.svg` … `4bar.svg` left of label, lowest → highest proficiency. */
const LEVEL_CHOICE_OPTIONS = [
  { value: "elementary", label: "Elementary" },
  { value: "beginner", label: "Beginner" },
  { value: "pre_intermediate", label: "Pre-Intermediate" },
  { value: "upper_intermediate", label: "Upper-Intermediate" },
  { value: "advanced", label: "Advanced" },
].map((opt, i) => ({
  ...opt,
  prefix: (
    <img
      src={`/${i}bar.svg`}
      alt=""
      width={28}
      height={28}
      className="h-7 w-7 shrink-0 object-contain"
      aria-hidden
    />
  ),
}));

function headerTitle(stepId: OnboardingStepId): string {
  if (stepId === "loading" || stepId === "email" || stepId === "thankYouNav") return "AI Language Tutor";
  if (stepId === "goals" || stepId === "learningStyle" || stepId === "struggles" || stepId === "learningMediums")
    return "Your plan";
  return "My profile";
}

function isMultiSelectStep(stepId: OnboardingStepId) {
  return stepId === "goals" || stepId === "struggles" || stepId === "learningMediums";
}

/** Single-choice steps: tap an option to continue (no Continue button). */
function isSingleSelectStep(stepId: OnboardingStepId, a: OnboardingAnswers) {
  if (stepId === "language" && a.languageOther) return false;
  return (
    stepId === "language" ||
    stepId === "age" ||
    stepId === "level" ||
    stepId === "learningStyle" ||
    stepId === "bobHeard"
  );
}

function clampText(s: string, maxLen: number) {
  const t = s.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

/** “None of these” is mutually exclusive with other struggle options (question 6). */
const STRUGGLES_EXCLUSIVE_NONE = "none_believe_can_do_it" as const;

function nextStrugglesSelection(
  prev: OnboardingAnswers["struggles"],
  v: OnboardingAnswers["struggles"],
): OnboardingAnswers["struggles"] {
  if (v.includes(STRUGGLES_EXCLUSIVE_NONE) && !prev.includes(STRUGGLES_EXCLUSIVE_NONE)) {
    return [STRUGGLES_EXCLUSIVE_NONE];
  }
  if (prev.includes(STRUGGLES_EXCLUSIVE_NONE) && v.includes(STRUGGLES_EXCLUSIVE_NONE) && v.length > 1) {
    return v.filter((x) => x !== STRUGGLES_EXCLUSIVE_NONE);
  }
  return v;
}

function canProceed(stepId: OnboardingStepId, a: OnboardingAnswers) {
  switch (stepId) {
    case "language":
      return a.language !== null || Boolean(a.languageOther);
    case "age":
      return a.age !== null;
    case "level":
      return a.level !== null;
    case "summaryMap":
    case "summaryLadder":
    case "summaryStruggle":
    case "summaryAiTutor":
    case "summaryExpertsScience":
    case "thankYouNav":
      return true;
    case "goals":
      return a.goals.length >= 1;
    case "learningStyle":
      return a.learningStyle !== null;
    case "struggles":
      return a.struggles.length >= 1;
    case "bobHeard":
      return a.bob !== null;
    case "learningMediums":
      return a.learningMediums.length >= 1;
    case "loading":
      return false;
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim());
    default:
      return true;
  }
}

function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

/** ISO 3166-1 alpha-2 → regional-indicator flag emoji; invalid / unknown → globe. */
function flagEmojiFromRegionCode(region: string | undefined): string {
  if (!region || region.length !== 2) return "🌍";
  const upper = region.toUpperCase();
  const A = 0x1f1e6;
  const c0 = upper.codePointAt(0);
  const c1 = upper.codePointAt(1);
  if (c0 === undefined || c1 === undefined) return "🌍";
  const i0 = c0 - 0x41;
  const i1 = c1 - 0x41;
  if (i0 < 0 || i0 > 25 || i1 < 0 || i1 > 25) return "🌍";
  return String.fromCodePoint(A + i0, A + i1);
}

function viewerRegionFromNavigator(): string | undefined {
  if (typeof navigator === "undefined") return undefined;
  const raw = navigator.languages?.[0] ?? navigator.language;
  if (!raw) return undefined;
  try {
    const loc = new Intl.Locale(raw);
    if (loc.region && /^[A-Za-z]{2}$/.test(loc.region)) return loc.region;
  } catch {
    /* ignore */
  }
  const parts = raw.split(/[-_]/);
  const last = parts[parts.length - 1];
  if (last && /^[A-Za-z]{2}$/.test(last) && last !== raw) return last;
  return undefined;
}

const LOADER_DURATION_MS = 8000;

const LOADER_GOAL_LABEL: Record<GoalId, string> = {
  speak_confidently: "Speak confidently",
  become_fluent: "Become fluent",
  travel_easily: "Travel easily",
  watch_movies: "Watch movies",
  enjoy_music: "Enjoy music",
  understand_culture: "Understand culture",
  grow_career: "Grow career",
  pass_exams: "Pass exams",
};

const LOADER_MEDIUM_LABEL: Record<LearningMediumId, string> = {
  practice_exercises: "Practice exercises",
  images_videos: "Images & Videos",
  listening: "Listening",
  reading_writing: "Reading & Writing",
};

const LOADER_LEARNING_STYLE_LABEL: Record<LearningStyleId, string> = {
  struggle_a_lot: "I struggle a lot",
  could_be_better: "Could be better",
  pretty_confident: "Pretty confident",
};

type LoaderSpeedSeg = { u0: number; u1: number; exp: number; dp: number };

/** Random time segments with per-segment power easing so the ring speeds up and slows unevenly. */
function buildLoaderSpeedSegments(): LoaderSpeedSeg[] {
  const segs: LoaderSpeedSeg[] = [];
  let u = 0;
  let guard = 0;
  while (u < 1 - 1e-9 && guard++ < 48) {
    const du = Math.min(1 - u, 0.035 + Math.random() * 0.24);
    const u1 = Math.min(1, u + du);
    segs.push({ u0: u, u1, exp: 0.28 + Math.random() * 2.25, dp: 0 });
    u = u1;
  }
  if (segs.length === 0) segs.push({ u0: 0, u1: 1, exp: 1, dp: 1 });
  const sum = segs.reduce((s, g) => s + (g.u1 - g.u0), 0);
  for (const g of segs) g.dp = sum > 0 ? (g.u1 - g.u0) / sum : 1 / segs.length;
  return segs;
}

function loaderProgressFromSegments(segs: LoaderSpeedSeg[], u: number): number {
  let p = 0;
  for (const g of segs) {
    if (u <= g.u0) break;
    if (u >= g.u1) p += g.dp;
    else {
      const w = (u - g.u0) / (g.u1 - g.u0);
      p += g.dp * Math.pow(Math.max(0, Math.min(1, w)), g.exp);
      break;
    }
  }
  return Math.min(99, Math.round(p * 99));
}

function loaderPhase(elapsedMs: number): 0 | 1 | 2 | 3 {
  if (elapsedMs < 2000) return 0;
  if (elapsedMs < 4000) return 1;
  if (elapsedMs < 6000) return 2;
  return 3;
}

function loaderStatusMessage(phase: 0 | 1 | 2 | 3, a: OnboardingAnswers): string {
  const lang = resolvedLanguageDisplay(a);
  const langTitle = lang === "your chosen" ? "Language" : lang;
  switch (phase) {
    case 0:
      return `Creating your ${langTitle} Learning Plan`;
    case 1: {
      const lv = languageLevelLabel(a.level);
      const age = ageLabelForStats(a.age);
      const goalParts = a.goals.map((g) => LOADER_GOAL_LABEL[g]);
      const goalStr =
        goalParts.length === 0 ? "your goals" : goalParts.length <= 3 ? goalParts.join(", ") : `${goalParts.slice(0, 2).join(", ")}, +${goalParts.length - 2} more`;
      return `Processing inputs: ${lv} level, age ${age}, goals: ${goalStr}…`;
    }
    case 2: {
      const prefs = a.learningMediums.map((m) => LOADER_MEDIUM_LABEL[m]).join(", ");
      const skills =
        a.learningStyle !== null ? `; learning skills: ${LOADER_LEARNING_STYLE_LABEL[a.learningStyle]}` : "";
      return `Tuning plan with user preferences: ${prefs || "your selected formats"}${skills}`;
    }
    default:
      return "Wrapping up your personalized plan…";
  }
}

function LoadingStep({
  answers,
  onDailyTime,
  onComplete,
}: {
  answers: OnboardingAnswers;
  onDailyTime: (v: DailyTimeCommitmentId) => void;
  onComplete: () => void;
}) {
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const onDailyTimeRef = useRef(onDailyTime);
  onDailyTimeRef.current = onDailyTime;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [pct, setPct] = useState(0);
  const [statusText, setStatusText] = useState(() => loaderStatusMessage(0, answers));
  const [viewerFlag, setViewerFlag] = useState("🌍");
  const [modalOpen, setModalOpen] = useState(false);

  const phaseRef = useRef<0 | 1 | 2 | 3 | -1>(-1);
  const totalPauseMsRef = useRef(0);
  const pauseOpenWallRef = useRef<number | null>(null);
  const hit51Ref = useRef(false);
  const completedRef = useRef(false);
  const rafIdRef = useRef(0);

  const handlePickDailyTime = (v: DailyTimeCommitmentId) => {
    const when = performance.now();
    if (pauseOpenWallRef.current !== null) {
      totalPauseMsRef.current += when - pauseOpenWallRef.current;
      pauseOpenWallRef.current = null;
    }
    setModalOpen(false);
    onDailyTimeRef.current(v);
  };

  useEffect(() => {
    phaseRef.current = -1;
    completedRef.current = false;
    hit51Ref.current = false;
    totalPauseMsRef.current = 0;
    pauseOpenWallRef.current = null;
    setModalOpen(false);
    setPct(0);
    setStatusText(loaderStatusMessage(0, answersRef.current));
    setViewerFlag(flagEmojiFromRegionCode(viewerRegionFromNavigator()));

    const segs = buildLoaderSpeedSegments();
    const start = performance.now();

    function effectiveElapsed(now: number): number {
      const pOpen = pauseOpenWallRef.current;
      if (pOpen !== null) return pOpen - start - totalPauseMsRef.current;
      return now - start - totalPauseMsRef.current;
    }

    function tick(now: number) {
      if (completedRef.current) return;

      const a = answersRef.current;
      let el = Math.min(LOADER_DURATION_MS, effectiveElapsed(now));
      let u = el / LOADER_DURATION_MS;
      let nextPct = loaderProgressFromSegments(segs, u);

      if (nextPct >= 51) hit51Ref.current = true;

      if (
        pauseOpenWallRef.current === null &&
        a.dailyTimeCommitment === null &&
        nextPct >= 51
      ) {
        pauseOpenWallRef.current = now;
        setModalOpen(true);
        el = Math.min(LOADER_DURATION_MS, effectiveElapsed(now));
        u = el / LOADER_DURATION_MS;
        nextPct = loaderProgressFromSegments(segs, u);
      }

      setPct(Math.round(nextPct));

      const ph = loaderPhase(el);
      if (ph !== phaseRef.current) {
        phaseRef.current = ph;
        setStatusText(loaderStatusMessage(ph, a));
      }

      const canFinish = el >= LOADER_DURATION_MS && (!hit51Ref.current || a.dailyTimeCommitment !== null);
      if (canFinish && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current();
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    }

    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, []);

  const r = 64;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center px-1">
      <h2 className="sr-only">Building your plan</h2>

      <div className="relative mx-auto aspect-square w-[min(100%,160px)] sm:w-[min(100%,170px)]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r={r} fill="none" className="stroke-funnel-track" strokeWidth="12" />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            className="stroke-funnel-primary"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-[1.65rem] font-bold leading-none tracking-tight text-funnel-primary sm:text-[1.85rem]">
            {pct}%
          </span>
        </div>
      </div>

      <p className="mt-6 max-w-sm text-pretty text-center text-sm font-medium leading-snug text-funnel-ink sm:text-base">
        {statusText}
      </p>

      <div className="mt-8 text-center">
        <p className="text-[1.2rem] font-bold leading-tight text-funnel-primary sm:text-xl">
          Over 800&nbsp;000 people
        </p>
        <p className="mt-1 text-base font-normal text-funnel-ink">have chosen our AI Language Tutor app</p>
      </div>

      <div className="mt-10 w-full rounded-2xl bg-neutral-100 px-4 py-4 text-left sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <div className="flex gap-0.5 text-amber-500" aria-hidden>
            {"★★★★★".split("").map((s, i) => (
              <span key={i} className="text-lg leading-none">
                {s}
              </span>
            ))}
          </div>
          <p className="text-right text-xs font-medium leading-snug text-funnel-muted sm:text-sm">
            Real user from {viewerFlag}
          </p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-funnel-ink/90 sm:text-[0.9375rem] sm:leading-relaxed">
          This app is a game changer. After a few weeks I started feeling way more confident speaking and understanding
          stuff. For the first time, learning a language didn&apos;t feel that hard. And it was just like 10–15 mins a
          day.
        </p>
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:pb-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="loader-daily-time-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-funnel-border bg-funnel-surface p-5 shadow-xl sm:p-6">
            <h3
              id="loader-daily-time-title"
              className="text-pretty text-center text-lg font-bold leading-tight text-funnel-ink sm:text-xl"
            >
              How much time can you spend learning daily?
            </h3>
            <div className="mt-5 flex flex-col gap-2.5">
              {(
                [
                  { value: "up_to_5_mins" as const, label: "up to 5 mins" },
                  { value: "5_to_15_mins" as const, label: "5–15 mins" },
                  { value: "more_than_15_mins" as const, label: "more than 15 mins" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handlePickDailyTime(opt.value)}
                  className="flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-xl border border-funnel-border bg-white px-4 py-3 text-center text-base font-medium text-funnel-ink transition hover:border-funnel-primary/40 hover:bg-funnel-selected active:scale-[0.99] sm:min-h-[56px] sm:text-lg"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function OnboardingWizard() {
  const { state, dispatch } = useOnboarding();
  const stepId = stepOrder[state.stepIndex] ?? "language";
  const a = state.answers;
  const progress = useMemo(() => questionProgressForStep(stepId), [stepId]);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "error">("idle");
  const [submitError, setSubmitError] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailFieldError, setEmailFieldError] = useState<"required" | "invalid" | null>(null);
  const [emailConfettiBurst, setEmailConfettiBurst] = useState(0);
  const prevStepIdRef = useRef<OnboardingStepId | null>(null);

  const nextDisabled = !canProceed(stepId, a);
  const floatingCtaDisabled =
    stepId === "email" ? submitState === "submitting" : nextDisabled || submitState === "submitting";
  const summary = isSummaryStep(stepId);
  const multi = isMultiSelectStep(stepId);
  const singleSelect = isSingleSelectStep(stepId, a);
  const showFloatingContinue = stepId !== "loading" && !singleSelect;

  useEffect(() => {
    if (stepId !== "email") setEmailFieldError(null);
  }, [stepId]);

  useLayoutEffect(() => {
    if (stepId === "email" && prevStepIdRef.current !== "email") {
      setEmailConfettiBurst((k) => k + 1);
    }
    prevStepIdRef.current = stepId;
  }, [stepId]);

  async function handleContinue() {
    if (stepId === "loading") return;

    if (stepId === "thankYouNav") {
      setEmailSent(true);
      return;
    }

    if (stepId === "email") {
      const raw = a.email.trim();
      if (raw.length === 0) {
        setEmailFieldError("required");
        return;
      }
      if (!isValidEmail(raw)) {
        setEmailFieldError("invalid");
        return;
      }
      setEmailFieldError(null);
      try {
        setSubmitState("submitting");
        setSubmitError("");
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers: a }),
        });
        const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Failed to submit");
        }
        setSubmitState("idle");
        dispatch({ type: "next" });
      } catch (e) {
        setSubmitState("error");
        setSubmitError(e instanceof Error ? e.message : "Failed to submit");
      }
      return;
    }

    if (!canProceed(stepId, a)) return;
    dispatch({ type: "next" });
  }

  const titleForStep = (): string => {
    switch (stepId) {
      case "language":
        return "What language would you like to learn?";
      case "age":
        return "What is your age?";
      case "level":
        return `What's your ${resolvedLanguageDisplay(a)} level?`;
      case "goals":
        return "What are your language goals?";
      case "summaryLadder":
        return "You're making progress already!";
      case "learningStyle":
        return "How do you feel about your learning skills?";
      case "summaryStruggle":
        return "";
      case "struggles":
        return "Do any of these sound familiar?";
      case "bobHeard":
        return "Did you hear about our AI Tutor from a language professional?";
      case "summaryAiTutor":
        return "Introducing AI Language Tutor";
      case "summaryExpertsScience":
        return "Built by experts. Backed by science";
      case "learningMediums":
        return "What is your learning style?";
      case "loading":
        return "Building your plan";
      case "email":
        return "";
      case "thankYouNav":
        return "Thank you!";
      default:
        return "";
    }
  };

  const subtitleForStep = (): ReactNode => {
    switch (stepId) {
      case "summaryMap": {
        const rawCount = learnerCountForSummary(a.age, a.level, a.language, a.languageOther);
        const countWithZeros = Math.floor(rawCount / 100) * 100;
        const count = countWithZeros.toLocaleString("en-US");
        const ageL = ageLabelForStats(a.age);
        const lang = resolvedLanguageDisplay(a);
        const levelLabel = a.level ? languageLevelLabel(a.level) : "Language";
        const useBeginnersWord = a.level === "elementary" || a.level === "beginner";
        return (
          <div className="mx-auto w-full max-w-xl text-center">
            <p className="m-0">
              <strong className="block text-4xl font-bold tabular-nums leading-[1.05] tracking-tight text-funnel-primary sm:text-5xl sm:leading-[1.05]">
                {count}
              </strong>
            </p>
            <p className="m-0 mt-2 text-pretty sm:mt-3">
              {useBeginnersWord ? (
                <strong className="font-bold text-funnel-primary">Beginners</strong>
              ) : (
                <>
                  <strong className="font-bold text-funnel-primary">{levelLabel}</strong>
                  <span className="text-slate-600"> learners </span>
                </>
              )}
              <span className="text-slate-600">{useBeginnersWord ? " aged " : "aged "}</span>
              <strong className="font-bold tabular-nums text-funnel-primary">{ageL}</strong>
              <span className="text-slate-600"> are already improving their </span>
              <strong className="font-bold text-funnel-primary">{lang}</strong>
              <span className="text-slate-600"> with us</span>
            </p>
          </div>
        );
      }
      case "age":
        return "We only use age to personalize your plan";
      case "goals":
        return "Select all that apply";
      case "learningMediums":
        return "Select all that apply";
      case "struggles":
        return (
          <span className="block text-base leading-[1.55] antialiased sm:text-lg sm:leading-[1.58]">
            {"We use your barriers to help you overcome them"}
          </span>
        );
      case "summaryLadder":
        return (
          <p className="leading-[1.6] text-slate-600 antialiased">
            <span>Science shows that </span>
            <strong className="font-semibold text-funnel-primary">setting clear goals</strong>
            <span> makes you </span>
            <strong className="font-semibold text-funnel-primary">3× more likely</strong>
            <span> to meet them — give yourself a mini high five</span>
          </p>
        );
      case "summaryAiTutor":
        return (
          <p className="text-pretty leading-[1.6] text-slate-600 antialiased">
            {
              "AI Language Tutor is a smarter way to learn a language. It adjusts to you and helps you improve faster with less effort."
            }
          </p>
        );
      case "summaryExpertsScience":
        return (
          <p className="text-pretty leading-[1.6] text-slate-600 antialiased">
            <span>With our </span>
            <strong className="font-semibold text-funnel-primary">AI Tutor</strong>
            <span>, you can make progress up to </span>
            <strong className="font-semibold text-funnel-primary">2× faster</strong>
            <span> than with traditional methods</span>
          </p>
        );
      case "thankYouNav":
        return "Navigation to pages";
      default:
        return undefined;
    }
  };

  const primaryCta = "Continue";

  /** Invisible title keeps first-summary subtitle vertical position (no visible title). */
  const shellTitle: ReactNode =
    stepId === "summaryMap" ? (
      <span className="invisible select-none text-pretty text-2xl font-bold leading-tight tracking-tight sm:text-[1.65rem]" aria-hidden>
        .
      </span>
    ) : (
      titleForStep()
    );

  const shellSubtitle =
    stepId === "email" || stepId === "summaryStruggle" ? undefined : subtitleForStep();

  if (emailSent) {
    return (
      <div className={`${quizSans.className} flex min-h-dvh flex-col bg-funnel-canvas text-funnel-ink`}>
        <FunnelHeader title="My profile" onBack={() => {}} showBack={false} />
        <div className="flex flex-1 flex-col items-center px-4 pb-8 pt-10">
          <div className="w-full max-w-lg text-center">
            <h2 className="text-2xl font-bold text-funnel-ink">You&apos;re all set</h2>
            <p className="mt-3 text-sm leading-relaxed text-funnel-muted">
              Check your inbox at <span className="font-semibold text-funnel-ink">{a.email}</span> for next steps.
            </p>
            <div className="mt-10">
              <PrimaryButton
                onClick={() => {
                  setEmailSent(false);
                  dispatch({ type: "reset" });
                }}
                className="w-full"
              >
                Start over
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${quizSans.className} flex min-h-dvh flex-col bg-funnel-canvas text-funnel-ink [color-scheme:light]`}>
      {stepId === "email" && emailConfettiBurst > 0 ? (
        <EmailStepConfetti burstKey={emailConfettiBurst} />
      ) : null}
      <FunnelHeader
        title={headerTitle(stepId)}
        onBack={() => dispatch({ type: "back" })}
        showBack={state.stepIndex > 0}
      />

      <div
        className={[
          "mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-5",
          showFloatingContinue ? "pb-28 sm:pb-32" : "pb-8",
        ].join(" ")}
      >
        <div className="mb-6">
          <SegmentedProgressBar value={progress.current} max={progress.total} />
        </div>

        <QuestionShell
          stepKey={stepId}
          align={summary || multi || stepId === "loading" ? "center" : "start"}
          tightTitleToContent={false}
          title={shellTitle}
          subtitle={shellSubtitle}
          hideTitleArea={stepId === "loading" || stepId === "email" || stepId === "summaryStruggle"}
        >
          {stepId === "language" ? (
            <div className="space-y-4">
              <LanguageChoiceGrid
                value={a.language}
                onChange={(v) => dispatch({ type: "answerAndNext", key: "language", value: v })}
                options={LANGUAGE_OPTIONS}
              />
              <OtherLanguageSelect
                value={a.languageOther}
                onChange={(v) => dispatch({ type: "answer", key: "languageOther", value: v })}
              />
              <p className="text-center text-[10px] leading-snug text-funnel-muted italic sm:text-[11px]">
                By selecting a language and continuing, you agree to our{" "}
                <a href="#" className="italic font-normal text-funnel-muted underline underline-offset-2">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a href="#" className="italic font-normal text-funnel-muted underline underline-offset-2">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          ) : null}

          {stepId === "age" ? (
            <ChoiceGrid
              value={a.age ?? ""}
              onChange={(v) => dispatch({ type: "answerAndNext", key: "age", value: v as OnboardingAnswers["age"] })}
              options={[
                { value: "18-24", label: "18–24" },
                { value: "25-34", label: "25–34" },
                { value: "35-44", label: "35–44" },
                { value: "45-54", label: "45–54" },
                { value: "55-64", label: "55–64" },
                { value: "65+", label: "65+" },
              ]}
            />
          ) : null}

          {stepId === "level" ? (
            <ChoiceGrid
              value={a.level ?? ""}
              onChange={(v) => dispatch({ type: "answerAndNext", key: "level", value: v as OnboardingAnswers["level"] })}
              options={LEVEL_CHOICE_OPTIONS}
            />
          ) : null}

          {stepId === "summaryMap" ? (
            <div className="-mt-[30px] w-full">
              <WorldMapIllustration />
            </div>
          ) : null}

          {stepId === "goals" ? (
            <MultiChoiceGrid
              columns={2}
              values={a.goals}
              onChange={(v) => dispatch({ type: "answer", key: "goals", value: v })}
              options={[
                { value: "speak_confidently", label: "Speak confidently" },
                { value: "become_fluent", label: "Become fluent" },
                { value: "travel_easily", label: "Travel easily" },
                { value: "watch_movies", label: "Watch movies" },
                { value: "enjoy_music", label: "Enjoy music" },
                { value: "understand_culture", label: "Understand culture" },
                { value: "grow_career", label: "Grow career" },
                { value: "pass_exams", label: "Pass exams" },
              ]}
            />
          ) : null}

          {stepId === "summaryLadder" ? <LadderIllustration /> : null}

          {stepId === "learningStyle" ? (
            <ChoiceGrid
              value={a.learningStyle ?? ""}
              onChange={(v) =>
                dispatch({ type: "answerAndNext", key: "learningStyle", value: v as OnboardingAnswers["learningStyle"] })
              }
              options={[
                { value: "struggle_a_lot", label: "I struggle a lot" },
                { value: "could_be_better", label: "Could be better" },
                { value: "pretty_confident", label: "Pretty confident" },
              ]}
            />
          ) : null}

          {stepId === "struggles" ? (
            <div className="w-full min-w-0 self-stretch">
              <MultiChoiceGrid
                values={a.struggles}
                onChange={(v) =>
                  dispatch({ type: "answer", key: "struggles", value: nextStrugglesSelection(a.struggles, v) })
                }
                options={[
                  { value: "takes_too_long", label: "It takes too long to become fluent" },
                  { value: "forget_what_i_learn", label: "I forget what I learn" },
                  { value: "afraid_to_speak_mistakes", label: "I'm afraid to speak and make mistakes" },
                  { value: "not_enough_time", label: "I don't have enough time" },
                  { value: "boring_or_distracted", label: "It's boring or I get distracted" },
                  { value: "none_believe_can_do_it", label: "None of these — I believe I can do it!" },
                ]}
              />
            </div>
          ) : null}

          {stepId === "summaryStruggle" ? (
            <div className="flex w-full max-w-xl flex-col items-center sm:max-w-2xl">
              <p className="mt-5 max-w-xl text-pretty text-center text-lg font-normal leading-[1.65] tracking-tight text-slate-600 antialiased sm:mt-6 sm:text-xl sm:leading-[1.7]">
                <span className="font-semibold text-funnel-primary">If learning a language feels hard</span>, it’s
                usually not you — <span className="font-semibold text-funnel-primary">it’s the method</span>. The right
                approach makes progress <span className="font-semibold text-funnel-primary">feel natural</span>, not
                frustrating
              </p>
              <StruggleSummaryIllustration />
            </div>
          ) : null}

          {stepId === "bobHeard" ? (
            <ChoiceGrid
              value={a.bob ?? ""}
              onChange={(v) => dispatch({ type: "answerAndNext", key: "bob", value: v as OnboardingAnswers["bob"] })}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          ) : null}

          {stepId === "summaryAiTutor" ? (
            <div className="-mt-[30px] w-full">
              <AiCoachSummaryIllustration />
            </div>
          ) : null}

          {stepId === "summaryExpertsScience" ? (
            <div className="-mt-[30px] w-full">
              <AiCoachVsTraditionalIllustration />
            </div>
          ) : null}

          {stepId === "learningMediums" ? (
            <div className="w-full min-w-0 self-stretch">
              <MultiChoiceGrid
                values={a.learningMediums}
                onChange={(v) => dispatch({ type: "answer", key: "learningMediums", value: v })}
                options={[
                  { value: "practice_exercises", label: "Practice exercises" },
                  { value: "images_videos", label: "Images & Videos" },
                  { value: "listening", label: "Listening" },
                  { value: "reading_writing", label: "Reading & Writing" },
                ]}
              />
            </div>
          ) : null}

          {stepId === "loading" ? (
            <LoadingStep
              answers={a}
              onDailyTime={(v) => dispatch({ type: "answer", key: "dailyTimeCommitment", value: v })}
              onComplete={() => dispatch({ type: "next" })}
            />
          ) : null}

          {stepId === "email" ? (
            <div className="w-full max-w-lg space-y-4">
              <h2 className="text-pretty text-left text-2xl font-bold leading-tight tracking-tight text-funnel-ink sm:text-[1.65rem]">
                Enter your email to get your personalized{" "}
                <span className="font-bold text-funnel-primary">Language Learning Plan</span>
              </h2>
              <div className="pt-2">
                <TextInput
                  autoFocus
                  type="email"
                  value={a.email}
                  placeholder="Email"
                  invalid={emailFieldError !== null}
                  onChange={(v) => {
                    setEmailFieldError(null);
                    dispatch({ type: "answer", key: "email", value: clampText(v, 120) });
                  }}
                />
                {emailFieldError === "required" ? (
                  <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                    Email is required
                  </p>
                ) : null}
                {emailFieldError === "invalid" ? (
                  <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                    Invalid email address
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2.5 pt-1 text-left text-sm leading-relaxed text-funnel-muted">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-funnel-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>
                  We respect your privacy and are committed to protecting your personal data. Your data will be
                  processed in accordance with our{" "}
                  <a href="#" className="font-medium text-funnel-ink underline underline-offset-2">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          ) : null}

          {stepId === "thankYouNav" ? (
            <div className="mx-auto w-full max-w-md space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
                {THANK_YOU_Q_STEP_IDS.map((id, i) => (
                  <SecondaryButton
                    key={id}
                    className="!w-full min-w-0 justify-center px-2 text-sm sm:!w-full sm:text-base"
                    onClick={() => dispatch({ type: "goTo", stepIndex: stepOrder.indexOf(id) })}
                  >
                    Q{i + 1}
                  </SecondaryButton>
                ))}
              </div>
            </div>
          ) : null}
        </QuestionShell>
      </div>

      {showFloatingContinue ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center bg-gradient-to-t from-funnel-canvas from-40% to-transparent pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-12">
          <div className="pointer-events-auto w-full max-w-lg px-4">
            {submitState === "error" ? (
              <p className="mb-2 text-center text-xs text-red-600">{submitError || "Something went wrong."}</p>
            ) : null}
            <PrimaryButton
              onClick={handleContinue}
              disabled={floatingCtaDisabled}
              className="w-full shadow-md"
            >
              {submitState === "submitting" && stepId === "email" ? "Sending…" : primaryCta}
            </PrimaryButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
