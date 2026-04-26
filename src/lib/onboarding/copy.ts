import { OTHER_LANGUAGES } from "./otherLanguages";
import type {
  AgeBracket,
  BobAnswer,
  DailyTimeCommitmentId,
  GoalId,
  LanguageLevel,
  LearningMediumId,
  LearningStyleId,
  OnboardingAnswers,
  StruggleId,
  TargetLanguage,
} from "./types";

const OTHER_LABEL = Object.fromEntries(OTHER_LANGUAGES.map((o) => [o.value, o.label])) as Record<string, string>;

const LANGUAGE_LABEL: Record<TargetLanguage, string> = {
  english: "English",
  spanish: "Spanish",
  french: "French",
  german: "German",
  korean: "Korean",
  japanese: "Japanese",
  italian: "Italian",
  portuguese: "Portuguese",
  chinese: "Chinese",
};

export function languageLabel(lang: TargetLanguage | null): string {
  if (!lang) return "your chosen";
  return LANGUAGE_LABEL[lang];
}

/** Display name for personalization (grid language or “Other languages” pick). */
export function resolvedLanguageDisplay(a: Pick<OnboardingAnswers, "language" | "languageOther">): string {
  if (a.language) return LANGUAGE_LABEL[a.language];
  if (a.languageOther) return OTHER_LABEL[a.languageOther] ?? a.languageOther;
  return "your chosen";
}

const AGE_LABEL: Record<AgeBracket, string> = {
  "18-24": "18–24",
  "25-34": "25–34",
  "35-44": "35–44",
  "45-54": "45–54",
  "55-64": "55–64",
  "65+": "65+",
};

export function ageLabelForStats(age: AgeBracket | null): string {
  if (!age) return "your age group";
  return AGE_LABEL[age];
}

const LEVEL_LABEL: Record<LanguageLevel, string> = {
  elementary: "Elementary",
  beginner: "Beginner",
  pre_intermediate: "Pre-Intermediate",
  upper_intermediate: "Upper-Intermediate",
  advanced: "Advanced",
};

const LEVEL_ORDER: LanguageLevel[] = [
  "elementary",
  "beginner",
  "pre_intermediate",
  "upper_intermediate",
  "advanced",
];

const AGE_ORDER: AgeBracket[] = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

const LANG_ORDER: TargetLanguage[] = [
  "english",
  "spanish",
  "french",
  "german",
  "korean",
  "japanese",
  "italian",
  "portuguese",
  "chinese",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Base headline count; swings meaningfully with age, level, and learning language (deterministic). */
export function learnerCountForSummary(
  age: AgeBracket | null,
  level: LanguageLevel | null,
  language: TargetLanguage | null,
  languageOther: string | null,
): number {
  const base = 176_372;
  let agePart = 0;
  if (age) {
    const idx = Math.max(0, AGE_ORDER.indexOf(age));
    agePart = 7_200 + idx * 2_911 + (idx * 401) % 11_400 + (idx ** 2 * 97) % 3_300;
  }
  let levelPart = 0;
  if (level) {
    const li = Math.max(0, LEVEL_ORDER.indexOf(level));
    levelPart = 5_800 + li * 2_503 + (li * 617) % 9_800 + (li ** 2 * 83) % 4_100;
  }
  let langPart = 0;
  if (language) {
    const gi = Math.max(0, LANG_ORDER.indexOf(language));
    langPart = 3_100 + gi * 3_337 + (gi * 509) % 10_200 + (gi * gi * 41) % 2_700;
  } else if (languageOther) {
    const h = hashString(languageOther);
    langPart = 2_400 + (h % 14_800) + (h % 997) * 3;
  }
  return base + agePart + levelPart + langPart;
}

/** Lowercase level label for first-summary copy (e.g. "beginner", "pre-intermediate"). */
export function languageLevelHeadlineLower(level: LanguageLevel | null): string {
  if (!level) return "";
  return languageLevelLabel(level).toLowerCase();
}

/** "a" / "an" before a lowercase level phrase (e.g. "an upper-intermediate", "a beginner"). */
export function indefiniteArticleForWord(word: string): "a" | "an" {
  const w = word.trim().toLowerCase();
  if (!w) return "a";
  return /^[aeiou]/.test(w) ? "an" : "a";
}

export function languageLevelLabel(level: LanguageLevel | null): string {
  if (!level) return "-";
  return LEVEL_LABEL[level];
}

const GOAL_ANSWER_LABEL: Record<GoalId, string> = {
  speak_confidently: "Speak confidently",
  become_fluent: "Become fluent",
  travel_easily: "Travel easily",
  watch_movies: "Watch movies",
  enjoy_music: "Enjoy music",
  understand_culture: "Understand culture",
  grow_career: "Grow career",
  pass_exams: "Pass exams",
};

const STRUGGLE_ANSWER_LABEL: Record<StruggleId, string> = {
  takes_too_long: "It takes too long to become fluent",
  forget_what_i_learn: "I forget what I learn",
  afraid_to_speak_mistakes: "I'm afraid to speak and make mistakes",
  not_enough_time: "I don't have enough time",
  boring_or_distracted: "It's boring or I get distracted",
  none_believe_can_do_it: "None of these — I believe I can do it!",
};

const MEDIUM_ANSWER_LABEL: Record<LearningMediumId, string> = {
  practice_exercises: "Practice exercises",
  images_videos: "Images & Videos",
  listening: "Listening",
  reading_writing: "Reading & Writing",
};

const LEARNING_STYLE_ANSWER_LABEL: Record<LearningStyleId, string> = {
  struggle_a_lot: "I struggle a lot",
  could_be_better: "Could be better",
  pretty_confident: "Pretty confident",
};

const BOB_ANSWER_LABEL: Record<BobAnswer, string> = {
  yes: "Yes",
  no: "No",
};

const DAILY_TIME_ANSWER_LABEL: Record<DailyTimeCommitmentId, string> = {
  up_to_5_mins: "up to 5 mins",
  "5_to_15_mins": "5–15 mins",
  more_than_15_mins: "more than 15 mins",
};

function joinAnswerLabels<T extends string>(ids: readonly T[], map: Record<T, string>): string {
  if (ids.length === 0) return "-";
  return ids.map((id) => map[id] ?? id).join(", ");
}

/** Plain-text Telegram body: question copy matches the funnel; answers are human-readable labels. */
export function formatTelegramSubmissionText(a: OnboardingAnswers): string {
  const lang = resolvedLanguageDisplay(a);
  const ageLine = a.age !== null ? AGE_LABEL[a.age] : "-";
  const lines = [
    "🌍 New language funnel submission",
    "",
    `1. What language would you like to learn?: ${lang}`,
    `2. What is your age?: ${ageLine}`,
    `3. What's your ${lang} level?: ${languageLevelLabel(a.level)}`,
    `4. What are your language goals?: ${joinAnswerLabels(a.goals, GOAL_ANSWER_LABEL)}`,
    `5. How do you feel about your learning skills?: ${
      a.learningStyle !== null ? LEARNING_STYLE_ANSWER_LABEL[a.learningStyle] : "-"
    }`,
    `6. Do any of these sound familiar?: ${joinAnswerLabels(a.struggles, STRUGGLE_ANSWER_LABEL)}`,
    `7. Did you hear about our AI Tutor from a language professional?: ${
      a.bob !== null ? BOB_ANSWER_LABEL[a.bob] : "-"
    }`,
    `8. What is your learning style?: ${joinAnswerLabels(a.learningMediums, MEDIUM_ANSWER_LABEL)}`,
    `9. How much time can you spend learning daily?: ${
      a.dailyTimeCommitment !== null ? DAILY_TIME_ANSWER_LABEL[a.dailyTimeCommitment] : "-"
    }`,
    `10. Enter your email to get your personalized Language Learning Plan: ${a.email.trim() || "-"}`,
  ];
  return lines.join("\n");
}
