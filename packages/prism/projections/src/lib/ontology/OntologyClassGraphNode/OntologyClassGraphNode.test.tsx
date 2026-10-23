// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  MOCK_ONTOLOGY_CLASS,
  MOCK_ONTOLOGY_CLASS_HREF,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import testQuery, {
  type OntologyClassGraphNodeTestQuery,
} from "../../../__generated__/OntologyClassGraphNodeTestQuery.graphql.js";
import OntologyClassGraphNode from "./OntologyClassGraphNode.js";
import type { OntologyClassGraphNodeProps } from "./types.js";

/**
 * The operation the tests render OntologyClassGraphNode under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query OntologyClassGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...OntologyClassGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the fragment key it returns. */
const OntologyClassGraphNodeTestNode = ({
  children,
}: {
  children: (node: OntologyClassGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.OntologyClassGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyClass");
  }
  return children(node);
};

/**
 * Render `children` with the key of the OntologyClass a Relay mock environment
 * answers, under the site's providers: `entity` over the matrix's abstract
 * class Layout.
 */
const renderWithNode = (
  children: (node: OntologyClassGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_ONTOLOGY_CLASS, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <OntologyClassGraphNodeTestNode>
        {children}
      </OntologyClassGraphNodeTestNode>,
    ),
  );
};

describe("OntologyClassGraphNode", () => {
  it("reads the OntologyClass through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <OntologyClassGraphNode node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.ontology-class-graph-node"),
    ).toHaveAttribute("data-type", "OntologyClass");
  });

  it("fills the node's lines from the class", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <OntologyClassGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".title")?.textContent).toBe("ds:Layout");
    expect(container.querySelector(".context")?.textContent).toBe(
      "Abstract class in ds",
    );
    expect(container.querySelector(".link")?.getAttribute("href")).toBe(
      MOCK_ONTOLOGY_CLASS_HREF,
    );
  });

  it("names a concrete class whose address did not compact as a class", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <OntologyClassGraphNode node={node} />
        </svg>
      ),
      {
        isAbstract: false,
        _meta: { title: "Layout", curie: "https://ds.canonical.com/Layout" },
      },
    );
    expect(container.querySelector(".context")?.textContent).toBe("Class");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <OntologyClassGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container
        .querySelector(".ds.ontology-class-graph-node")
        ?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds ontology-class-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <OntologyClassGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
