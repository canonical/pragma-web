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
  type CodeStandardCardSsrTestQuery,
} from "../../../../relay/__generated__/CodeStandardCardSsrTestQuery.graphql.js";
import CodeStandardCard from "./CodeStandardCard.js";

/**
 * The operation the SSR test renders CodeStandardCard under: one CodeStandard,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query CodeStandardCardSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...CodeStandardCard_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render CodeStandardCard over the CodeStandard
 * it returns.
 */
const CodeStandardCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardCardSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.CodeStandardCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no CodeStandard");
  }
  return <CodeStandardCard node={node} />;
};

describe("CodeStandardCard SSR", () => {
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
      createSiteTree(environment, <CodeStandardCardSsrTestNode />),
    );
    expect(html).toContain("ds card ds entity-card ds code-standard-card");
    expect(html).toContain('data-type="CodeStandard"');
    expect(html).toContain(`href="${MOCK_CODE_STANDARD_HREF}"`);
  });
});
