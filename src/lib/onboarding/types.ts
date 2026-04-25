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

export type LanguageLevel = "beginner" | "elementary" | "intermediate" | "advanced" | "fluent";

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

export type DailyStudy = "5" | "10" | "15" | "20plus";

export type StudyTimeOfDay = "morning" | "afternoon" | "evening" | "late";

export type PriorExperience = "never" | "some" | "fluent_other";

export type BobAnswer = "yes" | "no";

export type OnboardingAnswers = {
  language: TargetLanguage | null;
  /** Picked from “Other languages” list; `language` stays null when this is set. */
  languageOther: string | null;
  age: AgeBracket | null;
  level: LanguageLevel | null;
  goals: GoalId[];
  dailyStudy: DailyStudy | null;
  studyTimeOfDay: StudyTimeOfDay | null;
  priorExperience: PriorExperience | null;
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
  | "dailyStudy"
  | "studyTimeOfDay"
  | "priorExperience"
  | "learningStyle"
  | "struggles"
  | "summaryThanksA"
  | "bobHeard"
  | "summaryThanksB"
  | "loading"
  | "email";

/**
 * Ten question-only steps for segmented progress (n filled of 10).
 */
export const QUESTION_STEP_IDS: OnboardingStepId[] = [
  "language",
  "age",
  "level",
  "goals",
  "dailyStudy",
  "studyTimeOfDay",
  "priorExperience",
  "learningStyle",
  "struggles",
  "bobHeard",
];

export const TOTAL_QUESTIONS = QUESTION_STEP_IDS.length;

export const stepOrder: OnboardingStepId[] = [
  "language",
  "age",
  "level",
  "summaryMap",
  "goals",
  "summaryLadder",
  "dailyStudy",
  "studyTimeOfDay",
  "priorExperience",
  "learningStyle",
  "struggles",
  "summaryThanksA",
  "bobHeard",
  "summaryThanksB",
  "loading",
  "email",
];

export function questionProgressForStep(stepId: OnboardingStepId): { current: number; total: number } | null {
  const idx = QUESTION_STEP_IDS.indexOf(stepId);
  if (idx < 0) return null;
  return { current: idx + 1, total: TOTAL_QUESTIONS };
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
