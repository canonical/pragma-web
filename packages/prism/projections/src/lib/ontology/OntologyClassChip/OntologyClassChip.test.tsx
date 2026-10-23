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
  type OntologyClassChipTestQuery,
} from "../../../__generated__/OntologyClassChipTestQuery.graphql.js";
import OntologyClassChip from "./OntologyClassChip.js";
import type { OntologyClassChipProps } from "./types.js";

/**
 * The operation the tests render OntologyClassChip under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query OntologyClassChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...OntologyClassChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const OntologyClassChipTestNode = ({
  children,
}: {
  children: (node: OntologyClassChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassChipTestQuery>(testQuery, {});
  const node = data.node?.OntologyClassChip_node;
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
  children: (node: OntologyClassChipProps["node"]) => ReactElement,
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
      <OntologyClassChipTestNode>{children}</OntologyClassChipTestNode>,
    ),
  );
};

describe("OntologyClassChip", () => {
  it("reads the OntologyClass through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <OntologyClassChip node={node} />
    ));
    expect(container.querySelector(".ds.ontology-class-chip")).toHaveAttribute(
      "data-type",
      "OntologyClass",
    );
  });

  it("links its title to the class's home", () => {
    renderWithNode((node) => <OntologyClassChip node={node} />);
    expect(
      screen.getByRole("link", { name: "Layout" }).getAttribute("href"),
    ).toBe(MOCK_ONTOLOGY_CLASS_HREF);
  });

  it("shows a passage's own link text in place of the title", () => {
    renderWithNode((node) => (
      <OntologyClassChip node={node}>layouts</OntologyClassChip>
    ));
    expect(screen.getByRole("link").textContent).toBe("layouts");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <OntologyClassChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.ontology-class-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds ontology-class-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <OntologyClassChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
