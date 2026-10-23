// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import ssrTestQuery, {
  type InterchangeChipSsrTestQuery,
} from "../../../../relay/__generated__/InterchangeChipSsrTestQuery.graphql.js";
import InterchangeChip from "./InterchangeChip.js";

/**
 * The operation the SSR test renders InterchangeChip under: one Interchange,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query InterchangeChipSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...InterchangeChip_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render InterchangeChip over the Interchange it
 * returns.
 */
const InterchangeChipSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<InterchangeChipSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.InterchangeChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Interchange");
  }
  return <InterchangeChip node={node} />;
};

describe("InterchangeChip SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_INTERCHANGE),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <InterchangeChipSsrTestNode />),
    );
    expect(html).toContain('class="ds entity-chip ds interchange-chip"');
    expect(html).toContain('href="/stations/metro%3Acentral-exchange"');
  });
});
