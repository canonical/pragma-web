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
  type OntologyClassChipSsrTestQuery,
} from "../../../__generated__/OntologyClassChipSsrTestQuery.graphql.js";
import OntologyClassChip from "./OntologyClassChip.js";

/**
 * The operation the SSR test renders OntologyClassChip under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query OntologyClassChipSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...OntologyClassChip_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render OntologyClassChip over the
 * OntologyClass it returns.
 */
const OntologyClassChipSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassChipSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.OntologyClassChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyClass");
  }
  return <OntologyClassChip node={node} />;
};

describe("OntologyClassChip SSR", () => {
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
      createSiteTree(environment, <OntologyClassChipSsrTestNode />),
    );
    expect(html).toContain("ds entity-chip ds ontology-class-chip");
    expect(html).toContain('data-type="OntologyClass"');
    expect(html).toContain(`href="${MOCK_ONTOLOGY_CLASS_HREF}"`);
  });
});
