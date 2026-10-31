"use client";

import { useState, useSyncExternalStore } from "react";

// Chromium's install prompt event; not in the DOM typings.
type InstallPromptEvent = Event & { prompt: () => Promise<void> };

type InstallOption = "none" | "prompt" | "ios";

// Chromium fires the event once, often before Settings is first opened, so it
// is captured at module load rather than in the component. The module is only
// loaded once Settings is, so a very early event can be missed; the browser's
// own install menu still works then.
let installPrompt: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function setInstallPrompt(event: InstallPromptEvent | null) {
  installPrompt = event;
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    setInstallPrompt(event as InstallPromptEvent);
  });
  window.addEventListener("appinstalled", () => setInstallPrompt(null));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone === true)
  );
}

// iPadOS reports itself as a Mac, so touch support tells the two apart.
function isIos(): boolean {
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

function installOption(): InstallOption {
  if (isStandalone()) return "none";
  if (installPrompt) return "prompt";
  if (isIos()) return "ios";
  return "none";
}

/** Shown only where the browser can actually install the app. */
export function InstallCard() {
  const option = useSyncExternalStore(subscribe, installOption, () => "none");
  const [showSteps, setShowSteps] = useState(false);

  if (option === "none") return null;

  async function handleClick() {
    if (!installPrompt) {
      setShowSteps((shown) => !shown);
      return;
    }
    await installPrompt.prompt();
    // The event can only prompt once.
    setInstallPrompt(null);
  }

  return (
    <section
      id="app"
      aria-labelledby="settings-app"
      className="ft-in flex scroll-mt-6 flex-wrap items-center gap-5 rounded-3xl bg-mint px-5 py-[22px] md:px-[26px]"
    >
      <Phone />
      <div className="flex min-w-[220px] flex-[1_1_260px] flex-col gap-1">
        <h2 id="settings-app" className="font-serif text-[22px]">
          Put FocusTrack on your home screen
        </h2>
        <p className="text-sm leading-[21px] text-[#2c4a3e]">
          {showSteps
            ? "Open the Share menu in Safari, then choose Add to Home Screen."
            : "One tap to start a session from your phone or dock."}
        </p>
      </div>
      <button
        type="button"
        aria-expanded={option === "ios" ? showSteps : undefined}
        onClick={handleClick}
        className="h-[46px] cursor-pointer rounded-[14px] bg-ink px-5 text-sm font-semibold text-white"
      >
        Install the app
      </button>
    </section>
  );
}

function Phone() {
  return (
    <div
      aria-hidden
      className="relative h-[92px] w-16 shrink-0"
      style={{ animation: "ft-bob 3.6s ease-in-out infinite" }}
    >
      <span className="absolute inset-0 rounded-2xl bg-ink" />
      <span className="absolute top-1.5 left-[5px] h-20 w-[54px] rounded-xl bg-[linear-gradient(180deg,#ffe3cf,#e4deff)]" />
      <span className="absolute top-[30px] left-[22px] size-5 rounded-md bg-indigo" />
      <span className="absolute top-[37px] left-[27px] size-2.5 rounded-full bg-peach" />
    </div>
  );
}
