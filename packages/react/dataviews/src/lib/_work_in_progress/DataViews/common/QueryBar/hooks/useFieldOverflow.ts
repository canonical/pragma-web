import { useLayoutEffect } from "react";
import type { UseFieldOverflowProps } from "./types.js";

/** The property the bar's rows below the field are moved down by. */
const PROPERTY = "--data-views-query-bar-field-overflow";

/**
 * How far the focused field reaches past its resting line, kept on the
 * bar's root as a length, so the rows below it move down by as much and
 * the field never covers them.
 *
 * @param props - The bar's root.
 */
// @note Impure: observes the field's size and sets a property on the root.
export default function useFieldOverflow({
  rootRef,
}: UseFieldOverflowProps): void {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const input = root?.querySelector<HTMLElement>(".ds.query-input");
    const field = input?.querySelector<HTMLElement>(":scope > .field");
    // Without ResizeObserver, the rows stay where they rest.
    if (!root || !input || !field || typeof ResizeObserver === "undefined") {
      return;
    }
    const measure = (): void => {
      const reach =
        field.getBoundingClientRect().height -
        input.getBoundingClientRect().height;
      root.style.setProperty(PROPERTY, `${Math.max(0, reach)}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(field);
    measure();
    return () => {
      observer.disconnect();
      root.style.removeProperty(PROPERTY);
    };
  }, [rootRef]);
}
