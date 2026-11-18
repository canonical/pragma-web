import type {
  DataViewsProvider,
  QueryIssue,
  ReadonlyChannel,
  ResultWindow,
  SchemaFieldDefinition,
  Slice,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { useMemo } from "react";
import type { QueryGroupStandIn, QueryStateStandIn } from "../types.js";
import type { UseQueryGroupProps, UseQueryGroupResult } from "./types.js";

/** What one query state was read from, and the state itself. */
type HeldState = {
  readonly slice: Slice;
  readonly window: ResultWindow;
  readonly view: string | null;
  readonly refused: readonly QueryIssue[];
  readonly state: QueryStateStandIn;
};

/**
 * The query state as one channel over the provider's state, its open view
 * and its refused parameters. It reads one object while none of the four
 * parts it is made of moves, so a result landing over the same query, or a
 * page of rows, hands every reader the state it already holds.
 */
const createQueryState = (
  provider: DataViewsProvider<readonly SchemaFieldDefinition[]>,
): ReadonlyChannel<QueryStateStandIn> => {
  const { view } = readProviderHost(provider);
  let held: HeldState | null = null;
  return {
    get: () => {
      const { slice, window } = provider.state.get();
      const open = view.get();
      const refused = provider.issues.get();
      if (
        held?.slice !== slice ||
        held.window !== window ||
        held.view !== open ||
        held.refused !== refused
      ) {
        held = {
          slice,
          window,
          view: open,
          refused,
          state: Object.freeze({ slice, window, view: open, refused }),
        };
      }
      return held.state;
    },
    subscribe: (listener) => {
      const stops = [
        provider.state.subscribe(listener),
        view.subscribe(listener),
        provider.issues.subscribe(listener),
      ];
      return () => {
        for (const stop of stops) stop();
      };
    },
  };
};

/** The query group's commands, each one the provider's own. */
const createQueryGroup = (
  provider: DataViewsProvider<readonly SchemaFieldDefinition[]>,
): QueryGroupStandIn => {
  const host = readProviderHost(provider);
  return {
    state: createQueryState(provider),
    setSearch: (search) => provider.setSearch(search),
    setPredicate: (predicate, nth) => host.setPredicate(predicate, nth),
    addPredicate: (predicate) => host.addPredicate(predicate),
    removePredicate: ({ field, operator, nth }) =>
      host.removePredicate(field, operator, nth),
    editPredicates: ({ remove, add }) => host.editPredicates(remove, add),
    clear: (paths) => provider.clear(paths),
    listRefusals: (query) => provider.refusals(query),
    // The open view is the location's to spell beside every query.
    spellHref: (destination) => {
      const params = host.spellQuery(destination);
      return params === null ? null : `?${params.toString()}`;
    },
  };
};

/**
 * The store's query group over today's provider: the query state as one
 * channel, and its commands. A private stand-in for `store.query`, with the
 * same members, removed when the store lands. One group per provider.
 *
 * @param props - The root's provider.
 * @returns The query group.
 */
export default function useQueryGroup({
  provider,
}: UseQueryGroupProps): UseQueryGroupResult {
  return useMemo(() => createQueryGroup(provider), [provider]);
}
