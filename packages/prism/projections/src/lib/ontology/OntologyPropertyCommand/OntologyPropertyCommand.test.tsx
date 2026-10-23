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
  type OntologyPropertyCommandTestQuery,
} from "../../../__generated__/OntologyPropertyCommandTestQuery.graphql.js";
import OntologyPropertyCommand from "./OntologyPropertyCommand.js";
import type { OntologyPropertyCommandProps } from "./types.js";

/**
 * The operation the tests render OntologyPropertyCommand under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareTestQuery = (): unknown => graphql`
  query OntologyPropertyCommandTestQuery @relay_test_operation {
    ontologyProperty(uri: "test") {
      ...OntologyPropertyCommand_node
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const OntologyPropertyCommandTestNode = ({
  children,
}: {
  children: (node: OntologyPropertyCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyCommandTestQuery>(
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
  children: (node: OntologyPropertyCommandProps["node"]) => ReactElement,
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
      <OntologyPropertyCommandTestNode>
        {children}
      </OntologyPropertyCommandTestNode>,
    ),
  );
};

describe("OntologyPropertyCommand", () => {
  it("reads the OntologyProperty through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyPropertyCommand node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.ontology-property-command"),
    ).toHaveAttribute("data-type", "OntologyProperty");
  });

  it("fills the result's slots from the property, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyPropertyCommand node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .kind, .location, .vital")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["Modifier", "Object property", "UIBlock", "ds:Modifier"]);
    expect(container.querySelector(".title")?.getAttribute("href")).toBe(
      MOCK_ONTOLOGY_PROPERTY_HREF,
    );
    expect(container.querySelector(".vital code")?.textContent).toBe(
      "ds:Modifier",
    );
  });

  it("names its kind alone when the property is declared on no class", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <OntologyPropertyCommand node={node} />
        </ul>
      ),
      { domain: null, kind: "ANNOTATION" },
    );
    expect(container.querySelector(".context")?.textContent).toBe(
      "Annotation property",
    );
    expect(container.querySelector(".location")).toBeNull();
  });

  it("names a kind the catalog does not know as a property", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <OntologyPropertyCommand node={node} />
        </ul>
      ),
      {},
      { kind: "SYMMETRIC" },
    );
    expect(container.querySelector(".kind")?.textContent).toBe("Property");
  });

  it("names a property without a label by its IRI's local name", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <OntologyPropertyCommand node={node} />
        </ul>
      ),
      { label: null },
    );
    expect(container.querySelector(".title")?.textContent).toBe("modifier");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyPropertyCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container
        .querySelector(".ds.ontology-property-command")
        ?.getAttribute("class"),
    ).toBe("ds entity-command ds ontology-property-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <OntologyPropertyCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
