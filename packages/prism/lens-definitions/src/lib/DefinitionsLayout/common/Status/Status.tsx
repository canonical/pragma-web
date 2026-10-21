import type { ReactElement } from "react";
import { ExplorerStatus } from "../../../ExplorerStatus/index.js";
import { classifyAbstraction, matchesChips } from "../../../lensFilter.js";
import useStripQuery from "../../hooks/useStripQuery.js";

/**
 * The strip's `status` tenant: how many classes the current filter shows, out
 * of how many exist, and how many of those are abstract. It counts with the
 * SAME predicate the well hides by, over the same query data and the same
 * resolved filter, so the figure and the graph cannot disagree.
 *
 * `import { Status } from "./common/Status/index.js";`
 */
export default function Status(): ReactElement {
  const { filter, ontologies } = useStripQuery();
  const census = ontologies.flatMap((ontology) =>
    ontology.classes.map((klass) => ({
      prefix: ontology.prefix,
      isAbstract: klass.isAbstract,
    })),
  );
  const visible = census.filter((entry) =>
    matchesChips(filter, entry.isAbstract, entry.prefix),
  );
  const abstractCount = visible.filter(
    (entry) => classifyAbstraction(entry.isAbstract) === "abstract",
  ).length;

  return (
    <ExplorerStatus
      abstract={abstractCount}
      total={census.length}
      visible={visible.length}
    />
  );
}
