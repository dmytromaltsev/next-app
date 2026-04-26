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
  | "become_fluent"
  | "travel_easily"
  | "watch_movies"
  | "enjoy_music"
  | "understand_culture"
  | "grow_career"
  | "pass_exams";

export type LearningStyleId = "struggle_a_lot" | "could_be_better" | "pretty_confident";

/** Multiselect: preferred ways to learn (post-summary, before loading). */
export type LearningMediumId =
  | "practice_exercises"
  | "images_videos"
  | "listening"
  | "reading_writing";

export type StruggleId =
  | "takes_too_long"
  | "forget_what_i_learn"
  | "afraid_to_speak_mistakes"
  | "not_enough_time"
  | "boring_or_distracted"
  | "none_believe_can_do_it";

export type BobAnswer = "yes" | "no";

/** Daily study time (loader pop-up at ~51%). */
export type DailyTimeCommitmentId = "up_to_5_mins" | "5_to_15_mins" | "more_than_15_mins";

export type OnboardingAnswers = {
  language: TargetLanguage | null;
  /** Picked from “Other languages” list; `language` stays null when this is set. */
  languageOther: string | null;
  age: AgeBracket | null;
  level: LanguageLevel | null;
  goals: GoalId[];
  learningStyle: LearningStyleId | null;
  learningMediums: LearningMediumId[];
  struggles: StruggleId[];
  bob: BobAnswer | null;
  /** Set during loading step modal (~51% progress). */
  dailyTimeCommitment: DailyTimeCommitmentId | null;
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
  | "summaryStruggle"
  | "bobHeard"
  | "summaryAiTutor"
  | "summaryExpertsScience"
  | "learningMediums"
  | "loading"
  | "email"
  | "thankYouNav";

/** Segments in the funnel progress bar (10 total). Summaries share the prior question’s segment count. */
export const FUNNEL_PROGRESS_TOTAL = 10;

export const stepOrder: OnboardingStepId[] = [
  "language",
  "age",
  "level",
  "summaryMap",
  "goals",
  "summaryLadder",
  "learningStyle",
  "struggles",
  "summaryStruggle",
  "bobHeard",
  "summaryAiTutor",
  "summaryExpertsScience",
  "learningMediums",
  "loading",
  "email",
  "thankYouNav",
];

/** Interstitial screens (not real questions); back skips these to the prior question. */
export function isSummaryStep(stepId: OnboardingStepId): boolean {
  return (
    stepId === "summaryMap" ||
    stepId === "summaryLadder" ||
    stepId === "summaryStruggle" ||
    stepId === "summaryAiTutor" ||
    stepId === "summaryExpertsScience" ||
    stepId === "thankYouNav"
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
    case "summaryStruggle":
      return { current: 6, total };
    case "bobHeard":
      return { current: 7, total };
    case "summaryAiTutor":
      return { current: 7, total };
    case "summaryExpertsScience":
      return { current: 7, total };
    case "learningMediums":
      return { current: 8, total };
    case "loading":
      return { current: 9, total };
    case "email":
    case "thankYouNav":
      return { current: 10, total };
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
