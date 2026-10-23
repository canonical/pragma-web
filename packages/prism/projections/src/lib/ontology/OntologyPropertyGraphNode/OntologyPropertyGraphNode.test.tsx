// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  MOCK_ONTOLOGY_PROPERTY,
  MOCK_ONTOLOGY_PROPERTY_HREF,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import testQuery, {
  type OntologyPropertyGraphNodeTestQuery,
} from "../../../__generated__/OntologyPropertyGraphNodeTestQuery.graphql.js";
import OntologyPropertyGraphNode from "./OntologyPropertyGraphNode.js";
import type { OntologyPropertyGraphNodeProps } from "./types.js";

/**
 * The operation the tests render OntologyPropertyGraphNode under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareTestQuery = (): unknown => graphql`
  query OntologyPropertyGraphNodeTestQuery @relay_test_operation {
    ontologyProperty(uri: "test") {
      ...OntologyPropertyGraphNode_node
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the fragment key it returns. */
const OntologyPropertyGraphNodeTestNode = ({
  children,
}: {
  children: (node: OntologyPropertyGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyGraphNodeTestQuery>(
    testQuery,
    {},
  );
  const node = data.ontologyProperty;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyProperty");
  }
  return children(node);
};

/**
 * Render `children` with the key of the OntologyProperty a Relay mock
 * environment answers, under the site's providers: `entity` over the matrix's
 * object property `modifier`. `unvalidated` is written over the answer after it
 * is generated.
 */
const renderWithNode = (
  children: (node: OntologyPropertyGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
  unvalidated: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) => {
    const payload = MockPayloadGenerator.generate(operation, {
      OntologyProperty: resolveRoot({ ...MOCK_ONTOLOGY_PROPERTY, ...entity }),
    });
    // A value the contract may add later, such as a new enum member, which
    // the generator refuses: written over the answer it generated.
    return {
      ...payload,
      data: {
        ...payload.data,
        ontologyProperty: { ...payload.data?.ontologyProperty, ...unvalidated },
      },
    };
  });
  return render(
    createSiteTree(
      environment,
      <OntologyPropertyGraphNodeTestNode>
        {children}
      </OntologyPropertyGraphNodeTestNode>,
    ),
  );
};

describe("OntologyPropertyGraphNode", () => {
  it("reads the OntologyProperty through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <OntologyPropertyGraphNode node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.ontology-property-graph-node"),
    ).toHaveAttribute("data-type", "OntologyProperty");
  });

  it("fills the node's lines from the property", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <OntologyPropertyGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".title")?.textContent).toBe("modifier");
    expect(container.querySelector(".context")?.textContent).toBe(
      "Object property in UIBlock",
    );
    expect(container.querySelector(".link")?.getAttribute("href")).toBe(
      MOCK_ONTOLOGY_PROPERTY_HREF,
    );
  });

  it("names its kind alone when the property is declared on no class", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <OntologyPropertyGraphNode node={node} />
        </svg>
      ),
      { domain: null, label: null },
      { kind: "SYMMETRIC" },
    );
    expect(container.querySelector(".title")?.textContent).toBe("modifier");
    expect(container.querySelector(".context")?.textContent).toBe("Property");
  });

  it("takes the width the graph's layout gives it", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <OntologyPropertyGraphNode node={node} width={240} />
      </svg>
    ));
    expect(container.querySelector(".surface")?.getAttribute("width")).toBe(
      "240",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <OntologyPropertyGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container
        .querySelector(".ds.ontology-property-graph-node")
        ?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds ontology-property-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <OntologyPropertyGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
