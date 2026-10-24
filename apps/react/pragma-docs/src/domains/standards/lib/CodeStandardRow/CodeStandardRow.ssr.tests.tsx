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
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import ssrTestQuery, {
  type CodeStandardRowSsrTestQuery,
} from "../../../../relay/__generated__/CodeStandardRowSsrTestQuery.graphql.js";
import CodeStandardRow from "./CodeStandardRow.js";

/**
 * The operation the SSR test renders CodeStandardRow under: one CodeStandard,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query CodeStandardRowSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...CodeStandardRow_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render CodeStandardRow over the CodeStandard
 * it returns.
 */
const CodeStandardRowSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardRowSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.CodeStandardRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no CodeStandard");
  }
  return <CodeStandardRow node={node} />;
};

describe("CodeStandardRow SSR", () => {
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
      createSiteTree(environment, <CodeStandardRowSsrTestNode />),
    );
    expect(html).toContain("ds entity-row ds code-standard-row");
    expect(html).toContain('data-type="CodeStandard"');
    expect(html).toContain(`href="${MOCK_CODE_STANDARD_HREF}"`);
  });
});
