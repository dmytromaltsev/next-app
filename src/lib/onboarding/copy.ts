import { OTHER_LANGUAGES } from "./otherLanguages";
import type { AgeBracket, OnboardingAnswers, TargetLanguage } from "./types";

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
