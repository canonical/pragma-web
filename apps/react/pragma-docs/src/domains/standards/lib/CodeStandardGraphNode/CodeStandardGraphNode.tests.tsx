// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import {
  MOCK_CODE_STANDARD,
  MOCK_CODE_STANDARD_HREF,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type CodeStandardGraphNodeTestQuery,
} from "../../../../relay/__generated__/CodeStandardGraphNodeTestQuery.graphql.js";
import CodeStandardGraphNode from "./CodeStandardGraphNode.js";
import type { CodeStandardGraphNodeProps } from "./types.js";

/**
 * The operation the tests render CodeStandardGraphNode under: one CodeStandard,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CodeStandardGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...CodeStandardGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const CodeStandardGraphNodeTestNode = ({
  children,
}: {
  children: (node: CodeStandardGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.CodeStandardGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no CodeStandard");
  }
  return children(node);
};

/**
 * Render `children` with the key of the CodeStandard a Relay mock environment
 * answers, under the site's providers: `entity` over the standard on public and
 * private subcomponent exports.
 */
const renderWithNode = (
  children: (node: CodeStandardGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_CODE_STANDARD, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <CodeStandardGraphNodeTestNode>{children}</CodeStandardGraphNodeTestNode>,
    ),
  );
};

describe("CodeStandardGraphNode", () => {
  it("reads the CodeStandard through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <CodeStandardGraphNode node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.code-standard-graph-node"),
    ).toHaveAttribute("data-type", "CodeStandard");
  });

  it("fills the node's lines from the standard", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <CodeStandardGraphNode node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".title tspan.identifier")?.textContent,
    ).toBe("cs:react.component.subcomponent_export_api");
    expect(container.querySelector(".context")?.textContent).toBe(
      "Code Standard in cs",
    );
    expect(container.querySelector(".link")?.getAttribute("href")).toBe(
      MOCK_CODE_STANDARD_HREF,
    );
  });

  it("names its class alone when the standard's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <CodeStandardGraphNode node={node} />
        </svg>
      ),
      {
        _meta: {
          ...MOCK_CODE_STANDARD._meta,
          curie:
            "http://pragma.canonical.com/codestandards#react.component.subcomponent_export_api",
        },
      },
    );
    expect(container.querySelector(".context")?.textContent).toBe(
      "Code Standard",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <CodeStandardGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container
        .querySelector(".ds.code-standard-graph-node")
        ?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds code-standard-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <CodeStandardGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
