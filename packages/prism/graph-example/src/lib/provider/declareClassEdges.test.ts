import { describe, expect, it } from "vitest";
import { GEO_NAMESPACE as G, METRO_NAMESPACE as M } from "./constants.js";
import { exampleDataset } from "./dataset.js";
import { declareClassEdges } from "./declareClassEdges.js";

describe("declareClassEdges", () => {
  const declarations = declareClassEdges(exampleDataset);

  it("declares an edge per object property with a domain and a class range", () => {
    expect(declarations).toContainEqual({
      property: `${G}inZone`,
      domain: `${M}Station`,
      range: `${G}Zone`,
    });
    expect(declarations).toHaveLength(16);
  });

  it("declares none for a property without a domain or a datatype range", () => {
    const properties = declarations.map((declaration) => declaration.property);
    expect(properties).not.toContain(`${M}formations`);
    expect(properties).not.toContain(`${M}platformCount`);
  });

  it("declares none for a range the TBox does not hold", () => {
    expect(
      declareClassEdges({
        ...exampleDataset,
        properties: [
          {
            uri: "urn:p",
            domain: `${M}Line`,
            range: "urn:Missing",
            kind: "OBJECT",
            functional: false,
          },
        ],
      }),
    ).toEqual([]);
  });
});
