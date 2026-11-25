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
 * selector built from a field's name. Focus in the filters' disclosure,
 * which goes once scripts run, goes to its match, or else to the entry.
 *
 * @param props - The bar's root, and whether scripts have taken over.
 */
// @note Impure: reads and moves focus.
export default function useLinkFocusHandoff({
  rootRef,
  hydrated,
}: UseLinkFocusHandoffProps): void {
  // What held focus as scripts took over: a link's name and chip, and
  // whether it sat in the filters' disclosure, which goes once they run.
  const handed = useRef<{
    readonly name: string | null;
    readonly chipId: string | null;
    readonly isInDisclosure: boolean;
  } | null>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    /* v8 ignore next -- unreachable: the root renders before its effects run */
    if (root === null) return;
    const active = root.ownerDocument.activeElement;
    if (!hydrated) {
      handed.current = null;
      if (active === null || !root.contains(active)) return;
      const isInDisclosure =
        active.closest(".ds.data-views-query-bar-filters-disclosure") !== null;
      if (active instanceof HTMLAnchorElement || isInDisclosure) {
        handed.current = {
          name: readName(active),
          chipId: readChipId(active),
          isInDisclosure,
        };
      }
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
    // A control of the disclosure with no match hands focus to the entry.
    if (held.isInDisclosure) {
      root.querySelector<HTMLElement>('[data-roving-item="entry"]')?.focus();
    }
  }, [hydrated, rootRef]);
}
