import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { HOME_PATH } from "@/features/auth/routes";

export const metadata: Metadata = {
  title: "Privacy · FocusTrack",
  description: "What FocusTrack stores, what it shares, and how to delete it.",
};

const CONTACT = "sailabbanik24@gmail.com";

const H2 = "mt-4 font-serif text-[22px] leading-7";

// Public: Google's brand verification and signed-out visitors must reach it.
// Keep it true to the code: update it when what is stored or sent changes.
export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-[680px] flex-col gap-3 px-5 py-8 text-[15px] leading-6 text-ink-soft md:py-14">
      <Link href={HOME_PATH} className="mb-6 w-fit rounded-md text-ink">
        <Brand />
      </Link>
      <h1 className="font-serif text-[34px] leading-10 text-ink md:text-[44px] md:leading-[50px]">
        Privacy
      </h1>
      <p className="text-[13px] text-ink-muted">
        Last updated November 2, 2026
      </p>
      <p>
        FocusTrack is a personal work tracker run by Sailab Banik. This page
        says what it stores, who else handles it, and how to have it deleted.
        Questions go to <EmailLink />.
      </p>

      <h2 className={H2 + " text-ink"}>What FocusTrack stores</h2>
      <List
        items={[
          "Your account: your email address, your password in hashed form if you use one, and your name if you add one.",
          "Your work: the projects and categories you create, why a project matters if you say, each session's times and the comment you write when you stop it.",
          "Older data: sessions and goals from before November 2026 may also hold a description, notes, energy and difficulty ratings, and goal titles. These are no longer shown or sent anywhere, and are deleted with your account.",
          "Reports: the daily, weekly and monthly reads written from that work, and how many AI tokens each one used.",
        ]}
      />

      <h2 className={H2 + " text-ink"}>Signing in with Google</h2>
      <p>
        If you choose Google, FocusTrack receives your name, email address and
        profile picture from Google, and uses your name and email to create your
        account and sign you in. It asks for nothing else from your Google
        account, and does not share this data with anyone or use it for
        advertising or to train AI.
      </p>

      <h2 className={H2 + " text-ink"}>AI reports</h2>
      <p>
        When AI reports are on, FocusTrack sends OpenAI the period’s totals,
        your project names and why they matter, your category names, and your
        session times and comments, so it can write the report. It does not send
        your email, your name, or anything from outside that period and the
        comparison periods. Requests ask OpenAI not to store the response, and
        OpenAI handles them under its own terms. Everything else in FocusTrack
        works without AI.
      </p>

      <h2 className={H2 + " text-ink"}>Voice input</h2>
      <p>
        If you tap the microphone when stopping a session, your browser turns
        your speech into text with its own speech service. Depending on the
        browser, that can send your audio to its maker, such as Google for
        Chrome or Apple for Safari, under their terms. FocusTrack never receives
        the audio, and keeps only the comment you choose to save.
      </p>

      <h2 className={H2 + " text-ink"}>Who else handles your data</h2>
      <List
        items={[
          "Supabase hosts the database and handles sign-in.",
          "Vercel hosts the app and counts page visits, as below.",
          "OpenAI writes the AI reports, as above.",
          "Google handles sign-in if you choose it.",
        ]}
      />
      <p>
        FocusTrack uses Vercel Web Analytics to count page visits. It uses no
        cookies and is not linked to your account. Vercel receives the page
        address, with session ids removed, along with the referring site, your
        rough location, and your device and browser type. FocusTrack does not
        sell your data or show ads. These services may process data outside
        your country.
      </p>

      <h2 className={H2 + " text-ink"}>Who can see it</h2>
      <p>
        Your work is private to your account. The admin overview shows usage
        only: your name, a shortened form of your email, when you joined, and
        counts such as sessions, reports, tokens and your execution share. It
        does not show your comments, project names or reports. The site’s
        operator can technically reach the database to keep the service running,
        and does not read your work otherwise.
      </p>

      <h2 className={H2 + " text-ink"}>Cookies</h2>
      <p>
        FocusTrack uses only the cookies it needs to work: one to keep you signed
        in, and small ones for your time zone, which reports you have seen, and
        which nudges you have dismissed.
      </p>

      <h2 className={H2 + " text-ink"}>Keeping and deleting your data</h2>
      <p>
        Your data is kept until you ask for it to be deleted. To delete your
        account and everything in it, or to get a copy, email <EmailLink /> from
        the address on your account. Requests are handled within 30 days.
      </p>

      <h2 className={H2 + " text-ink"}>Changes</h2>
      <p>
        If this page changes, the date at the top changes with it.
      </p>
    </main>
  );
}

function EmailLink() {
  return (
    <a href={`mailto:${CONTACT}`} className="font-semibold text-indigo">
      {CONTACT}
    </a>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
