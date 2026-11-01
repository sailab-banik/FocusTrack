"use client";

import { useEffect, useRef, useState } from "react";
import { dictationErrorMessage } from "./dictation";

// TypeScript's DOM types include the result objects but not the recognizer.
type Recognizer = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type RecognizerConstructor = new () => Recognizer;

declare global {
  interface Window {
    SpeechRecognition?: RecognizerConstructor;
    webkitSpeechRecognition?: RecognizerConstructor;
  }
}

/**
 * Speech to text through the browser's own Web Speech API. The app's server
 * and AI provider are not involved. Call only in the browser.
 */
export function useDictation(onText: (text: string) => void) {
  const recognizer = useRef<Recognizer | null>(null);
  const [Recognition] = useState(
    () => window.SpeechRecognition ?? window.webkitSpeechRecognition,
  );
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Closing the dialog must release the microphone and drop what was heard.
  useEffect(
    () => () => {
      if (!recognizer.current) return;
      recognizer.current.onresult = null;
      recognizer.current.onerror = null;
      recognizer.current.onend = null;
      recognizer.current.abort();
    },
    [],
  );

  function start(Constructor: RecognizerConstructor) {
    const next = new Constructor();
    next.lang = navigator.language;
    // One utterance per tap suits a one-line outcome, and avoids the repeated
    // results Android Chrome produces in continuous mode.
    next.continuous = false;
    next.interimResults = true;

    let latest = "";
    next.onresult = ({ results }) => {
      latest = Array.from(results, (result) => result[0].transcript).join("");
      setHeard(latest);
    };
    next.onerror = (event) => setError(dictationErrorMessage(event.error));
    // Commit here, not on isFinal, since browsers differ on whether the last
    // result is marked final. Stopping early keeps what was heard so far.
    next.onend = () => {
      setListening(false);
      setHeard("");
      if (latest.trim() !== "") onText(latest);
    };

    recognizer.current = next;
    setError(null);
    setListening(true);
    next.start();
  }

  function toggle() {
    if (!Recognition) return;
    if (listening) {
      recognizer.current?.stop();
      return;
    }
    start(Recognition);
  }

  return { supported: Recognition !== undefined, listening, heard, error, toggle };
}
