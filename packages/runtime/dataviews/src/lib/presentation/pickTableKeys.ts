import isTableKey from "./isTableKey.js";
import type { ViewPresentation } from "./types.js";

/** The keys of an arrangement that tables keep, and nothing else. */
export default function pickTableKeys(
  presentation: ViewPresentation,
): ViewPresentation {
  return Object.fromEntries(
    Object.entries(presentation).filter(([key]) => isTableKey(key)),
  );
}
