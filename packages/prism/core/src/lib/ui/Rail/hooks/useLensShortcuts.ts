import { usePreferredShortcuts } from "@canonical/react-hooks";
import type { RouteName } from "@canonical/router-core";
import { type RegisteredRouteMap, useRouter } from "@canonical/router-react";
import { useEffect, useMemo } from "react";
import { collectShortcuts } from "../../../routeShortcut/index.js";
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
 * it for display. The listener is ephemeral — attached on mount, detached on
 * unmount, with no stored state: the destination is URL state, owned by the
 * router.
 *
 * The allocation comes from the route table: each lens route claims its own
 * digit (`routeShortcutFacet`) and the hook collects them off
 * `useRouter().routes`. The routes arrive through the router rather than an
 * import of the site's route table, because the route table imports the
 * lens layouts, which render the rail, so importing it back would close a
 * cycle; reading the router also reflects the table it is actually running.
 * Routes are named through the router's registered map rather than a site's
 * route type: the same precision, with no knowledge of the site's route
 * module. Returning the allocation lets the rail display exactly the digits
 * it wires, from one walk per render.
 *
 * A key navigates only when every guard passes, in this order: the stored
 * shortcuts preference (`usePreferredShortcuts`) is not off; no modifier is
 * held (the browser's own `Alt+digit` and the like stay untouched); the key
 * is neither mid-IME-composition (the digit is text being composed) nor an
 * auto-repeat (a held digit navigates once); and the target is not an
 * editable control (digits belong to the text field then).
 *
 * WCAG 2.1.4 (Character Key Shortcuts) asks that a bare-key shortcut be
 * switchable off by the user. The stored preference is the switch; a site
 * meets the criterion only once it offers a control that writes it, and
 * that control must, in the same change, stop the rail advertising `kbd`
 * hints and `aria-keyshortcuts` for keys that no longer fire.
 *
 * @returns The allocation the listener navigates by.
 * @note Impure: attaches a `keydown` listener to `document` while mounted,
 *   and navigates the router when a guarded key fires.
 */
export default function useLensShortcuts(): UseLensShortcutsResult {
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
}
