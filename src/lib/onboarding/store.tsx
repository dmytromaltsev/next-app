"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { OnboardingAction, OnboardingAnswers, OnboardingState, OnboardingStepId } from "./types";
import { isSummaryStep, stepOrder } from "./types";

/** After back, clear the step you land on if it uses single-tap choice (so nothing stays pre-selected). */
function answersAfterLandingOnStep(answers: OnboardingAnswers, stepId: OnboardingStepId): OnboardingAnswers {
  switch (stepId) {
    case "language":
      return { ...answers, language: null, languageOther: null };
    case "age":
      return { ...answers, age: null };
    case "level":
      return { ...answers, level: null };
    case "learningStyle":
      return { ...answers, learningStyle: null };
    case "bobHeard":
      return { ...answers, bob: null };
    default:
      return answers;
  }
}

const TOTAL_STEPS = stepOrder.length;

const initialAnswers: OnboardingAnswers = {
  language: null,
  languageOther: null,
  age: null,
  level: null,
  goals: [],
  learningStyle: null,
  learningMediums: [],
  struggles: [],
  bob: null,
  dailyTimeCommitment: null,
  email: "",
};

const initialState: OnboardingState = {
  stepIndex: 0,
  answers: initialAnswers,
};

function clampStep(stepIndex: number) {
  return Math.max(0, Math.min(TOTAL_STEPS - 1, stepIndex));
}

function reducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "goTo":
      return { ...state, stepIndex: clampStep(action.stepIndex) };
    case "next":
      return { ...state, stepIndex: clampStep(state.stepIndex + 1) };
    case "back": {
      if (state.stepIndex <= 0) return { ...state, stepIndex: 0 };
      let i = state.stepIndex - 1;
      while (i >= 0 && isSummaryStep(stepOrder[i]!)) i -= 1;
      const newIndex = clampStep(Math.max(0, i));
      const landedOn = stepOrder[newIndex]!;
      const answers = answersAfterLandingOnStep(state.answers, landedOn);
      return { ...state, stepIndex: newIndex, answers };
    }
    case "answer": {
      if (action.key === "languageOther") {
        const v = action.value as string | null;
        return {
          ...state,
          answers: {
            ...state.answers,
            languageOther: v,
            language: v ? null : state.answers.language,
          },
        };
      }
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.key]: action.value,
        },
      };
    }
    case "answerAndNext": {
      const nextAnswers = {
        ...state.answers,
        [action.key]: action.value,
      } as OnboardingAnswers;
      if (action.key === "language") {
        nextAnswers.languageOther = null;
      }
      return {
        stepIndex: clampStep(state.stepIndex + 1),
        answers: nextAnswers,
      };
    }
    case "reset":
      return initialState;
    default:
      return state;
  }
}

type OnboardingContextValue = {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  totalSteps: number;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo<OnboardingContextValue>(
    () => ({ state, dispatch, totalSteps: TOTAL_STEPS }),
    [state],
  );
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
