/** What can take focus from Tab, before its tab index is read. */
const FOCUSABLE =
  "a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])";

/**
 * The element Tab or Shift+Tab reaches next after leaving the bar's
 * toolbar: the first one in tab order after it, such as the clear control,
 * or the last one before it. Only an enabled element with a tab index of
 * zero or more that is laid out counts; null where none is.
 *
 * @param root - The bar's root, which holds the toolbar.
 * @param direction - Which way focus leaves.
 * @returns The element to focus, or null.
 * @note Impure: reads the document's elements and their layout.
 */
export default function findTabbableBeyond(
  root: HTMLElement,
  direction: "forward" | "backward",
): HTMLElement | null {
  const toolbar = root.querySelector('[role="toolbar"]') ?? root;
  const tabbable = [
    ...root.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE),
  ].filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(":disabled") &&
      !toolbar.contains(element) &&
      element.getClientRects().length > 0,
  );
  const isAfter = (element: HTMLElement): boolean =>
    (toolbar.compareDocumentPosition(element) &
      Node.DOCUMENT_POSITION_FOLLOWING) !==
    0;
  return direction === "forward"
    ? (tabbable.find(isAfter) ?? null)
    : (tabbable.findLast((element) => !isAfter(element)) ?? null);
}
