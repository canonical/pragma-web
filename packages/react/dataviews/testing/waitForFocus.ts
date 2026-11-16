import waitForFrames from "./waitForFrames.js";

/**
 * Waits for an element to take focus, as a menu's focus return does a
 * moment after it closes.
 *
 * @param element The element awaited to hold focus.
 * @note Impure: waits on the animation frames.
 */
export default async function waitForFocus(element: Element): Promise<void> {
  await waitForFrames(
    () => element === element.ownerDocument.activeElement || null,
    "focus on the element",
  );
}
