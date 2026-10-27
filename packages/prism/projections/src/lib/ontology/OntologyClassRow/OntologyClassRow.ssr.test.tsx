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
  type OntologyClassRowSsrTestQuery,
} from "../../../__generated__/OntologyClassRowSsrTestQuery.graphql.js";
import OntologyClassRow from "./OntologyClassRow.js";

/**
 * The operation the SSR test renders OntologyClassRow under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query OntologyClassRowSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...OntologyClassRow_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render OntologyClassRow over the OntologyClass
 * it returns.
 */
const OntologyClassRowSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassRowSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.OntologyClassRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyClass");
  }
  return (
    <ul>
      <OntologyClassRow node={node} />
    </ul>
  );
};

describe("OntologyClassRow SSR", () => {
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
      createSiteTree(environment, <OntologyClassRowSsrTestNode />),
    );
    expect(html).toContain("ds entity-row ds ontology-class-row");
    expect(html).toContain('data-type="OntologyClass"');
    expect(html).toContain(`href="${MOCK_ONTOLOGY_CLASS_HREF}"`);
  });
});
