import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type {
  UseDataViewsValueProps,
  UseDataViewsValueResult,
} from "./types.js";

/** The whole snapshot: the selector a call without one reads through, at one identity. */
const selectWhole = (value: unknown): unknown => value;

/**
 * Observe one provider channel and re-render only when what is read from it
 * changes.
 *
 * `import { useDataViewsValue } from "@canonical/dataviews-react";`
 *
 * ```ts
 * const state = useDataViewsValue({ channel: provider.state });
 * const search = useDataViewsValue({
 *   channel: provider.state,
 *   select: (s) => s.slice.search ?? "",
 * });
 * const ids = useDataViewsValue({
 *   channel: selection.state,
 *   select: (s) => [...s.ids],
 *   isEqual: (a, b) =>
 *     a.length === b.length && a.every((id, i) => id === b.at(i)),
 * });
 * ```
 *
 * Keep `select` and `isEqual` stable and pure.
 *
 * @param props - The channel, and optionally `select` and `isEqual`.
 *
 * @note Impure: subscribes to the channel, caches the last snapshot's
 * selection, and writes the committed value to a ref in an effect after
 * commit.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function useDataViewsValue<T>(
  props: UseDataViewsValueProps<T> & { readonly select?: undefined },
): UseDataViewsValueResult<T>;
export default function useDataViewsValue<T, TSelected>(
  props: UseDataViewsValueProps<T, TSelected> & {
    readonly select: (value: T) => TSelected;
  },
): UseDataViewsValueResult<TSelected>;
export default function useDataViewsValue({
  channel,
  select = selectWhole,
  isEqual = Object.is,
}: UseDataViewsValueProps<unknown, unknown>): unknown {
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
