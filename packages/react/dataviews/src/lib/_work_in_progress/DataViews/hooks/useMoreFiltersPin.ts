import {
  type MouseEvent,
  type ToggleEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useIsHydrated } from "../../../hooks/index.js";
import type {
  UseMoreFiltersPinProps,
  UseMoreFiltersPinResult,
} from "./types.js";

/**
 * The placement More filters holds while it stays open: the fields shown by
 * default when it opened, under the marks they were placed under, so no
 * control moves in or out of it while a reader works inside. A pin placed
 * under other marks places nothing, since the marks moved it.
 *
 * Once scripts take over, the summary's activation — a click, Enter or
 * Space — places the pin and opens the disclosure through it, in the same
 * task: the platform sends `toggle` on a later task, and a browser may run a
 * reader's next keystrokes first, so a restriction typed inside before a
 * toggle-placed pin landed would move its control out, and focus with it.
 * A disclosure opened or closed some other way is pinned or released as it
 * toggles, and one a reader opened before scripts took over, where no toggle
 * was heard, in the commit where the filters hydrate.
 *
 * @note Impure: reads the disclosure's open state from the document.
 */
export default function useMoreFiltersPin({
  marks,
  listShownFields,
}: UseMoreFiltersPinProps): UseMoreFiltersPinResult {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const hydrated = useIsHydrated();
  const [pin, setPin] = useState<{
    readonly marks: string;
    readonly fields: ReadonlySet<string>;
  } | null>(null);
  const pinned = pin?.marks === marks ? pin.fields : null;
  /** The pin an opening places: the fields shown by default as it opens. */
  const pinShownFields = () => ({ marks, fields: new Set(listShownFields()) });
  const handleSummaryClick = (event: MouseEvent<HTMLElement>): void => {
    // The pin opens it, not the platform, which would toggle it again.
    event.preventDefault();
    setPin(pinned === null ? pinShownFields() : null);
  };
  const handleToggle = (event: ToggleEvent<HTMLDetailsElement>): void => {
    const { open } = event.currentTarget;
    // A pin the opening already placed stays: the fields shown now may
    // include one restricted inside since.
    setPin((placed) =>
      open ? (placed?.marks === marks ? placed : pinShownFields()) : null,
    );
  };
  // Opened before scripts took over, the disclosure's toggle had no listener
  // to place its pin: in the commit where the filters hydrate, an open
  // disclosure with no pin is pinned as its opening would have pinned it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: hydrated is the trigger; later pins are the activation's and the toggle's to place
  useLayoutEffect(() => {
    if (hydrated && pin === null && detailsRef.current?.open === true) {
      setPin(pinShownFields());
    }
  }, [hydrated]);
  return { pinned, detailsRef, handleSummaryClick, handleToggle };
}
