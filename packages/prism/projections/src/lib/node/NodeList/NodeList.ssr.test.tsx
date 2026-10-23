// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  MOCK_NODE,
  MOCK_ONTOLOGY_CLASS,
  MOCK_ONTOLOGY_CLASS_HREF,
} from "../../../../testing/fixtures.js";
import ssrTestQuery, {
  type NodeListSsrTestQuery,
} from "../../../__generated__/NodeListSsrTestQuery.graphql.js";
import NodeList from "./NodeList.js";

/**
 * The operation the SSR test renders NodeList under: the instances of one
 * class, read through the class's connection.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query NodeListSsrTestQuery @relay_test_operation {
    ontologyClass(uri: "ssr") {
      instances {
        edges {
          node {
            ...NodeList_node
          }
        }
      }
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render NodeList over the nodes it returns. */
const NodeListSsrTestNodes = (): ReactElement => {
  const data = useLazyLoadQuery<NodeListSsrTestQuery>(ssrTestQuery, {});
  const edges = data.ontologyClass?.instances.edges;
  if (!edges) {
    throw new Error("the mock environment resolved no instances");
  }
  return <NodeList nodes={edges.map(({ node }) => node)} view="rows" />;
};

describe("NodeList SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        NodeConnection: () => ({
          edges: [
            {
              node: {
                ...MOCK_NODE,
                uri: "https://ds.canonical.com/IconButton",
              },
            },
            {
              node: {
                ...MOCK_ONTOLOGY_CLASS,
                uri: "https://ds.canonical.com/Layout",
              },
            },
          ],
        }),
      }),
    );
    const html = renderToString(
      createSiteTree(environment, <NodeListSsrTestNodes />),
    );
    expect(html).toContain("ds entity-list ds node-list");
    expect(html).toContain("ds entity-row ds ontology-class-row");
    expect(html).toContain(`href="${MOCK_ONTOLOGY_CLASS_HREF}"`);
  });
});
