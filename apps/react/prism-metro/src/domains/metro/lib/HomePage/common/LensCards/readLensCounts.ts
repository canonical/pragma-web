import type { MetroHomeQuery$data } from "../../../../homeQuery.js";
import type { LensCounts } from "../../../../types.js";

/**
 * Read one count per lens from the landing's data: the network lens counts
 * the interchanges where its lines meet, each entity lens counts its
 * class's instances, and a class the graph does not know counts 0
 * (`ontologyClass` is nullable by schema); Definitions counts the classes
 * of every ontology, the denominator the Definitions lens itself states.
 *
 * @param data - The landing's query data.
 * @returns The count of each lens, by its route name.
 */
export default function readLensCounts(data: MetroHomeQuery$data): LensCounts {
  return {
    network: data.interchanges?.instanceCount ?? 0,
    stations: data.stations?.instanceCount ?? 0,
    lines: data.lines?.instanceCount ?? 0,
    definitions: data.ontologies.reduce(
      (total, ontology) => total + ontology.classes.length,
      0,
    ),
  };
}
