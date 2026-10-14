"use client";

import { SquarePlus } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

// Chromium's install prompt event; not in the DOM typings.
type InstallPromptEvent = Event & { prompt: () => Promise<void> };

type InstallOption = "none" | "prompt" | "ios";

// Chromium fires the event once, often before the account menu is first
// opened, so it is captured at module load rather than in the component.
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

/** Account-menu item that adds the app to the home screen, where the browser allows it. */
export function AddToHomeScreen() {
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
    <div className="border-t pt-1">
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="w-full justify-start px-2"
        aria-expanded={option === "ios" ? showSteps : undefined}
        onClick={handleClick}
      >
        <SquarePlus />
        Add to Home Screen
      </Button>
      {showSteps && (
        <p className="px-2 pb-2 text-sm text-muted-foreground">
          Open the Share menu in Safari, then choose{" "}
          <span className="font-medium text-foreground">Add to Home Screen</span>.
        </p>
      )}
    </div>
  );
}
