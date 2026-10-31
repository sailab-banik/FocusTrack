import { SunriseShell } from "@/features/onboarding/sunrise-shell";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <SunriseShell>{children}</SunriseShell>;
}
