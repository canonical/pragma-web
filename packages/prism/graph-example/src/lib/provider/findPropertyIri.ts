import type { ExampleDataset } from "./types.js";

/**
 * The property IRI a record key is stated with, by its local name. Pure.
 *
 * @param key - The record key, the property's local name.
 * @param dataset - The dataset whose properties are searched.
 * @returns The property's absolute IRI.
 * @throws When the dataset declares no property of that name: every value
 *   a record holds is stated through a declared property.
 */
export default function findPropertyIri(
  key: string,
  dataset: ExampleDataset,
): string {
  const property = dataset.properties.find(({ uri }) =>
    uri.endsWith(`#${key}`),
  );
  if (property === undefined) {
    throw new Error(`the dataset declares no property named ${key}`);
  }
  return property.uri;
}
