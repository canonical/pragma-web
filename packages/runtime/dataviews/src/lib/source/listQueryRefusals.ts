import { canonicalizeSlice, type Query } from "../query/index.js";
import type { SourceRefusal } from "../result/index.js";
import createRefusal from "./createRefusal.js";
import listFilterRefusals from "./listFilterRefusals.js";
import listGroupRefusals from "./listGroupRefusals.js";
import listSortRefusals from "./listSortRefusals.js";
import listWindowRefusals from "./listWindowRefusals.js";
import type { SourceCapabilities } from "./types.js";

/**
 * Decide whether a source can execute a request from its declaration
 * alone, collecting one structured refusal per unexecutable term. Pure, so
 * a refusal costs no round trip, and total, so a control sees every reason
 * at once rather than the first.
 *
 * Sort and group are all-or-nothing over their terms: an ordering carrying
 * one unsupported term is refused whole, never truncated. What a
 * declaration cannot express — which cursor pages are reachable, which
 * combinations one endpoint rejects — is the source's own `listRefusals`, and
 * the binding runs both.
 */
export default function listQueryRefusals(
  capabilities: SourceCapabilities,
  query: Query,
): readonly SourceRefusal[] {
  // Canonicalizing first fixes the order, so one query always produces the
  // same refusals.
  const slice = canonicalizeSlice(query.slice);
  return Object.freeze([
    ...listFilterRefusals(capabilities.filter, slice.filter),
    ...(slice.search !== null && capabilities.search === null
      ? [
          createRefusal(
            "search",
            "undeclared-field",
            "this source cannot search",
          ),
        ]
      : []),
    ...listSortRefusals(capabilities.sort, slice.sort),
    ...listGroupRefusals(capabilities.group, slice.group),
    ...listWindowRefusals(capabilities, query.window),
  ]);
}
