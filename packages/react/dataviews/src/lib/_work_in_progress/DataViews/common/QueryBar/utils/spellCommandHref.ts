import {
  applyQueryCommand,
  type QueryCommand,
} from "@canonical/dataviews-core/bindings";
import type { QueryGroupStandIn } from "../types.js";

/**
 * Where a command leads without scripts: the address of the query it would
 * make of the one that applies, or null where the location spells none.
 * A refused clause the address carries is carried on, so following the
 * link never widens the query. Read once, as rendered: such a link is
 * drawn only before scripts run, when nothing moves the query under it.
 *
 * @param group - The query group.
 * @param command - The command a link stands for.
 * @returns The address, or null.
 */
export default function spellCommandHref(
  group: Pick<QueryGroupStandIn, "state" | "spellHref">,
  command: QueryCommand,
): string | null {
  const { slice, window } = group.state.get();
  const next = applyQueryCommand(slice, window, command);
  return group.spellHref({ slice: next.slice, window: next.window });
}
