import type { Collection } from "@canonical/dataviews-core";

/** Each column list `createColumns` returned, weakly paired with its collection. */
const COLUMN_COLLECTIONS = new WeakMap<object, Pick<Collection, "schema">>();

/**
 * Read the registry of declared column lists: the same map on every call.
 *
 * @note Impure: the registry is module state that `createColumns` writes.
 */
export default function readColumnRegistry(): WeakMap<
  object,
  Pick<Collection, "schema">
> {
  return COLUMN_COLLECTIONS;
}
