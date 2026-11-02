// "Period" is left out: "trial period" would become "trial.".
const SPOKEN_MARKS: [RegExp, string][] = [
  [/\s*\bfull stop\b/gi, "."],
  [/\s*\bcomma\b/gi, ","],
  [/\s*\bquestion mark\b/gi, "?"],
  [/\s*\bexclamation (?:mark|point)\b/gi, "!"],
];
const SENTENCE_END = /[.?!]$/;

/**
 * Turns spoken punctuation into marks and starts each sentence with a capital.
 * Desktop browsers return bare lowercase words; phones often punctuate already,
 * and this leaves that alone.
 */
export function formatDictation(spoken: string, startsSentence: boolean): string {
  const punctuated = SPOKEN_MARKS.reduce(
    (text, [words, mark]) => text.replace(words, mark),
    spoken.trim(),
  )
    .replace(/([.,?!])(?=[^\s.,?!])/g, "$1 ")
    .trim();
  const capitalAfter = startsSentence ? /(^|[.?!]\s+)(\p{Ll})/gu : /([.?!]\s+)(\p{Ll})/gu;
  return punctuated.replace(
    capitalAfter,
    (_, before: string, letter: string) => before + letter.toUpperCase(),
  );
}

/** Adds spoken text after what is already written, within the length limit. */
export function appendDictation(
  written: string,
  spoken: string,
  maxLength: number,
): string {
  const start = written.trimEnd();
  const addition = formatDictation(
    spoken,
    start === "" || SENTENCE_END.test(start),
  );
  if (addition === "") return written;
  const joined =
    start === "" || /^[.,?!]/.test(addition)
      ? start + addition
      : `${start} ${addition}`;
  return joined.slice(0, maxLength);
}

/**
 * Joins a recognizer's results into one transcript. Android Chrome repeats
 * everything said so far in each new result, so a result that starts with the
 * text so far replaces it rather than adding to it.
 */
export function joinResults(transcripts: string[]): string {
  return transcripts.reduce((joined, next) => {
    if (next.trim().startsWith(joined.trim())) return next;
    const spaced = joined.endsWith(" ") || next.startsWith(" ");
    return spaced ? joined + next : `${joined} ${next}`;
  }, "");
}

export function dictationErrorMessage(error: string): string | null {
  switch (error) {
    // Our own abort when the dialog closes.
    case "aborted":
      return null;
    case "no-speech":
      return "Didn’t catch that. Try again, or type it.";
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is off. Allow it in your browser, or type it.";
    case "audio-capture":
      return "No microphone found. Type it instead.";
    case "network":
      return "Voice input needs a connection. Type it instead.";
    default:
      return "Voice input isn’t working here. Type it instead.";
  }
}
