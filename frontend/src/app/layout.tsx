import type { Metadata, Viewport } from "next";
import { Onest, Young_Serif } from "next/font/google";
import { SiteAnalytics } from "@/features/analytics/site-analytics";
import { SITE_URL } from "@/features/search/site-url";
import "./globals.css";
import "./daylight.css";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"] });
const youngSerif = Young_Serif({
  variable: "--font-young-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "FocusTrack",
  description: "Personal work intelligence and execution tracker",
  appleWebApp: { capable: true, title: "FocusTrack" },
};

export const viewport: Viewport = {
  // Lets the mobile tab bar pad itself clear of the home indicator.
  viewportFit: "cover",
  themeColor: "#f7f5fb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${onest.variable} ${youngSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col tabular-nums">
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
