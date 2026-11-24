/** The query bar's hook types: each hook's props and result. */
import type {
  Count,
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { Dispatch, RefObject } from "react";
import type { UseFacetsResult } from "../../../../../hooks/index.js";
import type { ContextOptions } from "../../../types.js";
import type {
  QueryBarSession,
  QueryBarSessionAction,
  QueryGroupStandIn,
  QueryPredicateClause,
  QuerySearchClause,
} from "../types.js";

/** What the query group's stand-in reads: the root's provider. */
export type UseQueryGroupProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
};

/** The query group over the provider, at one identity per provider. */
export type UseQueryGroupResult = QueryGroupStandIn;

/** What the edit session reads: the root's provider and the bar's root. */
export type UseQueryBarSessionProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
  /** The bar's root, inside which the session moves focus. */
  readonly rootRef: RefObject<HTMLElement | null>;
};

/** The edit session and how it moves. */
export type UseQueryBarSessionResult = {
  readonly session: QueryBarSession;
  readonly dispatch: Dispatch<QueryBarSessionAction>;
};

/** What the bar's read of its chips takes: the query group. */
export type UseClauseIdsProps = {
  readonly group: QueryGroupStandIn;
};

/** The chips' clauses, at one identity while their ids stay. */
export type UseClauseIdsResult = readonly (
  | QueryPredicateClause
  | QuerySearchClause
)[];

/** What says an outcome once its result lands: the provider and the root's announcer. */
export type UseAnnounceOutcomeProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
  readonly announce: ContextOptions["announce"];
};

/** Say an outcome, worded from the result count once the result lands. */
export type UseAnnounceOutcomeResult = (
  words: (count: Count) => string,
) => void;

/** What the suggested values' facets are read for: a field, or none. */
export type UseSuggestedFacetsProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
  /** The field whose values are suggested, or null while none are. */
  readonly field: string | null;
};

/** The facets the values are suggested from; none while no field is. */
export type UseSuggestedFacetsResult = UseFacetsResult;
