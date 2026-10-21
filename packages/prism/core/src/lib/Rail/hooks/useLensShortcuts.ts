/**
 * The keyboard grammar's lens digits, wired as an EPHEMERAL document
 * listener — attach on mount, detach on unmount, no stored state anywhere:
 * the destination is URL state, owned by the router, and the listener
 * itself owns nothing.
 *
 * The allocation comes from the ROUTE TABLE, not from a table beside it:
 * each lens route claims its own digit (`routeShortcutFacet`) and this hook
 * collects them off `useRouter().routes`. The routes arrive through the
 * router rather than through an import of the site's route table on
 * purpose — the route table imports the lens layouts, which render the rail,
 * so importing back would close a cycle. The hook also reflects the table
 * the router is ACTUALLY running, which is what makes the digits derived
 * rather than merely parallel.
 *
 * The hook RETURNS the allocation so the rail can display exactly what it
 * wires: one walk per render, one source, no way for the shown digit and
 * the live digit to disagree.
 *
 * Guards, in check order: the stored shortcuts preference is off
 * (`usePreferredShortcuts`); no modifier chords (the browser's own
 * `Alt+digit` etc. stay untouched); no firing mid-IME-composition (the
 * digit is text being composed, not a command) or on key auto-repeat (a
 * held digit navigates once); no firing while the user types in an
 * editable target — digits belong to the text field then, not the
 * rail.
 *
 * WCAG 2.1.4 (Character Key Shortcuts) asks that a bare-key shortcut be
 * switchable off, through a mechanism available to the user. The stored
 * preference is the switch; a site satisfies the criterion only once it
 * offers a control that writes it, and that control must, in the same
 * change, stop the rail advertising `kbd` hints and `aria-keyshortcuts` for
 * keys that no longer fire.
 */

import { usePreferredShortcuts } from "@canonical/react-hooks";
import type { RouteName } from "@canonical/router-core";
import { type RegisteredRouteMap, useRouter } from "@canonical/router-react";
import { useEffect, useMemo } from "react";
import { collectShortcuts } from "../../routeShortcut/index.js";
import type { UseLensShortcutsResult } from "./types.js";

/** Whether a keystroke landed in a control the reader is typing into. */
const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
};

/**
 * Wire the running router's shortcut allocation to the document, and return
 * it for display.
 *
 * Named through the router's REGISTERED map rather than a site's route
 * type: same precision, and this package knows nothing about the site's
 * route module.
 *
 * @returns The allocation the listener navigates by.
 * @note Impure: attaches a `keydown` listener to `document` while mounted,
 *   and navigates the router when a guarded key fires.
 */
export const useLensShortcuts = (): UseLensShortcutsResult => {
  const router = useRouter();
  // Keyed on the route table, a stable object reference for the router's
  // lifetime — so the walk, and the invariants it enforces, run once.
  const allocation = useMemo(
    () => collectShortcuts(router.routes),
    [router.routes],
  );
  // `NavigateFn` is an intersection of one overload per route name, which a
  // UNION of names cannot select from. Every shortcut-bearing route is
  // parameterless — no longer by assumption but by `collectShortcuts`' own
  // invariant, which throws on a `:param` route that claims a key — so
  // collapsing the intersection to the union member's shape is sound.
  const navigate = router.navigate as (
    to: RouteName<RegisteredRouteMap>,
  ) => unknown;

  // The 2.1.4 switch, checked in the handler beside the other four guards so
  // the whole keystroke decision reads in one place and one order. It is a
  // dependency below because the handler closes over it: the listener
  // re-attaches on a flip rather than reading a stale boolean.
  const { value: shortcuts } = usePreferredShortcuts();
  const shortcutsEnabled = shortcuts !== "off";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!shortcutsEnabled) {
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }
      if (event.isComposing || event.repeat) {
        return;
      }
      if (isEditableTarget(event.target)) {
        return;
      }
      const name = allocation.byKey.get(event.key);
      if (name === undefined) {
        return;
      }
      event.preventDefault();
      navigate(name);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate, allocation, shortcutsEnabled]);

  return allocation;
};
