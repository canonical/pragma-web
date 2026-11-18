import { KeyValueList } from "@canonical/prism-core";
import type { ReactElement } from "react";
import type { Translate } from "#i18n";
import listFleetFacts, { type FleetPageNode } from "./listFleetFacts.js";

/**
 * Render the facts a fleet page records about its node as the sectioned
 * view's facts: a key and value list, a pair for each fact, keyed by its
 * term, in the order `listFleetFacts` reads them.
 *
 * @param node - The node a fleet page's operation answered with.
 * @param t - The translator the facts' words are read through.
 * @returns The list, or `undefined` when the node records no fact, so the
 *   view leaves no facts region.
 */
export default function renderFleetFacts(
  node: NonNullable<FleetPageNode>,
  t: Translate,
): ReactElement | undefined {
  const facts = listFleetFacts(node, t);
  return facts.length === 0 ? undefined : (
    <KeyValueList
      pairs={facts.map(({ term, value }) => ({ id: term, term, value }))}
    />
  );
}
