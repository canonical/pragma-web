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
  type OntologyPropertyChipSsrTestQuery,
} from "../../../__generated__/OntologyPropertyChipSsrTestQuery.graphql.js";
import OntologyPropertyChip from "./OntologyPropertyChip.js";

/**
 * The operation the SSR test renders OntologyPropertyChip under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query OntologyPropertyChipSsrTestQuery @relay_test_operation {
    ontologyProperty(uri: "ssr") {
      ...OntologyPropertyChip_node
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render OntologyPropertyChip over the
 * OntologyProperty it returns.
 */
const OntologyPropertyChipSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyChipSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.ontologyProperty;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyProperty");
  }
  return <OntologyPropertyChip node={node} />;
};

describe("OntologyPropertyChip SSR", () => {
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
      createSiteTree(environment, <OntologyPropertyChipSsrTestNode />),
    );
    expect(html).toContain("ds entity-chip ds ontology-property-chip");
    expect(html).toContain('data-type="OntologyProperty"');
    expect(html).toContain(`href="${MOCK_ONTOLOGY_PROPERTY_HREF}"`);
  });
});
