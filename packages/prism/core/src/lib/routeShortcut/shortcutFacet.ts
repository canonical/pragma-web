import { defineFacet } from "../routeFacet/index.js";
import { ROUTE_SHORTCUT_META_KEY } from "./constants.js";

/**
 * A route's single-key shortcut, allocated by the route that OWNS the
 * destination rather than by a table sitting beside it. The rail is only the
 * first DISPLAY of this allocation, not its owner, and the keyboard listener
 * reads it too.
 *
 * THE VALUE IS A BARE `KeyboardEvent.key` STRING, deliberately the smallest
 * honest thing. A richer command grammar (modes, chords, sequences, labels)
 * would widen it to an object; that is mechanical, and every call site is a
 * type error until it is done.
 *
 * NO VERBS. A shortcut names a PLACE YOU GO, never an operation: the whole
 * effect is `router.navigate(name)`. Do not grow an action field, a
 * confirmation, or a destructive branch here.
 *
 * `read` returns the key, `undefined` when the route claims none, or throws
 * when the claim is not a single character.
 */
export const routeShortcutFacet = defineFacet<
  string,
  typeof ROUTE_SHORTCUT_META_KEY
>(ROUTE_SHORTCUT_META_KEY, (value, key) => {
  // Code points, not UTF-16 units: `KeyboardEvent.key` for a printable key is
  // one code point, and `.length` would miscount it above the BMP (an
  // astral character is two UTF-16 units). Deliberately NOT grapheme
  // segmentation: a ZWJ sequence spans several code points and is rejected
  // here, which is correct — it is not a key a keydown handler will ever match.
  if (typeof value !== "string" || [...value].length !== 1) {
    throw new Error(
      `route meta ${key} is not a single-character key (got ${JSON.stringify(value)})`,
    );
  }
  return value;
});
