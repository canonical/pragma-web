import type { ReactElement } from "react";
import { ExplorerControls } from "../../../ExplorerControls/index.js";
import useStripQuery from "../../hooks/useStripQuery.js";

/**
 * The strip's `controls` tenant: the filter chips over the ontologies the
 * graph carries. The ontologies are labelled by their own prefixes, the
 * vocabulary readers already meet in term addresses, so nothing here invents
 * a display name the graph does not have.
 *
 * `import { Controls } from "./common/Controls/index.js";`
 *
 * @note Impure: reads the Relay store, the router and the filter context
 *   through `useStripQuery`, and suspends while the store does not hold the
 *   operation.
 */
export default function Controls(): ReactElement {
  const { filter, prefixes, setFilter } = useStripQuery();
  return (
    <ExplorerControls
      filter={filter}
      namespaceLabels={prefixes.map((prefix) => ({ prefix, label: prefix }))}
      onFilterChange={setFilter}
    />
  );
}
