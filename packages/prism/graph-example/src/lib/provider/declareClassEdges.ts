import type { ClassEdgeDeclaration } from "@canonical/prism-contract";
import { expandCurie } from "./expandCurie.js";
import type { ExampleDataset } from "./types.js";

/**
 * The class edges the dataset's TBox declares: one per object property with
 * a domain and a range that is a class the TBox holds. A property without a
 * domain declares no edge, so its statements are served as undeclared edges.
 *
 * @param dataset - The dataset whose TBox is read.
 * @returns The declarations, in the order the TBox lists the properties.
 */
export const declareClassEdges = (
  dataset: ExampleDataset,
): readonly ClassEdgeDeclaration[] => {
  const classUris = new Set(dataset.classes.map((cls) => cls.uri));
  return dataset.properties.flatMap((property) => {
    const range = expandCurie(property.range, dataset.ontologies);
    return property.kind === "OBJECT" &&
      property.domain !== undefined &&
      classUris.has(range)
      ? [{ property: property.uri, domain: property.domain, range }]
      : [];
  });
};
