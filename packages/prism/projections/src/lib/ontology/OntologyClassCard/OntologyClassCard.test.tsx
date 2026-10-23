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
  type OntologyClassCardTestQuery,
} from "../../../__generated__/OntologyClassCardTestQuery.graphql.js";
import OntologyClassCard from "./OntologyClassCard.js";
import type { OntologyClassCardProps } from "./types.js";

/**
 * The operation the tests render OntologyClassCard under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query OntologyClassCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...OntologyClassCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const OntologyClassCardTestNode = ({
  children,
}: {
  children: (node: OntologyClassCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassCardTestQuery>(testQuery, {});
  const node = data.node?.OntologyClassCard_node;
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
  children: (node: OntologyClassCardProps["node"]) => ReactElement,
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
      <OntologyClassCardTestNode>{children}</OntologyClassCardTestNode>,
    ),
  );
};

describe("OntologyClassCard", () => {
  it("reads the OntologyClass through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <OntologyClassCard node={node} />
    ));
    expect(container.querySelector(".ds.ontology-class-card")).toHaveAttribute(
      "data-type",
      "OntologyClass",
    );
  });

  it("fills the card's slots from the class, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <OntologyClassCard node={node} />
    ));
    expect(
      [...container.querySelectorAll(".title, .kind, .summary")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "Layout ⊂ UIBlock",
      "Abstract class in ds",
      "Layouts are an opinionated division of space to navigate a domain of information.",
    ]);
    expect(container.querySelector(".parent")?.textContent).toBe("UIBlock");
    for (const slot of [".location", ".key-values", ".footer", ".sidecar"]) {
      expect(container.querySelector(slot), slot).toBeNull();
    }
  });

  it("links its title, not its superclass, to the class's home", () => {
    renderWithNode((node) => <OntologyClassCard node={node} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links.at(0)?.textContent).toBe("Layout");
    expect(links.at(0)?.getAttribute("href")).toBe(MOCK_ONTOLOGY_CLASS_HREF);
  });

  it("names a concrete class's kind as a class", () => {
    const { container } = renderWithNode(
      (node) => <OntologyClassCard node={node} />,
      { isAbstract: false },
    );
    expect(container.querySelector(".kind")?.textContent).toBe("Class in ds");
  });

  it("shows its title alone when the class has no superclass", () => {
    const { container } = renderWithNode(
      (node) => <OntologyClassCard node={node} />,
      { superclass: null },
    );
    expect(container.querySelector(".title")?.textContent).toBe("Layout");
    expect(container.querySelector(".parent")).toBeNull();
  });

  it("names its kind alone when the class's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => <OntologyClassCard node={node} />,
      { _meta: { title: "Layout", curie: "https://ds.canonical.com/Layout" } },
    );
    expect(container.querySelector(".kind")?.textContent).toBe(
      "Abstract class",
    );
  });

  it("renders no summary for a class without a definition", () => {
    const { container } = renderWithNode(
      (node) => <OntologyClassCard node={node} />,
      { definition: null },
    );
    expect(container.querySelector(".summary")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <OntologyClassCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.ontology-class-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds ontology-class-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <OntologyClassCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
