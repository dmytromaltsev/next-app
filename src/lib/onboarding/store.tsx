"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { OnboardingAction, OnboardingAnswers, OnboardingState } from "./types";
import { stepOrder } from "./types";

const TOTAL_STEPS = stepOrder.length;

const initialAnswers: OnboardingAnswers = {
  language: null,
  age: null,
  level: null,
  goals: [],
  dailyStudy: null,
  studyTimeOfDay: null,
  priorExperience: null,
  learningStyle: [],
  struggles: [],
  bob: null,
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
    case "back":
      return { ...state, stepIndex: clampStep(state.stepIndex - 1) };
    case "answer":
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.key]: action.value,
        },
      };
    case "answerAndNext":
      return {
        stepIndex: clampStep(state.stepIndex + 1),
        answers: {
          ...state.answers,
          [action.key]: action.value,
        },
      };
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
