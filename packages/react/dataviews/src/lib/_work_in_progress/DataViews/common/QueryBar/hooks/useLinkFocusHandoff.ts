import { useLayoutEffect, useRef } from "react";
import type { UseLinkFocusHandoffProps } from "./types.js";

/** What a control is called: its label, or else its text. */
const readName = (control: Element): string | null =>
  control.getAttribute("aria-label") ?? control.textContent;

/**
 * The chip a control belongs to, by its id, or null outside a chip: two
 * refused chips on one field have clear controls of one name.
 */
const readChipId = (control: Element): string | null =>
  control.closest(".ds.query-chip")?.id ?? null;

/**
 * Hand focus from a link drawn before scripts to the button that takes its
 * place once they run: a reader who tabbed to a Remove or Clear link stays
 * on its control. Matched by name and chip within the bar, not by a
 * selector built from a field's name.
 *
 * @param props - The bar's root, and whether scripts have taken over.
 */
// @note Impure: reads and moves focus.
export default function useLinkFocusHandoff({
  rootRef,
  hydrated,
}: UseLinkFocusHandoffProps): void {
  // The name and chip of the link that held focus as scripts took over.
  const handed = useRef<{
    readonly name: string | null;
    readonly chipId: string | null;
  } | null>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    /* v8 ignore next -- unreachable: the root renders before its effects run */
    if (root === null) return;
    const active = root.ownerDocument.activeElement;
    if (!hydrated) {
      handed.current =
        active instanceof HTMLAnchorElement && root.contains(active)
          ? { name: readName(active), chipId: readChipId(active) }
          : null;
      return;
    }
    const held = handed.current;
    handed.current = null;
    if (held === null) return;
    for (const button of root.querySelectorAll("button")) {
      if (
        readName(button) === held.name &&
        readChipId(button) === held.chipId
      ) {
        button.focus();
        return;
      }
    }
  }, [hydrated, rootRef]);
}
