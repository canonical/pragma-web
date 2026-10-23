import type { QueryFn } from "@canonical/ke-graphql";
import { describe, expect, it } from "vitest";
import { bootCorpusSchema } from "../../testing/bootCorpusSchema.js";
import { buildProbeSchema } from "../../testing/buildProbeSchema.js";
import { indexSearch } from "./indexSearch.js";

const DS = "https://design.example.org/ontology#";

describe("indexSearch", () => {
  const booted = bootCorpusSchema();

  it("reads each node's title, CURIE and definition as _meta serves them", async () => {
    const index = await indexSearch(await booted);
    expect(index).toContainEqual({
      uri: `${DS}card`,
      title: "Card",
      curie: "ds:card",
      definition: "A surface grouping a title, a summary and actions.",
    });
    expect(index).toContainEqual({
      uri: `${DS}scorecard`,
      title: "Scorecard",
      curie: "ds:scorecard",
      definition: null,
    });
  });

  it("indexes classes as well as their instances", async () => {
    const uris = (await indexSearch(await booted)).map((entry) => entry.uri);
    expect(uris).toEqual(
      expect.arrayContaining([
        `${DS}Component`,
        `${DS}button`,
        "sem://surface#Job",
      ]),
    );
  });

  it("leaves out what node(id:) does not resolve, such as a property", async () => {
    const uris = (await indexSearch(await booted)).map((entry) => entry.uri);
    expect(uris).not.toContain(`${DS}tier`);
    expect(uris).not.toContain("sem://surface#jobLabel");
  });

  it("names the node whose read fails", async () => {
    const { context, query } = await booted;
    // Whatever it is asked, the store lists one IRI.
    const listing: QueryFn = () =>
      query("SELECT ?s WHERE { VALUES ?s { <urn:broken> } }");
    const schema = buildProbeSchema({
      resolveNode: () => {
        throw new Error("the store is gone");
      },
    });
    await expect(
      indexSearch({ schema, context, query: listing }),
    ).rejects.toThrow(
      'search index: node(id: "urn:broken") failed: the store is gone',
    );
  });
});
