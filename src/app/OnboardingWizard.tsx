"use client";

import { useMemo } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionShell } from "@/components/QuestionShell";
import { ChoiceGrid, PrimaryButton, SecondaryButton, TextInput } from "@/components/controls";
import { useOnboarding } from "@/lib/onboarding/store";
import { stepOrder, stepsMeta } from "@/lib/onboarding/steps";
import type { OnboardingAnswers, OnboardingStepId } from "@/lib/onboarding/types";

function progressInfo(stepId: OnboardingStepId) {
  const progressStepIds = stepOrder.filter((id) => stepsMeta[id].isProgressStep);
  const idx = progressStepIds.indexOf(stepId);
  return { current: Math.max(0, idx + 1), total: progressStepIds.length };
}

function clampText(s: string, maxLen: number) {
  const t = s.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

function canProceed(stepId: OnboardingStepId, a: OnboardingAnswers) {
  switch (stepId) {
    case "fullName":
      return a.fullName.trim().length >= 2;
    case "audience":
      return a.audience.trim().length >= 6;
    case "biggestChallenge":
      return a.biggestChallenge.trim().length >= 6;
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim());
    default:
      return true;
  }
}

function validationHint(stepId: OnboardingStepId, a: OnboardingAnswers) {
  switch (stepId) {
    case "fullName":
      return "Type at least 2 characters to continue.";
    case "audience":
      return "Add a bit more detail (at least 6 characters).";
    case "biggestChallenge":
      return "Add a short sentence (at least 6 characters).";
    case "email":
      return "Enter a valid email (e.g. you@company.com).";
    default:
      return null;
  }
}

export function OnboardingWizard() {
  const { state, dispatch } = useOnboarding();
  const stepId = stepOrder[state.stepIndex] ?? "fullName";
  const meta = stepsMeta[stepId];
  const progress = useMemo(() => progressInfo(stepId), [stepId]);
  const a = state.answers;

  const nextDisabled = !canProceed(stepId, a) || stepId === "success";
  const hint = nextDisabled ? validationHint(stepId, a) : null;

  return (
    <div className="flex min-h-dvh w-full flex-1 bg-zinc-50 px-4 py-6 dark:bg-black sm:items-center sm:justify-center sm:px-5 sm:py-10">
      <div className="flex w-full flex-1 max-w-2xl flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-none sm:rounded-3xl sm:p-10">
        {meta.isProgressStep ? (
          <div className="mb-8 flex items-center gap-4">
            <div className="flex-1">
              <ProgressBar value={progress.current} max={progress.total} />
            </div>
            <div className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
              {progress.current}/{progress.total}
            </div>
          </div>
        ) : null}

        <QuestionShell
          stepKey={stepId}
          title={meta.title(a)}
          subtitle={meta.subtitle ? meta.subtitle(a) : undefined}
          footer={
            <div className="space-y-2">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SecondaryButton
                  onClick={() => dispatch({ type: "back" })}
                  disabled={state.stepIndex === 0}
                  className="w-full sm:w-auto"
                >
                  Back
                </SecondaryButton>
                {stepId !== "success" ? (
                  <PrimaryButton
                    onClick={() => dispatch({ type: "next" })}
                    disabled={nextDisabled}
                    className="w-full sm:w-auto"
                  >
                    Continue
                  </PrimaryButton>
                ) : (
                  <PrimaryButton onClick={() => dispatch({ type: "reset" })} className="w-full sm:w-auto">
                    Start over
                  </PrimaryButton>
                )}
              </div>
              {hint ? (
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</div>
              ) : null}
            </div>
          }
        >
          {stepId === "fullName" ? (
            <TextInput
              autoFocus
              value={a.fullName}
              placeholder="e.g. Dmytro"
              onChange={(v) => dispatch({ type: "answer", key: "fullName", value: clampText(v, 40) })}
            />
          ) : null}

          {stepId === "role" ? (
            <ChoiceGrid
              value={a.role}
              onChange={(v) => dispatch({ type: "answer", key: "role", value: v as OnboardingAnswers["role"] })}
              options={[
                { value: "founder", label: "Founder", hint: "Building / shipping / owning outcomes" },
                { value: "marketer", label: "Marketer", hint: "Distribution, funnels, growth" },
                { value: "designer", label: "Designer", hint: "Brand, UX, UI, systems" },
                { value: "developer", label: "Developer", hint: "Engineering-led product work" },
                { value: "other", label: "Other", hint: "Closest match is fine" },
              ]}
            />
          ) : null}

          {stepId === "goal" ? (
            <ChoiceGrid
              value={a.goal}
              onChange={(v) => dispatch({ type: "answer", key: "goal", value: v as OnboardingAnswers["goal"] })}
              options={[
                { value: "launch", label: "Launch", hint: "Get something live and credible" },
                { value: "grow", label: "Grow", hint: "More reach, more traffic, more users" },
                { value: "convert", label: "Convert", hint: "Turn visitors into customers" },
                { value: "retain", label: "Retain", hint: "Keep users engaged and coming back" },
                { value: "other", label: "Other", hint: "We’ll adapt" },
              ]}
            />
          ) : null}

          {stepId === "timeframe" ? (
            <ChoiceGrid
              value={a.timeframe}
              onChange={(v) =>
                dispatch({ type: "answer", key: "timeframe", value: v as OnboardingAnswers["timeframe"] })
              }
              options={[
                { value: "7d", label: "7 days", hint: "Quick wins only" },
                { value: "30d", label: "30 days", hint: "Balanced plan" },
                { value: "90d", label: "90 days", hint: "Compounding work" },
                { value: "flexible", label: "Flexible", hint: "We’ll optimize for leverage" },
              ]}
            />
          ) : null}

          {stepId === "experience" ? (
            <ChoiceGrid
              value={a.experience}
              onChange={(v) =>
                dispatch({ type: "answer", key: "experience", value: v as OnboardingAnswers["experience"] })
              }
              options={[
                { value: "new", label: "New", hint: "Explain it simply" },
                { value: "some", label: "Some experience", hint: "I can execute with guidance" },
                { value: "pro", label: "Pro", hint: "Give me the sharp version" },
              ]}
            />
          ) : null}

          {stepId === "audience" ? (
            <TextInput
              autoFocus
              value={a.audience}
              placeholder="e.g. busy startup founders who need a landing page fast"
              onChange={(v) => dispatch({ type: "answer", key: "audience", value: clampText(v, 120) })}
            />
          ) : null}

          {stepId === "budget" ? (
            <ChoiceGrid
              value={a.budget}
              onChange={(v) => dispatch({ type: "answer", key: "budget", value: v as OnboardingAnswers["budget"] })}
              options={[
                { value: "0", label: "$0", hint: "Bootstrapped" },
                { value: "low", label: "Low", hint: "$1–$500/mo" },
                { value: "mid", label: "Mid", hint: "$500–$3k/mo" },
                { value: "high", label: "High", hint: "$3k+/mo" },
              ]}
            />
          ) : null}

          {stepId === "brandTone" ? (
            <ChoiceGrid
              value={a.brandTone}
              onChange={(v) =>
                dispatch({ type: "answer", key: "brandTone", value: v as OnboardingAnswers["brandTone"] })
              }
              options={[
                { value: "bold", label: "Bold", hint: "Direct, confident, punchy" },
                { value: "friendly", label: "Friendly", hint: "Warm, helpful, human" },
                { value: "minimal", label: "Minimal", hint: "Calm, clean, to the point" },
                { value: "playful", label: "Playful", hint: "Light, fun, surprising" },
              ]}
            />
          ) : null}

          {stepId === "primaryChannel" ? (
            <ChoiceGrid
              value={a.primaryChannel}
              onChange={(v) =>
                dispatch({
                  type: "answer",
                  key: "primaryChannel",
                  value: v as OnboardingAnswers["primaryChannel"],
                })
              }
              options={[
                { value: "seo", label: "SEO", hint: "Search-driven growth" },
                { value: "ads", label: "Ads", hint: "Paid acquisition" },
                { value: "social", label: "Social", hint: "Content + distribution" },
                { value: "email", label: "Email", hint: "Lifecycle + newsletter" },
                { value: "other", label: "Other", hint: "We’ll adapt" },
              ]}
            />
          ) : null}

          {stepId === "biggestChallenge" ? (
            <TextInput
              autoFocus
              value={a.biggestChallenge}
              placeholder="e.g. We don’t know what to say on the homepage"
              onChange={(v) =>
                dispatch({ type: "answer", key: "biggestChallenge", value: clampText(v, 160) })
              }
            />
          ) : null}

          {stepId === "email" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">Unlocked: your tailored plan</div>
                <div className="mt-1">
                  Based on: <span className="font-medium">{a.goal}</span> ·{" "}
                  <span className="font-medium">{a.primaryChannel}</span> ·{" "}
                  <span className="font-medium">{a.timeframe}</span>
                  {a.audience ? (
                    <>
                      {" "}
                      · <span className="font-medium">{clampText(a.audience, 42)}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <TextInput
                autoFocus
                type="email"
                value={a.email}
                placeholder="you@company.com"
                onChange={(v) => dispatch({ type: "answer", key: "email", value: clampText(v, 120) })}
              />
              <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                No spam. One email with your plan + a copy you can tweak.
              </p>
            </div>
          ) : null}

          {stepId === "success" ? (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
              <div className="text-base font-medium text-zinc-950 dark:text-zinc-50">
                Next steps (we’ll keep this simple)
              </div>
              <ol className="mt-3 list-decimal space-y-2 pl-5">
                <li>
                  Check your inbox{a.email ? ` (${a.email})` : ""} for your plan.
                </li>
                <li>
                  We’ll prioritize your biggest blocker:{" "}
                  <span className="font-medium">{a.biggestChallenge || "—"}</span>
                </li>
                <li>
                  If you want, run the flow again with a different goal to compare strategies.
                </li>
              </ol>
            </div>
          ) : null}
        </QuestionShell>
      </div>
    </div>
  );
}

