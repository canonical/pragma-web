import { describe, expect, it } from "vitest";
import { GEO_NAMESPACE as G, METRO_NAMESPACE as M } from "./constants.js";
import { exampleDataset } from "./dataset.js";
import { outlineDataset } from "./outlineDataset.js";

describe("outlineDataset", () => {
  const outline = outlineDataset(exampleDataset);

  it("gives each class its direct superclass as its one parent", () => {
    expect(outline.classes).toContainEqual({
      uri: `${M}Interchange`,
      parents: [`${M}Station`],
    });
    expect(outline.classes).toContainEqual({ uri: `${M}Line`, parents: [] });
  });

  it("gives each property its declared inverse and its labels", () => {
    expect(outline.properties).toContainEqual({
      uri: `${G}inZone`,
      inverse: `${G}stops`,
      labels: { "": "in zone" },
    });
  });
});
