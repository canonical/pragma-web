import { TABBABLE_SELECTORS } from "../constants.js";

const TABBABLE = TABBABLE_SELECTORS.join(", ");

/**
 * Whether a closed `details` folds the element away: inside one, but not
 * in its first `summary`, the part Tab still reaches.
 */
const isFolded = (element: Element, boundary: Element): boolean => {
  const details = element.parentElement?.closest("details:not([open])");
  if (
    details === null ||
    details === undefined ||
    !boundary.contains(details)
  ) {
    return false;
  }
  const summary = details.querySelector(":scope > summary");
  return summary?.contains(element) !== true || isFolded(details, boundary);
};

/** Whether Tab reaches a matched element: shown, not inert, not folded. */
const isReachable = (element: Element, boundary: Element): boolean => {
  const hidden = element.closest("[hidden], [inert]");
  return (
    (hidden === null || !boundary.contains(hidden)) &&
    (!element.matches("summary") ||
      element.matches("details > summary:first-of-type")) &&
    !isFolded(element, boundary)
  );
};

/** Whether Tab reaches anything inside the element, judged within it. */
export default function hasTabbableDescendant(element: Element): boolean {
  return [...element.querySelectorAll(TABBABLE)].some((match) =>
    isReachable(match, element),
  );
}
