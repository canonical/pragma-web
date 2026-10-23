// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  MOCK_ONTOLOGY_PROPERTY,
  MOCK_ONTOLOGY_PROPERTY_HREF,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import ssrTestQuery, {
  type OntologyPropertyGraphNodeSsrTestQuery,
} from "../../../__generated__/OntologyPropertyGraphNodeSsrTestQuery.graphql.js";
import OntologyPropertyGraphNode from "./OntologyPropertyGraphNode.js";

/**
 * The operation the SSR test renders OntologyPropertyGraphNode under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query OntologyPropertyGraphNodeSsrTestQuery @relay_test_operation {
    ontologyProperty(uri: "ssr") {
      ...OntologyPropertyGraphNode_node
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render OntologyPropertyGraphNode over the
 * OntologyProperty it returns.
 */
const OntologyPropertyGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyGraphNodeSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.ontologyProperty;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyProperty");
  }
  return (
    <svg aria-label="Graph" role="img">
      <OntologyPropertyGraphNode node={node} />
    </svg>
  );
};

describe("OntologyPropertyGraphNode SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        OntologyProperty: resolveRoot(MOCK_ONTOLOGY_PROPERTY),
      }),
    );
    const html = renderToString(
      createSiteTree(environment, <OntologyPropertyGraphNodeSsrTestNode />),
    );
    expect(html).toContain(
      "ds entity-graph-node ds ontology-property-graph-node",
    );
    expect(html).toContain('data-type="OntologyProperty"');
    expect(html).toContain(`href="${MOCK_ONTOLOGY_PROPERTY_HREF}"`);
  });
});
