"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { LadderIllustration, WorldMapIllustration } from "@/components/FunnelArt";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionShell } from "@/components/QuestionShell";
import {
  ChoiceGrid,
  LanguageChoiceGrid,
  MultiChoiceGrid,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from "@/components/controls";
import { ageLabelForStats, languageLabel } from "@/lib/onboarding/copy";
import { useOnboarding } from "@/lib/onboarding/store";
import {
  questionProgressForStep,
  stepOrder,
  type OnboardingAnswers,
  type OnboardingStepId,
} from "@/lib/onboarding/types";

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
  { value: "brazilian", label: "Portuguese (Brazil)", flag: "🇧🇷" },
];

function clampText(s: string, maxLen: number) {
  const t = s.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

function canProceed(stepId: OnboardingStepId, a: OnboardingAnswers) {
  switch (stepId) {
    case "language":
      return a.language !== null;
    case "age":
      return a.age !== null;
    case "level":
      return a.level !== null;
    case "summaryMap":
    case "summaryLadder":
    case "summaryThanksA":
    case "summaryThanksB":
      return true;
    case "goals":
      return a.goals.length >= 1;
    case "dailyStudy":
      return a.dailyStudy !== null;
    case "studyTimeOfDay":
      return a.studyTimeOfDay !== null;
    case "priorExperience":
      return a.priorExperience !== null;
    case "learningStyle":
      return a.learningStyle.length >= 1;
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

function validationHint(stepId: OnboardingStepId): string | null {
  switch (stepId) {
    case "goals":
    case "learningStyle":
    case "struggles":
      return "Select at least one option to continue.";
    case "email":
      return "Enter a valid email (e.g. you@example.com).";
    default:
      return null;
  }
}

const REVIEWS = [
  { quote: "I finally speak confidently on trips—10 minutes a day was enough to build momentum.", name: "Maya, 29" },
  { quote: "Clear goals + short lessons. I stopped quitting after week two.", name: "Jonas, 41" },
  { quote: "The reminders match how I actually learn. Huge difference vs. random apps.", name: "Priya, 36" },
];

function LoadingStep() {
  return (
    <div className="space-y-8">
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">Preparing your personalized plan…</p>
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: i * 0.32, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        ))}
      </div>
      <div className="space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Learners like you
        </p>
        {REVIEWS.map((r) => (
          <blockquote
            key={r.name}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300"
          >
            <p className="leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
            <footer className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">{r.name}</footer>
          </blockquote>
        ))}
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

  const nextDisabled = !canProceed(stepId, a);
  const hint = nextDisabled ? validationHint(stepId) : null;

  useEffect(() => {
    if (stepId !== "loading") return;
    const t = window.setTimeout(() => dispatch({ type: "next" }), 4200);
    return () => window.clearTimeout(t);
  }, [stepId, dispatch]);

  async function handleContinue() {
    if (stepId === "loading") return;
    if (!canProceed(stepId, a)) return;

    if (stepId === "email") {
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

    dispatch({ type: "next" });
  }

  const titleForStep = (): string => {
    switch (stepId) {
      case "language":
        return "What language would you like to learn?";
      case "age":
        return "What is your age?";
      case "level":
        return `What's your ${languageLabel(a.language)} language level?`;
      case "summaryMap":
        return "You've come to the right place!";
      case "goals":
        return "What goals do you have?";
      case "summaryLadder":
        return "You're making progress already!";
      case "dailyStudy":
        return "How many minutes per day can you practice?";
      case "studyTimeOfDay":
        return "When do you prefer to learn?";
      case "priorExperience":
        return "Have you learned languages before?";
      case "learningStyle":
        return "What is your learning style?";
      case "struggles":
        return "Do any of these sound familiar?";
      case "summaryThanksA":
        return "Thanks for sharing! Our program is developed by professionals.";
      case "bobHeard":
        return "Did you hear about Bob from mentor or coach?";
      case "summaryThanksB":
        return "Thanks for sharing! Our program is developed by professionals.";
      case "loading":
        return "Building your plan";
      case "email":
        return "Where should we send your plan?";
      default:
        return "";
    }
  };

  const subtitleForStep = (): string | undefined => {
    switch (stepId) {
      case "summaryMap":
        return `176,372 people aged ${ageLabelForStats(a.age)} are already improving their ${languageLabel(a.language)} language skills with us—but this journey is all about you!`;
      case "summaryLadder":
        return "Science shows setting clear goals makes you 3x more likely to meet them. Give yourself a mini high five.";
      case "email":
        return "We’ll email your next steps—no spam.";
      default:
        return undefined;
    }
  };

  const showProgress = progress !== null;

  if (emailSent) {
    return (
      <div className="flex min-h-dvh w-full flex-1 items-center justify-center bg-zinc-50 px-4 py-8 dark:bg-black">
        <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:rounded-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">You&apos;re all set</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Check your inbox at <span className="font-medium text-zinc-900 dark:text-zinc-200">{a.email}</span> for next
            steps.
          </p>
          <div className="mt-8">
            <PrimaryButton
              onClick={() => {
                setEmailSent(false);
                dispatch({ type: "reset" });
              }}
              className="w-full sm:w-auto"
            >
              Start over
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-1 justify-center bg-zinc-50 px-3 py-4 pb-8 dark:bg-black sm:px-5 sm:py-8">
      <div className="flex w-full max-w-lg flex-1 flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-xl sm:flex-none sm:rounded-3xl sm:p-8">
        {showProgress && progress ? (
          <div className="mb-6 flex items-center gap-3 sm:mb-8">
            <div className="min-w-0 flex-1">
              <ProgressBar value={progress.current} max={progress.total} />
            </div>
            <div className="shrink-0 tabular-nums text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {progress.current}/{progress.total}
            </div>
          </div>
        ) : null}

        <QuestionShell
          stepKey={stepId}
          title={titleForStep()}
          subtitle={subtitleForStep()}
          footer={
            stepId === "loading" ? (
              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">This only takes a few seconds…</p>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <SecondaryButton
                    onClick={() => dispatch({ type: "back" })}
                    disabled={state.stepIndex === 0}
                    className="sm:min-w-[6.5rem]"
                  >
                    Back
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleContinue}
                    disabled={nextDisabled || submitState === "submitting"}
                    className="sm:min-w-[8rem]"
                  >
                    {submitState === "submitting" && stepId === "email" ? "Sending…" : "Continue"}
                  </PrimaryButton>
                </div>
                {hint ? <div className="text-center text-xs text-zinc-500 sm:text-left dark:text-zinc-400">{hint}</div> : null}
                {submitState === "error" ? (
                  <div className="text-center text-xs text-red-600 sm:text-left dark:text-red-400">
                    {submitError || "Something went wrong. Please try again."}
                  </div>
                ) : null}
              </div>
            )
          }
        >
          {stepId === "language" ? (
            <LanguageChoiceGrid
              value={a.language}
              onChange={(v) => dispatch({ type: "answer", key: "language", value: v })}
              options={LANGUAGE_OPTIONS}
            />
          ) : null}

          {stepId === "age" ? (
            <ChoiceGrid
              columnsClass="grid-cols-1"
              value={a.age ?? ""}
              onChange={(v) => dispatch({ type: "answer", key: "age", value: v as OnboardingAnswers["age"] })}
              options={[
                { value: "18-34", label: "Age 18–34" },
                { value: "35-44", label: "Age 35–44" },
                { value: "45-54", label: "Age 45–54" },
                { value: "55+", label: "Age 55+" },
              ]}
            />
          ) : null}

          {stepId === "level" ? (
            <ChoiceGrid
              columnsClass="grid-cols-1"
              value={a.level ?? ""}
              onChange={(v) => dispatch({ type: "answer", key: "level", value: v as OnboardingAnswers["level"] })}
              options={[
                { value: "beginner", label: "Beginner", hint: "New or very little exposure" },
                { value: "elementary", label: "Elementary", hint: "Basics, simple conversations" },
                { value: "intermediate", label: "Intermediate", hint: "Comfortable in common situations" },
                { value: "advanced", label: "Advanced", hint: "Fluent in most contexts" },
                { value: "fluent", label: "Fluent / native-like", hint: "Fine-tuning and nuance" },
              ]}
            />
          ) : null}

          {stepId === "summaryMap" ? <WorldMapIllustration /> : null}

          {stepId === "goals" ? (
            <MultiChoiceGrid
              values={a.goals}
              onChange={(v) => dispatch({ type: "answer", key: "goals", value: v })}
              options={[
                { value: "speak_confidently", label: "Speak confidently" },
                { value: "travel_easily", label: "Travel easily" },
                { value: "understand_movies_music", label: "Understand movies & music" },
                { value: "watch_movies", label: "Watch movies" },
                { value: "grow_career", label: "Grow my career" },
                { value: "pass_exam", label: "Pass an exam" },
                { value: "learn_for_fun", label: "Learn for fun" },
              ]}
            />
          ) : null}

          {stepId === "summaryLadder" ? <LadderIllustration /> : null}

          {stepId === "dailyStudy" ? (
            <ChoiceGrid
              columnsClass="grid-cols-1"
              value={a.dailyStudy ?? ""}
              onChange={(v) =>
                dispatch({ type: "answer", key: "dailyStudy", value: v as OnboardingAnswers["dailyStudy"] })
              }
              options={[
                { value: "5", label: "About 5 minutes" },
                { value: "10", label: "About 10 minutes" },
                { value: "15", label: "About 15 minutes" },
                { value: "20plus", label: "20+ minutes" },
              ]}
            />
          ) : null}

          {stepId === "studyTimeOfDay" ? (
            <ChoiceGrid
              columnsClass="grid-cols-1"
              value={a.studyTimeOfDay ?? ""}
              onChange={(v) =>
                dispatch({ type: "answer", key: "studyTimeOfDay", value: v as OnboardingAnswers["studyTimeOfDay"] })
              }
              options={[
                { value: "morning", label: "Morning" },
                { value: "afternoon", label: "Afternoon" },
                { value: "evening", label: "Evening" },
                { value: "late", label: "Late night" },
              ]}
            />
          ) : null}

          {stepId === "priorExperience" ? (
            <ChoiceGrid
              columnsClass="grid-cols-1"
              value={a.priorExperience ?? ""}
              onChange={(v) =>
                dispatch({ type: "answer", key: "priorExperience", value: v as OnboardingAnswers["priorExperience"] })
              }
              options={[
                { value: "never", label: "Not really", hint: "This is my first serious try" },
                { value: "some", label: "A little", hint: "School or apps, on and off" },
                { value: "fluent_other", label: "Yes, I speak another language well", hint: "Building on that experience" },
              ]}
            />
          ) : null}

          {stepId === "learningStyle" ? (
            <MultiChoiceGrid
              values={a.learningStyle}
              onChange={(v) => dispatch({ type: "answer", key: "learningStyle", value: v })}
              options={[
                { value: "practice", label: "Practice & exercises" },
                { value: "visual", label: "Visual (images & videos)" },
                { value: "listening", label: "Listening" },
                { value: "reading_writing", label: "Reading & writing" },
                { value: "mixed", label: "Mixed" },
              ]}
            />
          ) : null}

          {stepId === "struggles" ? (
            <MultiChoiceGrid
              values={a.struggles}
              onChange={(v) => dispatch({ type: "answer", key: "struggles", value: v })}
              options={[
                { value: "too_old", label: "“I'm too old to learn a new language”" },
                { value: "takes_too_long", label: "“It takes too long to become fluent”" },
                { value: "failed_before", label: "“I've failed before, why would this be different?”" },
                { value: "distracted", label: "“I easily get distracted when learning”" },
              ]}
            />
          ) : null}

          {stepId === "bobHeard" ? (
            <ChoiceGrid
              columnsClass="grid-cols-2"
              value={a.bob ?? ""}
              onChange={(v) => dispatch({ type: "answer", key: "bob", value: v as OnboardingAnswers["bob"] })}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          ) : null}

          {stepId === "loading" ? <LoadingStep /> : null}

          {stepId === "email" ? (
            <TextInput
              autoFocus
              type="email"
              value={a.email}
              placeholder="you@example.com"
              onChange={(v) => dispatch({ type: "answer", key: "email", value: clampText(v, 120) })}
            />
          ) : null}
        </QuestionShell>
      </div>
    </div>
  );
}
