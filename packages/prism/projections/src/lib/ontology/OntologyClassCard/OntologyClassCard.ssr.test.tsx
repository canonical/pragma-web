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
  type OntologyClassCardSsrTestQuery,
} from "../../../__generated__/OntologyClassCardSsrTestQuery.graphql.js";
import OntologyClassCard from "./OntologyClassCard.js";

/**
 * The operation the SSR test renders OntologyClassCard under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query OntologyClassCardSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...OntologyClassCard_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render OntologyClassCard over the
 * OntologyClass it returns.
 */
const OntologyClassCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassCardSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.OntologyClassCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyClass");
  }
  return <OntologyClassCard node={node} />;
};

describe("OntologyClassCard SSR", () => {
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
      createSiteTree(environment, <OntologyClassCardSsrTestNode />),
    );
    expect(html).toContain("ds card ds entity-card ds ontology-class-card");
    expect(html).toContain('data-type="OntologyClass"');
    expect(html).toContain(`href="${MOCK_ONTOLOGY_CLASS_HREF}"`);
  });
});
