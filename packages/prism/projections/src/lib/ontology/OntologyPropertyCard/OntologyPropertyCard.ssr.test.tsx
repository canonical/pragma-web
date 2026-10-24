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
  type OntologyPropertyCardSsrTestQuery,
} from "../../../__generated__/OntologyPropertyCardSsrTestQuery.graphql.js";
import OntologyPropertyCard from "./OntologyPropertyCard.js";

/**
 * The operation the SSR test renders OntologyPropertyCard under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query OntologyPropertyCardSsrTestQuery @relay_test_operation {
    ontologyProperty(uri: "ssr") {
      ...OntologyPropertyCard_node
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render OntologyPropertyCard over the
 * OntologyProperty it returns.
 */
const OntologyPropertyCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyCardSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.ontologyProperty;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyProperty");
  }
  return <OntologyPropertyCard node={node} />;
};

describe("OntologyPropertyCard SSR", () => {
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
      createSiteTree(environment, <OntologyPropertyCardSsrTestNode />),
    );
    expect(html).toContain("ds card ds entity-card ds ontology-property-card");
    expect(html).toContain('data-type="OntologyProperty"');
    expect(html).toContain(`href="${MOCK_ONTOLOGY_PROPERTY_HREF}"`);
  });
});
