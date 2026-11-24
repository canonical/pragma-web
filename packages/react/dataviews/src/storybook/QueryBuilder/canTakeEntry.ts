import { PARTS } from "./constants.js";
import type { Clause, Part } from "./types.js";

/**
 * Whether a clause's part can take the Entry: a chip keeps at least one
 * Segment, so another of its parts must hold a value.
 *
 * @param clause - The clause being edited.
 * @param part - The part the Entry would take.
 * @returns Whether the Entry can move there.
 */
export default function canTakeEntry(clause: Clause, part: Part): boolean {
  return PARTS.some((other) => other !== part && clause[other]);
}
