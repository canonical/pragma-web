/** What the scroll-overflow hook reports, and the ref it hands back. */
export interface UseScrollOverflowResult<TElement extends HTMLElement> {
  /**
   * Callback ref for the scroll container. Attach it to the element that
   * scrolls; the hook measures that element. When a consumer ref was passed
   * to the hook, the element fans out to both.
   */
  ref: (node: TElement | null) => void;
  /**
   * True while content is hidden past the top edge of the scroll container —
   * there is more above, so a top edge line is warranted.
   */
  overflowTop: boolean;
  /**
   * True while content is hidden past the bottom edge of the scroll
   * container — there is more below, so a bottom edge line is warranted.
   */
  overflowBottom: boolean;
}
