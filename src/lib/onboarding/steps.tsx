"use client";

import type React from "react";
import type { OnboardingAnswers, OnboardingStepId } from "./types";

export type StepDefinition = {
  id: OnboardingStepId;
  isProgressStep: boolean;
  title: (a: OnboardingAnswers) => React.ReactNode;
  subtitle?: (a: OnboardingAnswers) => React.ReactNode;
};

export const stepOrder: OnboardingStepId[] = [
  "fullName",
  "role",
  "goal",
  "timeframe",
  "experience",
  "audience",
  "budget",
  "brandTone",
  "primaryChannel",
  "biggestChallenge",
  "email",
  "success",
];

export const stepsMeta: Record<OnboardingStepId, StepDefinition> = {
  fullName: {
    id: "fullName",
    isProgressStep: true,
    title: () => "First—what should we call you?",
    subtitle: () => "This helps us personalize the rest in a way that feels human, not “form-y”.",
  },
  role: {
    id: "role",
    isProgressStep: true,
    title: (a) => (a.fullName ? `Nice to meet you, ${a.fullName}. What’s your role?` : "What’s your role?"),
    subtitle: () => "Pick the closest match—we’ll adapt the language accordingly.",
  },
  goal: {
    id: "goal",
    isProgressStep: true,
    title: (a) => (a.role === "founder" ? "What’s the #1 outcome you want next?" : "What’s the #1 outcome you want?"),
    subtitle: (a) => (a.fullName ? `We’ll tailor suggestions to you, ${a.fullName}.` : "We’ll tailor suggestions to you."),
  },
  timeframe: {
    id: "timeframe",
    isProgressStep: true,
    title: () => "What’s your timeline?",
    subtitle: () => "This helps calibrate effort vs. impact.",
  },
  experience: {
    id: "experience",
    isProgressStep: true,
    title: (a) => (a.fullName ? `How experienced are you, ${a.fullName}?` : "How experienced are you?"),
    subtitle: () => "No judgment—this just sets the difficulty level.",
  },
  audience: {
    id: "audience",
    isProgressStep: true,
    title: (a) => `Who is this for${a.fullName ? `, ${a.fullName}` : ""}?`,
    subtitle: () => "Describe your audience in one sentence. The more specific, the better.",
  },
  budget: {
    id: "budget",
    isProgressStep: true,
    title: (a) => (a.goal === "launch" ? "Any budget for the launch?" : "Any budget for growth?"),
    subtitle: () => "We’ll suggest tactics that fit your constraints.",
  },
  brandTone: {
    id: "brandTone",
    isProgressStep: true,
    title: (a) => (a.audience ? `What tone resonates with ${a.audience}?` : "What brand tone fits best?"),
    subtitle: () => "You can change this later—this is just a starting point.",
  },
  primaryChannel: {
    id: "primaryChannel",
    isProgressStep: true,
    title: (a) =>
      a.goal === "convert"
        ? "Where do you want conversions to come from?"
        : "What’s your primary channel?",
    subtitle: () => "This will shape the plan we generate.",
  },
  biggestChallenge: {
    id: "biggestChallenge",
    isProgressStep: true,
    title: (a) =>
      a.fullName ? `What’s the biggest thing in your way right now, ${a.fullName}?` : "What’s your biggest challenge right now?",
    subtitle: (a) =>
      a.primaryChannel === "seo"
        ? "Ex: content ideas, technical SEO, backlinks, or “we don’t rank”."
        : "Be blunt—we’ll use this to prioritize.",
  },
  email: {
    id: "email",
    isProgressStep: true,
    title: (a) => (a.fullName ? `${a.fullName}, want your personalized plan?` : "Want your personalized plan?"),
    subtitle: (a) =>
      a.goal === "grow"
        ? "We’ll email a 7-day “momentum” plan + a 3-move checklist tailored to your answers."
        : "We’ll email a concise plan tailored to your answers—no spam.",
  },
  success: {
    id: "success",
    isProgressStep: false,
    title: (a) => (a.fullName ? `You’re all set, ${a.fullName}.` : "You’re all set."),
    subtitle: () => "Thanks—your plan is on its way.",
  },
};

