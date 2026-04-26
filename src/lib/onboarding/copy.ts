import { OTHER_LANGUAGES } from "./otherLanguages";
import type { AgeBracket, LanguageLevel, OnboardingAnswers, TargetLanguage } from "./types";

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
