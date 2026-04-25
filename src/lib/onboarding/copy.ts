import type { AgeBracket, TargetLanguage } from "./types";

const LANGUAGE_LABEL: Record<TargetLanguage, string> = {
  english: "English",
  spanish: "Spanish",
  french: "French",
  german: "German",
  korean: "Korean",
  japanese: "Japanese",
  italian: "Italian",
  portuguese: "Portuguese",
  brazilian: "Portuguese (Brazil)",
};

export function languageLabel(lang: TargetLanguage | null): string {
  if (!lang) return "your chosen";
  return LANGUAGE_LABEL[lang];
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
