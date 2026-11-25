import { useLayoutEffect, useRef } from "react";
import type {
  UseLinkFocusHandoffProps,
  UseLinkFocusHandoffResult,
} from "./types.js";

/** What a control is called: its label, or else its text. */
const readName = (control: Element): string | null =>
  control.getAttribute("aria-label") ?? control.textContent;

/**
 * The chip or quick filter a control belongs to, by its id, or null
 * outside both: two refused chips on one field have clear controls of one
 * name, as two quick filters have "All".
 */
const readChipId = (control: Element): string | null =>
  control.closest(".ds.query-chip, .ds.filter-options")?.id ?? null;

/**
 * Hand focus from a link drawn before scripts to the button that takes its
 * place once they run: a reader who tabbed to a Remove or Clear link stays
 * on its control, and one on a quick filter panel's Apply, which goes,
 * stays in the panel. Matched by name and chip within the bar, not by a
 * selector built from a field's name. Focus in the filters' disclosure,
 * which goes once scripts run, goes to its match, or else to the entry.
 *
 */
// @note Impure: reads and moves focus.
export default function useLinkFocusHandoff(
  ...[rootRef, hydrated]: UseLinkFocusHandoffProps
): UseLinkFocusHandoffResult {
  // What held focus as scripts took over: a link's name and chip, and
  // whether it sat in the filters' disclosure, which goes once they run.
  const handed = useRef<{
    readonly name: string | null;
    readonly chipId: string | null;
    readonly isInDisclosure: boolean;
    /** The quick filter panel focus was in, by its id, or null. */
    readonly panelId: string | null;
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
      // Only a quick filter panel's Apply goes; its other controls stay.
      const panel = active.matches(
        '.ds.filter-button-panel .ds.data-views-quick-filter-form > [type="submit"]',
      )
        ? active.closest(".ds.filter-button-panel")
        : null;
      const panelId = panel === null ? null : panel.id;
      if (
        active instanceof HTMLAnchorElement ||
        isInDisclosure ||
        panelId !== null
      ) {
        handed.current = {
          name: readName(active),
          chipId: readChipId(active),
          isInDisclosure,
          panelId,
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
      return;
    }
    // A quick filter panel's Apply, which goes once scripts run, hands
    // focus to the panel's first control, or the panel itself.
    if (held.panelId !== null) {
      const panel = root.ownerDocument.getElementById(held.panelId);
      (
        panel?.querySelector<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])',
        ) ?? panel
      )?.focus();
    }
  }, [hydrated, rootRef]);
}
