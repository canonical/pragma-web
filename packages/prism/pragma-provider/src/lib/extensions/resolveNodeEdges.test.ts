import { toBase64 } from "@canonical/ke-graphql";
import { graphql } from "graphql";
import { describe, expect, it } from "vitest";
import { buildProbeSchema } from "../../testing/buildProbeSchema.js";
import { resolveNodeEdges } from "./resolveNodeEdges.js";

/** The IRIs the probe schema's `node` resolver knows. */
const KNOWN = new Set(["urn:a", "urn:b"]);

/** The selection every case reads. */
const EDGES_QUERY = `query Edges($iris: [ID!]!) {
  edges(iris: $iris) { cursor node { uri } }
}`;

describe("resolveNodeEdges", () => {
  /** Run `EDGES_QUERY` against a probe schema, with or without `node`. */
  const resolve = (iris: readonly string[], withNode = true) =>
    graphql({
      schema: buildProbeSchema({
        resolveNode: withNode
          ? (id) => (KNOWN.has(id) ? { uri: id } : null)
          : undefined,
        resolveEdges: resolveNodeEdges,
      }),
      source: EDGES_QUERY,
      variableValues: { iris },
      contextValue: {},
    });

  it("keeps the order of the IRIs and drops those that resolve to null", async () => {
    const result = await resolve(["urn:b", "urn:missing", "urn:a"]);
    expect(result).toEqual({
      data: {
        edges: [
          { cursor: toBase64("urn:b"), node: { uri: "urn:b" } },
          { cursor: toBase64("urn:a"), node: { uri: "urn:a" } },
        ],
      },
    });
  });

  it("writes each cursor as the base64 of its IRI", async () => {
    const result = await resolve(["urn:a"]);
    expect(result.data).toEqual({
      edges: [{ cursor: "dXJuOmE=", node: { uri: "urn:a" } }],
    });
  });

  it("gives no edges for no IRIs", async () => {
    expect(await resolve([])).toEqual({ data: { edges: [] } });
  });

  it("refuses a schema without Query.node", async () => {
    const result = await resolve(["urn:a"], false);
    expect(result.errors?.map((error) => error.message)).toEqual([
      "the schema has no Query.node resolver to resolve nodes through",
    ]);
  });
});
