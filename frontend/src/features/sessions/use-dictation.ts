"use client";

import { useEffect, useRef, useState } from "react";
import { dictationErrorMessage, joinResults } from "./dictation";

const SILENCE_LIMIT_MS = 5000;

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
  const silenceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [Recognition] = useState(
    () => window.SpeechRecognition ?? window.webkitSpeechRecognition,
  );
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Closing the dialog must release the microphone and drop what was heard.
  useEffect(
    () => () => {
      clearTimeout(silenceTimer.current);
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
    // Left to itself the browser stops at its own short pause. Continuous mode
    // lets the silence limit below decide instead.
    next.continuous = true;
    next.interimResults = true;

    function restartSilenceTimer() {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => next.stop(), SILENCE_LIMIT_MS);
    }

    let latest = "";
    next.onresult = ({ results }) => {
      latest = joinResults(
        Array.from(results, (result) => result[0].transcript),
      );
      setHeard(latest);
      restartSilenceTimer();
    };
    next.onerror = (event) => setError(dictationErrorMessage(event.error));
    // Commit here, not on isFinal, since browsers differ on whether the last
    // result is marked final. Stopping early keeps what was heard so far.
    next.onend = () => {
      clearTimeout(silenceTimer.current);
      setListening(false);
      setHeard("");
      if (latest.trim() !== "") onText(latest);
    };

    recognizer.current = next;
    setError(null);
    setListening(true);
    next.start();
    restartSilenceTimer();
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
