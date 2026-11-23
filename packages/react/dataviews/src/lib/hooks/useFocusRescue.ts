import { type FocusEvent, useLayoutEffect, useRef } from "react";
import type { UseFocusRescueProps, UseFocusRescueResult } from "./types.js";

/**
 * Hand stranded focus to a fallback. A control disabled or removed under the
 * focus reports no blur, so the control last focused inside a group is held
 * until focus leaves it; after a render that disabled or removed it, the
 * fallback takes the focus.
 *
 * @note Impure: moves focus in a layout effect after every render.
 */
export default function useFocusRescue({
  fallback,
}: UseFocusRescueProps): UseFocusRescueResult {
  const focused = useRef<HTMLElement | null>(null);
  // A layout effect after every render, reading a ref: the render that
  // stranded the focus is not one the effect could name by what it reads.
  useLayoutEffect(() => {
    const control = focused.current;
    if (
      control !== null &&
      (!control.isConnected || control.matches(":disabled"))
    ) {
      focused.current = null;
      fallback.current?.focus();
    }
  });
  return {
    onFocus: (event: FocusEvent<HTMLElement>) => {
      focused.current = event.target;
    },
    onBlur: () => {
      focused.current = null;
    },
  };
}
