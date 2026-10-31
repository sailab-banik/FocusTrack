import { Credit } from "@/features/auth/credit";
import { DayColumn } from "@/features/onboarding/day-column";
import { SampleNotes } from "@/features/onboarding/sample-notes";

export default function AuthFormsLayout({ children }: LayoutProps<"/">) {
  return (
    <DayColumn aside={<SampleNotes />} footer={<Credit />}>
      {children}
    </DayColumn>
  );
}
