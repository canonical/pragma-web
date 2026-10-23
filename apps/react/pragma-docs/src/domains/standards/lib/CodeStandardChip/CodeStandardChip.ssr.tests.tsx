// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import {
  MOCK_CODE_STANDARD,
  MOCK_CODE_STANDARD_HREF,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import ssrTestQuery, {
  type CodeStandardChipSsrTestQuery,
} from "../../../../relay/__generated__/CodeStandardChipSsrTestQuery.graphql.js";
import CodeStandardChip from "./CodeStandardChip.js";

/**
 * The operation the SSR test renders CodeStandardChip under: one CodeStandard,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query CodeStandardChipSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...CodeStandardChip_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render CodeStandardChip over the CodeStandard
 * it returns.
 */
const CodeStandardChipSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardChipSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.CodeStandardChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no CodeStandard");
  }
  return <CodeStandardChip node={node} />;
};

describe("CodeStandardChip SSR", () => {
  it("renders its title as a link to the standard's reading page", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_CODE_STANDARD),
      }),
    );
    const html = renderToString(
      createSiteTree(environment, <CodeStandardChipSsrTestNode />),
    );
    expect(html).toContain("ds entity-chip ds code-standard-chip");
    expect(html).toContain('data-type="CodeStandard"');
    expect(html).toContain(`href="${MOCK_CODE_STANDARD_HREF}"`);
  });
});
