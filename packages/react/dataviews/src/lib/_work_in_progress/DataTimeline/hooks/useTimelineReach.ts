import type {
  Count,
  ResultWindow,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import {
  readProviderHost,
  resolvePagination,
} from "@canonical/dataviews-core/bindings";
import {
  useDataViewsValue,
  useStableCallback,
  useStableValue,
} from "../../../hooks/index.js";
import type { UseTimelineReachProps, UseTimelineReachResult } from "./types.js";

/** What the rows on screen said of the collection when they answered the query. */
type Reach = {
  readonly current: boolean;
  readonly more: boolean;
  readonly total: Count;
};

/** No page sizes are offered: the timeline grows its window rather than choosing one. */
const NO_SIZES: readonly number[] = [];

/**
 * Hold what the rows said while they answered the query: a grown window
 * loading answers nothing yet, and the strip asking for it must not vanish,
 * with the focus on its command, until it does.
 */
const isHeld = (held: Reach, next: Reach): boolean =>
  !next.current ||
  (held.current &&
    held.more === next.more &&
    held.total.kind === next.total.kind &&
    (held.total.kind === "unknown" ||
      (next.total.kind !== "unknown" &&
        held.total.value === next.total.value)));

/** The window one step past the rows on screen, from the collection's first event. */
const growWindow = (window: ResultWindow, step: number): ResultWindow => ({
  ...window,
  page: 1,
  size: window.page * window.size + step,
  cursor: null,
});

/**
 * How many events the collection holds past the page, and the way to the
 * next of them, as the core's pagination decides it: a later page exists by
 * the page total, a lower bound, the token the page handed back, the
 * source's word or a full page. Reaching past the page grows the window from
 * the collection's first event by one step, so the events already shown stay
 * in place, on a source that reaches its pages by number or by token alike.
 */
export default function useTimelineReach<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
  count,
  step,
}: UseTimelineReachProps<TFields, TRow>): UseTimelineReachResult {
  const state = useDataViewsValue(provider.state);
  const facts = resolvePagination(
    state,
    provider.capabilities.pagination,
    NO_SIZES,
  );
  const reach = useStableValue<Reach>(
    {
      current: state.resultMatchesQuery,
      more: facts.hasNext,
      total: facts.total,
    },
    isHeld,
  );
  const requestMore = useStableCallback(() => {
    const { page, size } = growWindow(provider.state.get().window, step);
    provider.navigateWindow({ page, size, cursor: null });
  });
  if (!reach.more) {
    return {
      total: { kind: "exact", value: count },
      requestMore: null,
      moreHref: null,
    };
  }
  const params = readProviderHost(provider).spellQuery({
    slice: state.slice,
    window: growWindow(state.window, step),
  });
  return {
    total: reach.total,
    requestMore,
    moreHref: params === null ? null : `?${params}`,
  };
}
