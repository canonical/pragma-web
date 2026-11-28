import { untrack } from "svelte";
import type { UseResizeObserverResult } from "./types.js";

/**
 * Observes the border-box size of an element.
 *
 * The initial measurement is taken synchronously when the element appears, so
 * a consumer that positions itself from this size settles in one pass rather
 * than mounting at 0×0 and jumping into place once the observer first fires.
 * The observer then handles all later size changes.
 * @param getElement Reads the element to observe.
 * @returns The size of the element.
 * @note Impure: creates state and an effect; call during component
 * initialisation.
 */
export default function useResizeObserver(
  getElement: () => Element | null | undefined,
): UseResizeObserverResult {
  let size = $state({ width: 0, height: 0 });

  // Untracked, so the observing effect does not depend on the size it
  // writes: measurements that differ by a sub-pixel (a rect and a border box)
  // would otherwise re-run it in a loop.
  const update = (width: number, height: number) =>
    untrack(() => {
      // Skip updates that don't change the dimensions: the observer fires
      // once on observe() with the size already seeded.
      if (size.width === width && size.height === height) return;
      size = { width, height };
    });

  // Seeds the size and observes the element. Reruns when the observed element
  // changes, disconnecting the previous observer.
  $effect(() => {
    const element = getElement();
    if (!element) return;

    const initial = element.getBoundingClientRect();
    update(initial.width, initial.height);

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      // Report the BORDER-BOX size, to match the seed (getBoundingClientRect
      // is border-box) and the positioning math, which reads border-box rects
      // everywhere. `entry.contentRect` excludes padding and border, and would
      // miscentre anything derived from the width.
      const border = entry.borderBoxSize?.[0];
      if (border) {
        update(border.inlineSize, border.blockSize);
      } else {
        const rect = element.getBoundingClientRect();
        update(rect.width, rect.height);
      }
    });
    observer.observe(element);

    return () => observer.disconnect();
  });

  return {
    get width() {
      return size.width;
    },
    get height() {
      return size.height;
    },
  };
}
