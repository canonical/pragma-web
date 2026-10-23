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
  type OntologyPropertyRowTestQuery,
} from "../../../__generated__/OntologyPropertyRowTestQuery.graphql.js";
import OntologyPropertyRow from "./OntologyPropertyRow.js";
import type { OntologyPropertyRowProps } from "./types.js";

/**
 * The operation the tests render OntologyPropertyRow under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareTestQuery = (): unknown => graphql`
  query OntologyPropertyRowTestQuery @relay_test_operation {
    ontologyProperty(uri: "test") {
      ...OntologyPropertyRow_node
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the fragment key it returns. */
const OntologyPropertyRowTestNode = ({
  children,
}: {
  children: (node: OntologyPropertyRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyRowTestQuery>(testQuery, {});
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
  children: (node: OntologyPropertyRowProps["node"]) => ReactElement,
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
      <OntologyPropertyRowTestNode>{children}</OntologyPropertyRowTestNode>,
    ),
  );
};

describe("OntologyPropertyRow", () => {
  it("reads the OntologyProperty through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyPropertyRow node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.ontology-property-row"),
    ).toHaveAttribute("data-type", "OntologyProperty");
  });

  it("links its name to the property's home and ends in its kind's word", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyPropertyRow node={node} />
      </ul>
    ));
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("A");
    expect(title?.textContent).toBe("modifier");
    expect(title?.getAttribute("href")).toBe(MOCK_ONTOLOGY_PROPERTY_HREF);
    expect(container.querySelector(".meta")?.textContent).toBe("object");
    expect(container.querySelector(".location")).toBeNull();
  });

  it("names each kind by its own word", () => {
    for (const [kind, word] of [
      ["DATATYPE", "datatype"],
      ["ANNOTATION", "annotation"],
    ]) {
      const { container, unmount } = renderWithNode(
        (node) => (
          <ul>
            <OntologyPropertyRow node={node} />
          </ul>
        ),
        { kind },
      );
      expect(container.querySelector(".meta")?.textContent).toBe(word);
      unmount();
    }
  });

  it("names a kind the catalog does not know as a property", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <OntologyPropertyRow node={node} />
        </ul>
      ),
      {},
      { kind: "SYMMETRIC" },
    );
    expect(container.querySelector(".meta")?.textContent).toBe("property");
  });

  it("names a property without a label by its IRI's local name", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <OntologyPropertyRow node={node} />
        </ul>
      ),
      { label: null },
    );
    expect(container.querySelector(".title")?.textContent).toBe("modifier");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyPropertyRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container
        .querySelector(".ds.ontology-property-row")
        ?.getAttribute("class"),
    ).toBe("ds entity-row ds ontology-property-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <OntologyPropertyRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
