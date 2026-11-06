import type { ReadonlyChannel } from "@canonical/dataviews-core";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { UseDataViewsValueResult } from "./types.js";

/** The whole snapshot: the selector a call without one reads through, at one identity. */
const selectWhole = (value: unknown): unknown => value;

/**
 * Observe one provider channel and re-render only when what is read from it
 * changes.
 *
 * `import { useDataViewsValue } from "@canonical/dataviews-react";`
 *
 * ```ts
 * const state = useDataViewsValue(provider.state);
 * const search = useDataViewsValue(provider.state, (s) => s.slice.search ?? "");
 * const ids = useDataViewsValue(
 *   selection.state,
 *   (s) => [...s.ids],
 *   (a, b) => a.length === b.length && a.every((id, i) => id === b.at(i)),
 * );
 * ```
 *
 * Returns the held value while `isEqual(previous, next)` holds; without it,
 * `Object.is`. Keep `select` and `isEqual` stable and pure.
 *
 * @param channel - The channel observed: a provider's state, its presentation,
 *   a selection, a row's record.
 * @param select - Reads the part of the snapshot this render needs.
 * @param isEqual - Whether the next value says the same as the one held, so
 *   the held one is returned in its place.
 *
 * @note Impure: subscribes to the channel, caches the last snapshot's
 * selection, and writes the committed value to a ref in an effect after
 * commit.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function useDataViewsValue<T>(
  channel: ReadonlyChannel<T>,
): UseDataViewsValueResult<T>;
export default function useDataViewsValue<T, TSelected>(
  channel: ReadonlyChannel<T>,
  select: (value: T) => TSelected,
  isEqual?: (previous: TSelected, next: TSelected) => boolean,
): UseDataViewsValueResult<TSelected>;
export default function useDataViewsValue(
  channel: ReadonlyChannel<unknown>,
  select: (value: unknown) => unknown = selectWhole,
  isEqual: (previous: unknown, next: unknown) => boolean = Object.is,
): unknown {
  // What the last committed render returned: written after commit, never
  // during render, so a render React discards leaves it as it was.
  const held = useRef<{ readonly value: unknown } | null>(null);
  const read = useMemo(() => {
    // One cache per channel, select and isEqual: the last snapshot read and
    // what it answered, so React's repeated reads of one snapshot get one
    // value, the consistency useSyncExternalStore requires. It caches a
    // pure function of the snapshot, so writing it twice writes the same.
    let memo: { readonly snapshot: unknown; readonly value: unknown } | null =
      null;
    return (): unknown => {
      const snapshot = channel.get();
      if (memo !== null && Object.is(memo.snapshot, snapshot)) {
        return memo.value;
      }
      const next = select(snapshot);
      const committed = held.current;
      // The committed value first, so the reference on screen is the one
      // kept; the cache covers the stretch before the first commit.
      const value =
        committed !== null && isEqual(committed.value, next)
          ? committed.value
          : memo !== null && isEqual(memo.value, next)
            ? memo.value
            : next;
      memo = { snapshot, value };
      return value;
    };
  }, [channel, select, isEqual]);
  // A new reader every render: React checks a concurrent render's reads
  // for consistency only where the reader or the value read changed, so a
  // stable reader over an unchanged snapshot would let a publication
  // during the render commit two readers apart.
  const readNow = (): unknown => read();
  const value = useSyncExternalStore(channel.subscribe, readNow, readNow);
  useEffect(() => {
    held.current = { value };
  }, [value]);
  return value;
}
