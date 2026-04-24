export type OnboardingAnswers = {
  fullName: string;
  role: "founder" | "marketer" | "designer" | "developer" | "other";
  goal: "launch" | "grow" | "convert" | "retain" | "other";
  timeframe: "7d" | "30d" | "90d" | "flexible";
  experience: "new" | "some" | "pro";
  audience: string;
  budget: "0" | "low" | "mid" | "high";
  brandTone: "bold" | "friendly" | "minimal" | "playful";
  primaryChannel: "seo" | "ads" | "social" | "email" | "other";
  biggestChallenge: string;
  email: string;
};

export type OnboardingStepId =
  | "fullName"
  | "role"
  | "goal"
  | "timeframe"
  | "experience"
  | "audience"
  | "budget"
  | "brandTone"
  | "primaryChannel"
  | "biggestChallenge"
  | "email"
  | "success";

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
  | { type: "reset" };

