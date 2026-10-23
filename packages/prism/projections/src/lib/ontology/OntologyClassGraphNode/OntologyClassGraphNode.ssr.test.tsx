// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  MOCK_ONTOLOGY_CLASS,
  MOCK_ONTOLOGY_CLASS_HREF,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import ssrTestQuery, {
  type OntologyClassGraphNodeSsrTestQuery,
} from "../../../__generated__/OntologyClassGraphNodeSsrTestQuery.graphql.js";
import OntologyClassGraphNode from "./OntologyClassGraphNode.js";

/**
 * The operation the SSR test renders OntologyClassGraphNode under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query OntologyClassGraphNodeSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...OntologyClassGraphNode_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render OntologyClassGraphNode over the
 * OntologyClass it returns.
 */
const OntologyClassGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassGraphNodeSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.OntologyClassGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyClass");
  }
  return (
    <svg aria-label="Graph" role="img">
      <OntologyClassGraphNode node={node} />
    </svg>
  );
};

describe("OntologyClassGraphNode SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_ONTOLOGY_CLASS),
      }),
    );
    const html = renderToString(
      createSiteTree(environment, <OntologyClassGraphNodeSsrTestNode />),
    );
    expect(html).toContain("ds entity-graph-node ds ontology-class-graph-node");
    expect(html).toContain('data-type="OntologyClass"');
    expect(html).toContain(`href="${MOCK_ONTOLOGY_CLASS_HREF}"`);
  });
});
