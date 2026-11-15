import { indexSiteLens } from "@canonical/prism-contract";
import { describe, expect, it } from "vitest";
import { exampleDataset } from "./dataset.js";
import { outlineDataset } from "./outlineDataset.js";
import { siteLens } from "./siteLens.js";

describe("siteLens", () => {
  const index = indexSiteLens(siteLens, outlineDataset(exampleDataset));

  it("names only terms the metro's TBox holds", () => {
    expect(index.unknownIris).toEqual([]);
  });

  it("gives every class with instances a plural label", () => {
    const typed = new Set(exampleDataset.entities.map((entity) => entity.type));
    expect(
      [...typed].filter(
        (uri) => index.classLens(uri).pluralLabels.en === undefined,
      ),
    ).toEqual([]);
  });
});
