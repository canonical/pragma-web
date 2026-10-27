// @vitest-environment node

import { describe, expect, it } from "vitest";
import type { MetroHomeQuery$data } from "../../../../homeQuery.js";
import readLensCounts from "./readLensCounts.js";

/** The landing's data with the given classes and ontologies. */
const buildData = (
  stations: number | null,
  lines: number | null,
  fleet: number | null,
  classesPerOntology: readonly number[],
): MetroHomeQuery$data => ({
  stations:
    stations === null
      ? null
      : { uri: "metro:Station", instanceCount: stations },
  lines: lines === null ? null : { uri: "metro:Line", instanceCount: lines },
  fleet:
    fleet === null ? null : { uri: "metro:RollingStock", instanceCount: fleet },
  ontologies: classesPerOntology.map((count, index) => ({
    prefix: `ontology${index}`,
    classes: Array.from({ length: count }, (_, position) => ({
      uri: `ontology${index}:Class${position}`,
    })),
  })),
});

describe("readLensCounts", () => {
  it("reads each class's instances and sums every ontology's classes", () => {
    expect(readLensCounts(buildData(16, 3, 3, [7, 2]))).toEqual({
      stations: 16,
      lines: 3,
      definitions: 9,
      fleet: 3,
    });
  });

  it("counts 0 for a class the graph does not know", () => {
    expect(readLensCounts(buildData(null, null, null, [1]))).toEqual({
      stations: 0,
      lines: 0,
      definitions: 1,
      fleet: 0,
    });
  });

  it("counts no definitions when the graph loads no ontology", () => {
    expect(readLensCounts(buildData(1, 1, 1, [])).definitions).toBe(0);
  });
});
