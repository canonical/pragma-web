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
  type OntologyClassRowTestQuery,
} from "../../../__generated__/OntologyClassRowTestQuery.graphql.js";
import OntologyClassRow from "./OntologyClassRow.js";
import type { OntologyClassRowProps } from "./types.js";

/**
 * The operation the tests render OntologyClassRow under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query OntologyClassRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...OntologyClassRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const OntologyClassRowTestNode = ({
  children,
}: {
  children: (node: OntologyClassRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassRowTestQuery>(testQuery, {});
  const node = data.node?.OntologyClassRow_node;
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
  children: (node: OntologyClassRowProps["node"]) => ReactElement,
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
      <OntologyClassRowTestNode>{children}</OntologyClassRowTestNode>,
    ),
  );
};

describe("OntologyClassRow", () => {
  it("reads the OntologyClass through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyClassRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.ontology-class-row")).toHaveAttribute(
      "data-type",
      "OntologyClass",
    );
  });

  it("fills the row's slots from the class, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyClassRow node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".location, .title, .meta")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["ds:", "Layout", "abstract"]);
    expect(container.querySelector(".location code")?.textContent).toBe("ds:");
    expect(container.querySelector(".title")?.getAttribute("href")).toBe(
      MOCK_ONTOLOGY_CLASS_HREF,
    );
  });

  it("ends in no word for a concrete class", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <OntologyClassRow node={node} />
        </ul>
      ),
      { isAbstract: false },
    );
    expect(container.querySelector(".meta")).toBeNull();
  });

  it("leads with no prefix when the class's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <OntologyClassRow node={node} />
        </ul>
      ),
      { _meta: { title: "Layout", curie: "https://ds.canonical.com/Layout" } },
    );
    expect(container.querySelector(".location")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyClassRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.ontology-class-row")?.getAttribute("class"),
    ).toBe("ds entity-row ds ontology-class-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <OntologyClassRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
