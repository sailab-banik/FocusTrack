import type { Metadata } from "next";
import { WELCOME_PATH } from "@/features/auth/routes";
import { WelcomeFlow } from "@/features/onboarding/welcome-flow";
import { SITE_URL } from "@/features/search/site-url";

const title = "FocusTrack: see where your work time goes";
const description =
  "FocusTrack is a personal work tracker. See how much of your time goes to making things, how much to getting ready, and what it all added up to.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: WELCOME_PATH },
  openGraph: {
    type: "website",
    siteName: "FocusTrack",
    url: WELCOME_PATH,
    title,
    description,
  },
};

// Tells Google the site's name, so results read "FocusTrack" rather than the
// domain.
const websiteJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FocusTrack",
  url: `${SITE_URL}/`,
});

export default function WelcomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: websiteJsonLd }}
      />
      <WelcomeFlow />
    </>
  );
}
