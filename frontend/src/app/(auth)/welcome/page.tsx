import type { Metadata } from "next";
import { WelcomeFlow } from "@/features/onboarding/welcome-flow";

export const metadata: Metadata = { title: "FocusTrack" };

export default function WelcomePage() {
  return <WelcomeFlow />;
}
