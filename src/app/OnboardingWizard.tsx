"use client";

import { Inter } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LadderIllustration, StruggleSummaryIllustration, WorldMapIllustration } from "@/components/FunnelArt";
import { FunnelHeader } from "@/components/FunnelHeader";
import {
  ChoiceGrid,
  LanguageChoiceGrid,
  MultiChoiceGrid,
  PrimaryButton,
  TextInput,
} from "@/components/controls";
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
  type OnboardingAnswers,
  type OnboardingStepId,
} from "@/lib/onboarding/types";

const quizSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
  if (stepId === "loading" || stepId === "email") return "AI language tutor";
  if (stepId === "goals" || stepId === "learningStyle" || stepId === "struggles") return "Your plan";
  return "My profile";
}

function isMultiSelectStep(stepId: OnboardingStepId) {
  return stepId === "goals" || stepId === "struggles";
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
    case "summaryThanksA":
    case "summaryThanksB":
      return true;
    case "goals":
      return a.goals.length >= 1;
    case "learningStyle":
      return a.learningStyle !== null;
    case "struggles":
      return a.struggles.length >= 1;
    case "bobHeard":
      return a.bob !== null;
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

function LoadingStep() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 3800;
    let frame = 0;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setPct(Math.round(t * 99));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const r = 64;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-1">
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

      <p className="mt-6 max-w-sm text-center text-base font-medium leading-snug text-funnel-ink">
        Creating your Personalized Learning Plan
      </p>

      <div className="mt-8 text-center">
        <p className="text-[1.2rem] font-bold leading-tight text-funnel-primary sm:text-xl">
          Over 800&nbsp;000 people
        </p>
        <p className="mt-1 text-base font-normal text-funnel-ink">have chosen our AI language tutor app</p>
      </div>

      <div className="mt-10 w-full rounded-2xl bg-neutral-100 px-4 py-4 text-left sm:px-5 sm:py-5">
        <div className="flex gap-0.5 text-amber-500" aria-hidden>
          {"★★★★★".split("").map((s, i) => (
            <span key={i} className="text-lg leading-none">
              {s}
            </span>
          ))}
        </div>
        <p className="mt-2 text-base font-bold text-funnel-ink">This plan returned my spark back</p>
        <p className="mt-2 text-sm leading-relaxed text-funnel-ink/90">
          I wake up feeling refreshed, focused, and like myself again. People keep saying I look more alive, and honestly,
          I feel it too.
        </p>
      </div>
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

  const nextDisabled = !canProceed(stepId, a);
  const floatingCtaDisabled =
    stepId === "email" ? submitState === "submitting" : nextDisabled || submitState === "submitting";
  const summary = isSummaryStep(stepId);
  const multi = isMultiSelectStep(stepId);
  const singleSelect = isSingleSelectStep(stepId, a);
  const showFloatingContinue = stepId !== "loading" && !singleSelect;

  useEffect(() => {
    if (stepId !== "loading") return;
    const t = window.setTimeout(() => dispatch({ type: "next" }), 4200);
    return () => window.clearTimeout(t);
  }, [stepId, dispatch]);

  useEffect(() => {
    if (stepId !== "email") setEmailFieldError(null);
  }, [stepId]);

  async function handleContinue() {
    if (stepId === "loading") return;

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
        setEmailSent(true);
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
      case "summaryThanksA":
      case "summaryThanksB":
        return "Thanks for sharing!";
      case "bobHeard":
        return "Did you hear about Bob from mentor or coach?";
      case "loading":
        return "Building your plan";
      case "email":
        return "";
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
      case "struggles":
        return "Select all that apply";
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
      case "summaryThanksA":
      case "summaryThanksB":
        return (
          <p className="leading-[1.6] text-slate-600 antialiased">
            <span>Our program is developed by </span>
            <strong className="font-semibold text-funnel-primary">professionals</strong>
            <span> to match how you learn best</span>
          </p>
        );
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

          {stepId === "struggles" ? (
            <MultiChoiceGrid
              values={a.struggles}
              onChange={(v) => dispatch({ type: "answer", key: "struggles", value: v })}
              options={[
                { value: "takes_too_long", label: "It takes too long to become fluent" },
                { value: "forget_what_i_learn", label: "I forget what I learn" },
                { value: "afraid_to_speak_mistakes", label: "I'm afraid to speak and make mistakes" },
                { value: "not_enough_time", label: "I don't have enough time" },
                { value: "boring_or_distracted", label: "It's boring or I get distracted" },
                { value: "none_believe_can_do_it", label: "None of these — I believe I can do it!" },
              ]}
            />
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

          {stepId === "loading" ? <LoadingStep /> : null}

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
