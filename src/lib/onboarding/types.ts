export type TargetLanguage =
  | "english"
  | "spanish"
  | "french"
  | "german"
  | "korean"
  | "japanese"
  | "italian"
  | "portuguese"
  | "chinese";

export type AgeBracket = "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";

export type LanguageLevel =
  | "elementary"
  | "beginner"
  | "pre_intermediate"
  | "upper_intermediate"
  | "advanced";

export type GoalId =
  | "speak_confidently"
  | "travel_easily"
  | "understand_movies_music"
  | "watch_movies"
  | "grow_career"
  | "pass_exam"
  | "learn_for_fun";

export type LearningStyleId = "practice" | "visual" | "listening" | "reading_writing" | "mixed";

export type StruggleId = "too_old" | "takes_too_long" | "failed_before" | "distracted";

export type BobAnswer = "yes" | "no";

export type OnboardingAnswers = {
  language: TargetLanguage | null;
  /** Picked from “Other languages” list; `language` stays null when this is set. */
  languageOther: string | null;
  age: AgeBracket | null;
  level: LanguageLevel | null;
  goals: GoalId[];
  learningStyle: LearningStyleId[];
  struggles: StruggleId[];
  bob: BobAnswer | null;
  email: string;
};

export type OnboardingStepId =
  | "language"
  | "age"
  | "level"
  | "summaryMap"
  | "goals"
  | "summaryLadder"
  | "learningStyle"
  | "struggles"
  | "summaryThanksA"
  | "bobHeard"
  | "summaryThanksB"
  | "loading"
  | "email";

/** Segments in the funnel progress bar (9 total, includes loading + email). */
export const FUNNEL_PROGRESS_TOTAL = 9;

export const stepOrder: OnboardingStepId[] = [
  "language",
  "age",
  "level",
  "summaryMap",
  "goals",
  "summaryLadder",
  "learningStyle",
  "struggles",
  "summaryThanksA",
  "bobHeard",
  "summaryThanksB",
  "loading",
  "email",
];

/** Interstitial screens (not real questions); back skips these to the prior question. */
export function isSummaryStep(stepId: OnboardingStepId): boolean {
  return (
    stepId === "summaryMap" ||
    stepId === "summaryLadder" ||
    stepId === "summaryThanksA" ||
    stepId === "summaryThanksB"
  );
}

/** Filled segment count for the step (1..FUNNEL_PROGRESS_TOTAL). Summaries share the prior question’s count. */
export function questionProgressForStep(stepId: OnboardingStepId): { current: number; total: number } {
  const total = FUNNEL_PROGRESS_TOTAL;
  switch (stepId) {
    case "language":
      return { current: 1, total };
    case "age":
      return { current: 2, total };
    case "level":
      return { current: 3, total };
    case "summaryMap":
      return { current: 3, total };
    case "goals":
      return { current: 4, total };
    case "summaryLadder":
      return { current: 4, total };
    case "learningStyle":
      return { current: 5, total };
    case "struggles":
      return { current: 6, total };
    case "summaryThanksA":
      return { current: 6, total };
    case "bobHeard":
      return { current: 7, total };
    case "summaryThanksB":
      return { current: 7, total };
    case "loading":
      return { current: 8, total };
    case "email":
      return { current: 9, total };
  }
}

export type OnboardingState = {
  stepIndex: number;
  answers: OnboardingAnswers;
};

export type OnboardingAction =
  | { type: "goTo"; stepIndex: number }
  | { type: "next" }
  | { type: "back" }
  | {
      type: "answer";
      key: keyof OnboardingAnswers;
      value: OnboardingAnswers[keyof OnboardingAnswers];
    }
  | {
      type: "answerAndNext";
      key: keyof OnboardingAnswers;
      value: OnboardingAnswers[keyof OnboardingAnswers];
    }
  | { type: "reset" };
