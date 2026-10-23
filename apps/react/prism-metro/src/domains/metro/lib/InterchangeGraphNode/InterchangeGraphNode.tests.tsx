// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import testQuery, {
  type InterchangeGraphNodeTestQuery,
} from "../../../../relay/__generated__/InterchangeGraphNodeTestQuery.graphql.js";
import InterchangeGraphNode from "./InterchangeGraphNode.js";
import type { InterchangeGraphNodeProps } from "./types.js";

/**
 * The operation the tests render InterchangeGraphNode under: one Interchange,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query InterchangeGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...InterchangeGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const InterchangeGraphNodeTestNode = ({
  children,
}: {
  children: (node: InterchangeGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<InterchangeGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.InterchangeGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Interchange");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Interchange a Relay mock environment
 * answers, under the site's providers: `entity` over Central Exchange, as the
 * graph's dataset holds it.
 */
const renderWithNode = (
  children: (node: InterchangeGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_INTERCHANGE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <InterchangeGraphNodeTestNode>{children}</InterchangeGraphNodeTestNode>,
    ),
  );
};

describe("InterchangeGraphNode", () => {
  it("reads the Interchange through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <InterchangeGraphNode node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.interchange-graph-node"),
    ).toHaveAttribute("data-type", "Interchange");
  });

  it("fills the node's lines from the interchange", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <InterchangeGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".title")?.textContent).toBe(
      "Central Exchange",
    );
    expect(container.querySelector(".context")?.textContent).toBe(
      "Interchange in Central Zone",
    );
  });

  it("links its title to the interchange's page", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <InterchangeGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".link")?.getAttribute("href")).toBe(
      "/stations/metro%3Acentral-exchange",
    );
  });

  it("names its class alone for an interchange in no zone", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <InterchangeGraphNode node={node} />
        </svg>
      ),
      {
        inZone: null,
      },
    );
    expect(container.querySelector(".context")?.textContent).toBe(
      "Interchange",
    );
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <InterchangeGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container
        .querySelector(".ds.interchange-graph-node")
        ?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds interchange-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <InterchangeGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
