import { describe, expect, it } from "vitest";
import { METRO_NAMESPACE as M } from "./constants.js";
import { exampleDataset } from "./dataset.js";
import { expandCurie } from "./expandCurie.js";

describe("expandCurie", () => {
  it("expands a declared prefix and passes an absolute IRI through", () => {
    expect(expandCurie("metro:Line", exampleDataset.ontologies)).toBe(
      `${M}Line`,
    );
    expect(expandCurie(`${M}Line`, exampleDataset.ontologies)).toBe(`${M}Line`);
  });
});
