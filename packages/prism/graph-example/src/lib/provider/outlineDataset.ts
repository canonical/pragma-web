import type { TBoxOutline } from "@canonical/prism-contract";
import type { ExampleDataset } from "./types.js";

/**
 * The outline of the dataset's TBox the site lens is resolved against: each
 * class with its direct superclass, and each property with its declared
 * inverse and its asserted labels.
 *
 * @param dataset - The dataset whose TBox is outlined.
 * @returns The classes' parents and the properties' inverses and labels.
 */
export const outlineDataset = (dataset: ExampleDataset): TBoxOutline => ({
  classes: dataset.classes.map((cls) => ({
    uri: cls.uri,
    parents: cls.superclass === undefined ? [] : [cls.superclass],
  })),
  properties: dataset.properties.map((property) => ({
    uri: property.uri,
    inverse: property.inverse,
    labels: property.labels,
  })),
});
