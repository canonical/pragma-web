// =============================================================================
// The served graph holds no entity at a namespace IRI. The namespace is the
// ontology's own address: an instance there is listed among the stations as
// the ontology itself, titled with the whole IRI, compacted to a bare
// `metro:` and linked to a page for it.
// =============================================================================

import { type ExecutionResult, graphql } from "graphql";
import { describe, expect, it } from "vitest";
import { createExampleProvider } from "../../lib/provider/index.js";

const provider = createExampleProvider();

/** Execute against the served dataset and fail loudly on any GraphQL error. */
const run = async <T>(source: string): Promise<T> => {
  const result: ExecutionResult = await graphql({
    schema: provider.schema,
    source,
    rootValue: provider.rootValue,
  });
  expect(result.errors).toBeUndefined();
  return result.data as T;
};

/** Read the namespace IRI of every ontology the graph declares. */
const readNamespaces = async (): Promise<string[]> => {
  const data = await run<{ ontologies: { namespace: string }[] }>(
    "{ ontologies { namespace } }",
  );
  return data.ontologies.map((ontology) => ontology.namespace);
};

describe("0001 a station at the ontology's own address", () => {
  it("lists no station at a namespace IRI", async () => {
    const namespaces = await readNamespaces();
    const data = await run<{
      ontologyClass: { instances: { edges: { node: { uri: string } }[] } };
    }>(`{
      ontologyClass(uri: "metro:Station") {
        instances(first: 100) { edges { node { uri } } }
      }
    }`);
    const uris = data.ontologyClass.instances.edges.map(
      (edge) => edge.node.uri,
    );
    expect(uris.length).toBeGreaterThan(0);
    expect(uris.filter((uri) => namespaces.includes(uri))).toEqual([]);
  });

  it("resolves no node at a namespace IRI", async () => {
    const namespaces = await readNamespaces();
    expect(namespaces.length).toBeGreaterThan(0);
    for (const namespace of namespaces) {
      const data = await run<{ node: unknown }>(
        `{ node(id: "${namespace}") { uri } }`,
      );
      expect(data.node, namespace).toBeNull();
    }
  });
});
