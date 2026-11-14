import { indexSiteLens } from "@canonical/prism-contract";
import { graphql } from "graphql";
import { describe, expect, it } from "vitest";
import { createExampleProvider } from "../../lib/provider/createExampleProvider.js";
import { exampleDataset } from "../../lib/provider/dataset.js";
import { outlineDataset } from "../../lib/provider/outlineDataset.js";
import { siteLens } from "../../lib/provider/siteLens.js";

const provider = createExampleProvider();
const index = indexSiteLens(siteLens, outlineDataset(exampleDataset));
const hiddenClasses = exampleDataset.classes.filter(
  (cls) => index.classLens(cls.uri).visibility === "HIDDEN",
);

describe("hidden classes", () => {
  it("the metro hides at least one class with instances", () => {
    expect(
      hiddenClasses.filter((cls) =>
        exampleDataset.entities.some((entity) => entity.type === cls.uri),
      ),
    ).not.toEqual([]);
  });

  it.each(
    hiddenClasses.flatMap((cls) =>
      exampleDataset.entities
        .filter((entity) => entity.type === cls.uri)
        .map((entity) => [entity.uri, entity.labels?.[""] ?? entity.uri]),
    ),
  )("search never answers %s, even for its own title", async (uri, title) => {
    const result = await graphql({
      schema: provider.schema,
      rootValue: provider.rootValue,
      source:
        "query ($text: String!) { search(text: $text) { edges { node { uri } } } }",
      variableValues: { text: title },
    });
    expect(result.errors).toBeUndefined();
    const { search } = result.data as {
      search: { edges: { node: { uri: string } }[] };
    };
    expect(search.edges.map((edge) => edge.node.uri)).not.toContain(uri);
  });
});
