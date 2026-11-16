/** The query bar's hook types: each hook's props and result. */
import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { Dispatch, RefObject } from "react";
import type {
  QueryBarSession,
  QueryBarSessionAction,
  QueryGroupStandIn,
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
