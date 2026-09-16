import type {
  FilterHandles,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { WidestFilters } from "./types.js";

/**
 * Take a root's stored filter handles back at the collection's own types.
 *
 * The handles are keyed by field and operator, so they are erased by the
 * context and restored by the same proof the provider is: the caller has
 * checked that the root was built over the collection it is naming, as
 * `narrowRootProvider` requires.
 */
export default function narrowRootFilters<
  TFields extends readonly SchemaFieldDefinition[],
>(filters: WidestFilters): FilterHandles<TFields> {
  return filters as unknown as FilterHandles<TFields>;
}
