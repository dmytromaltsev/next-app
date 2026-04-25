"use client";

import { motion } from "framer-motion";
import { Inter } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LadderIllustration, WorldMapIllustration } from "@/components/FunnelArt";
import { FunnelHeader } from "@/components/FunnelHeader";
import {
  ChoiceGrid,
  LanguageChoiceGrid,
  MultiChoiceGrid,
  PrimaryButton,
  TextInput,
} from "@/components/controls";
import { QuestionShell } from "@/components/QuestionShell";
import { SegmentedProgressBar } from "@/components/SegmentedProgressBar";
import { ageLabelForStats, languageLabel } from "@/lib/onboarding/copy";
import { useOnboarding } from "@/lib/onboarding/store";
import {
  questionProgressForStep,
  stepOrder,
  type OnboardingAnswers,
  type OnboardingStepId,
} from "@/lib/onboarding/types";

const quizSans = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
  { value: "brazilian", label: "Portuguese (Brazil)", flag: "🇧🇷" },
];

function headerTitle(stepId: OnboardingStepId): string {
  if (stepId === "goals" || stepId === "learningStyle" || stepId === "struggles") return "Your plan";
  return "My profile";
}

function isSummaryStep(stepId: OnboardingStepId) {
  return (
    stepId === "summaryMap" ||
    stepId === "summaryLadder" ||
    stepId === "summaryThanksA" ||
    stepId === "summaryThanksB"
  );
}

function isMultiSelectStep(stepId: OnboardingStepId) {
  return stepId === "goals" || stepId === "learningStyle" || stepId === "struggles";
}

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
      <p className="text-center text-sm text-funnel-muted">Preparing your personalized plan…</p>
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-2.5 overflow-hidden rounded-full bg-funnel-track">
            <motion.div
              className="h-full rounded-full bg-funnel-bar"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: i * 0.32, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        ))}
      </div>
      <div className="space-y-4 border-t border-funnel-border pt-6">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-funnel-muted">Learners like you</p>
        {REVIEWS.map((r) => (
          <blockquote
            key={r.name}
            className="rounded-xl border border-funnel-border bg-funnel-selected/50 px-4 py-3 text-left text-sm text-funnel-ink"
          >
            <p className="leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
            <footer className="mt-2 text-xs font-semibold text-funnel-muted">{r.name}</footer>
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
  const summary = isSummaryStep(stepId);
  const multi = isMultiSelectStep(stepId);

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
      case "summaryThanksB":
        return "Thanks for sharing!";
      case "bobHeard":
        return "Did you hear about Bob from mentor or coach?";
      case "loading":
        return "Building your plan";
      case "email":
        return "Where should we send your plan?";
      default:
        return "";
    }
  };

  const subtitleForStep = (): ReactNode => {
    switch (stepId) {
      case "age":
        return "We only use age to personalize your plan.";
      case "goals":
      case "learningStyle":
      case "struggles":
        return "Select all that apply.";
      case "summaryMap":
        return (
          <p className="text-base leading-relaxed">
            <span className="text-funnel-muted">176,372 people aged </span>
            <strong className="font-bold text-funnel-accent">{ageLabelForStats(a.age)}</strong>
            <span className="text-funnel-muted"> are already improving their </span>
            <strong className="font-bold text-funnel-accent">{languageLabel(a.language)}</strong>
            <span className="text-funnel-muted">
              {" "}
              skills with us—but this journey is <strong className="font-bold text-funnel-accent">all about you</strong>.
            </span>
          </p>
        );
      case "summaryLadder":
        return (
          <p className="text-base leading-relaxed">
            <span className="text-funnel-muted">Science shows that </span>
            <strong className="font-bold text-funnel-accent">setting clear goals</strong>
            <span className="text-funnel-muted"> makes you </span>
            <strong className="font-bold text-funnel-accent">3× more likely</strong>
            <span className="text-funnel-muted"> to meet them. Give yourself a mini high five.</span>
          </p>
        );
      case "summaryThanksA":
      case "summaryThanksB":
        return (
          <p className="text-base leading-relaxed">
            <span className="text-funnel-muted">Our program is developed by </span>
            <strong className="font-bold text-funnel-accent">professionals</strong>
            <span className="text-funnel-muted"> to match how you learn best.</span>
          </p>
        );
      case "email":
        return "We’ll email your next steps—no spam.";
      default:
        return undefined;
    }
  };

  const showProgress = progress !== null;
  const primaryCta = multi ? "Next step" : "Continue";

  if (emailSent) {
    return (
      <div className={`${quizSans.className} flex min-h-dvh flex-col bg-funnel-canvas text-funnel-ink`}>
        <FunnelHeader title="My profile" onBack={() => {}} backDisabled />
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
        backDisabled={state.stepIndex === 0}
      />

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-36 pt-5">
        {showProgress && progress ? (
          <div className="mb-6">
            <SegmentedProgressBar value={progress.current} max={progress.total} />
          </div>
        ) : null}

        <QuestionShell
          stepKey={stepId}
          align={summary || multi ? "center" : "start"}
          title={titleForStep()}
          subtitle={subtitleForStep()}
          footer={
            stepId === "loading" ? (
              <p className="text-center text-xs text-funnel-muted">This only takes a few seconds…</p>
            ) : undefined
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
              value={a.age ?? ""}
              onChange={(v) => dispatch({ type: "answer", key: "age", value: v as OnboardingAnswers["age"] })}
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

      {stepId !== "loading" ? (
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-funnel-border bg-funnel-surface pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_24px_rgba(17,24,39,0.06)]">
          <div className="mx-auto w-full max-w-lg px-4">
            {hint ? <p className="mb-2 text-center text-xs text-funnel-muted">{hint}</p> : null}
            {submitState === "error" ? (
              <p className="mb-2 text-center text-xs text-red-600">{submitError || "Something went wrong."}</p>
            ) : null}
            <PrimaryButton
              onClick={handleContinue}
              disabled={nextDisabled || submitState === "submitting"}
              className="w-full"
            >
              {submitState === "submitting" && stepId === "email" ? "Sending…" : primaryCta}
            </PrimaryButton>
            {!summary && stepId !== "email" ? (
              <p className="mt-3 text-center text-[11px] leading-relaxed text-funnel-muted">
                By continuing you agree to our{" "}
                <a href="#" className="font-semibold text-funnel-ink underline underline-offset-2">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a href="#" className="font-semibold text-funnel-ink underline underline-offset-2">
                  Privacy Policy
                </a>
                .
              </p>
            ) : null}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
