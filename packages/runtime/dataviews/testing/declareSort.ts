import type { SourceCapabilities } from "../src/lib/source/index.js";

/** A sort block over the given fields, limited to `terms` (none by default) and undocumented. */
export default function declareSort(
  fields: readonly string[],
  terms: number | null = null,
): SourceCapabilities["sort"] {
  return {
    fields,
    terms,
    default: [],
    tiebreak: "opaque",
    empties: {},
    collation: null,
  };
}
