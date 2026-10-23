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
  type OntologyPropertyChipTestQuery,
} from "../../../__generated__/OntologyPropertyChipTestQuery.graphql.js";
import OntologyPropertyChip from "./OntologyPropertyChip.js";
import type { OntologyPropertyChipProps } from "./types.js";

/**
 * The operation the tests render OntologyPropertyChip under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareTestQuery = (): unknown => graphql`
  query OntologyPropertyChipTestQuery @relay_test_operation {
    ontologyProperty(uri: "test") {
      ...OntologyPropertyChip_node
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const OntologyPropertyChipTestNode = ({
  children,
}: {
  children: (node: OntologyPropertyChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyChipTestQuery>(testQuery, {});
  const node = data.ontologyProperty;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyProperty");
  }
  return children(node);
};

/**
 * Render `children` with the key of the OntologyProperty a Relay mock
 * environment answers, under the site's providers: `entity` over the matrix's
 * object property `modifier`.
 */
const renderWithNode = (
  children: (node: OntologyPropertyChipProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      OntologyProperty: resolveRoot({ ...MOCK_ONTOLOGY_PROPERTY, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <OntologyPropertyChipTestNode>{children}</OntologyPropertyChipTestNode>,
    ),
  );
};

describe("OntologyPropertyChip", () => {
  it("reads the OntologyProperty through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <OntologyPropertyChip node={node} />
    ));
    expect(
      container.querySelector(".ds.ontology-property-chip"),
    ).toHaveAttribute("data-type", "OntologyProperty");
  });

  it("links its label to the property's home", () => {
    renderWithNode((node) => <OntologyPropertyChip node={node} />);
    expect(
      screen.getByRole("link", { name: "modifier" }).getAttribute("href"),
    ).toBe(MOCK_ONTOLOGY_PROPERTY_HREF);
  });

  it("names a property without a label by its IRI's local name", () => {
    renderWithNode((node) => <OntologyPropertyChip node={node} />, {
      label: null,
      uri: "https://ds.canonical.com/variant",
    });
    expect(screen.getByRole("link").textContent).toBe("variant");
  });

  it("shows a passage's own link text in place of the name", () => {
    renderWithNode((node) => (
      <OntologyPropertyChip node={node}>the modifier</OntologyPropertyChip>
    ));
    expect(screen.getByRole("link").textContent).toBe("the modifier");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <OntologyPropertyChip className="custom-class" node={node} />
    ));
    expect(
      container
        .querySelector(".ds.ontology-property-chip")
        ?.getAttribute("class"),
    ).toBe("ds entity-chip ds ontology-property-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <OntologyPropertyChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
