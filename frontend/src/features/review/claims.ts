// The provider call times out after a minute, so an unwritten claim older
// than this belongs to an attempt that failed or was cut off.
export const CLAIM_TTL_MS = 3 * 60_000;
