import { NextResponse } from "next/server";
import { formatTelegramSubmissionText } from "@/lib/onboarding/copy";
import type {
  DailyTimeCommitmentId,
  LearningMediumId,
  LearningStyleId,
  OnboardingAnswers,
} from "@/lib/onboarding/types";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const token = requiredEnv("TELEGRAM_BOT_TOKEN");
    const chatId = requiredEnv("TELEGRAM_CHAT_ID");

    const body = (await req.json().catch(() => null)) as { answers?: Partial<OnboardingAnswers> } | null;
    if (!body?.answers) {
      return NextResponse.json({ ok: false, error: "Missing answers" }, { status: 400 });
    }

    const b = body.answers;
    const answers: OnboardingAnswers = {
      language: (b.language ?? null) as OnboardingAnswers["language"],
      languageOther: typeof b.languageOther === "string" ? b.languageOther : null,
      age: (b.age ?? null) as OnboardingAnswers["age"],
      level: (b.level ?? null) as OnboardingAnswers["level"],
      goals: Array.isArray(b.goals) ? (b.goals as OnboardingAnswers["goals"]) : [],
      learningStyle: (() => {
        const ls = b.learningStyle;
        if (typeof ls === "string") return ls as LearningStyleId;
        if (Array.isArray(ls) && ls[0]) return ls[0] as LearningStyleId;
        return null;
      })(),
      learningMediums: Array.isArray(b.learningMediums)
        ? (b.learningMediums as LearningMediumId[])
        : [],
      struggles: Array.isArray(b.struggles) ? (b.struggles as OnboardingAnswers["struggles"]) : [],
      bob: (b.bob ?? null) as OnboardingAnswers["bob"],
      dailyTimeCommitment: (() => {
        const d = b.dailyTimeCommitment;
        if (d === "up_to_5_mins" || d === "5_to_15_mins" || d === "more_than_15_mins") return d as DailyTimeCommitmentId;
        return null;
      })(),
      email: String(b.email ?? ""),
    };

    const text = formatTelegramSubmissionText(answers);

    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const telegramJson = (await telegramRes.json().catch(() => null)) as unknown;
    const ok =
      typeof telegramJson === "object" &&
      telegramJson !== null &&
      "ok" in telegramJson &&
      (telegramJson as { ok?: unknown }).ok === true;
    if (!telegramRes.ok || !ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Telegram sendMessage failed",
          details: telegramJson ?? { status: telegramRes.status },
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
