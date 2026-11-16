/** The query bar's hook types: each hook's props and result. */
import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { QueryGroupStandIn } from "../types.js";

/** What the query group's stand-in reads: the root's provider. */
export type UseQueryGroupProps = {
  readonly provider: DataViewsProvider<readonly SchemaFieldDefinition[]>;
};

/** The query group over the provider, at one identity per provider. */
export type UseQueryGroupResult = QueryGroupStandIn;
