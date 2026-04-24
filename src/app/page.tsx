import { OnboardingProvider } from "@/lib/onboarding/store";
import { OnboardingWizard } from "./OnboardingWizard";

export default function Home() {
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  );
}
