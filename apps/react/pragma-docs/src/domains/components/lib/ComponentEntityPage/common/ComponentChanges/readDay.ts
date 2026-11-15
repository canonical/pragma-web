import { DAY_PREFIX } from "./constants.js";

/**
 * The day a timestamp names, as written in it (`2026-03-06` for
 * `2026-03-06T11:00:00.000+01:00`); a timestamp that does not start with
 * a day is returned whole.
 */
export default function readDay(timestamp: string): string {
  return DAY_PREFIX.exec(timestamp)?.[0] ?? timestamp;
}
