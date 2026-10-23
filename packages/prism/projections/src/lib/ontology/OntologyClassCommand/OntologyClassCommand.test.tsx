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
  type OntologyClassCommandTestQuery,
} from "../../../__generated__/OntologyClassCommandTestQuery.graphql.js";
import OntologyClassCommand from "./OntologyClassCommand.js";
import type { OntologyClassCommandProps } from "./types.js";

/**
 * The operation the tests render OntologyClassCommand under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query OntologyClassCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...OntologyClassCommand_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const OntologyClassCommandTestNode = ({
  children,
}: {
  children: (node: OntologyClassCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassCommandTestQuery>(testQuery, {});
  const node = data.node?.OntologyClassCommand_node;
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
  children: (node: OntologyClassCommandProps["node"]) => ReactElement,
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
      <OntologyClassCommandTestNode>{children}</OntologyClassCommandTestNode>,
    ),
  );
};

describe("OntologyClassCommand", () => {
  it("reads the OntologyClass through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyClassCommand node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.ontology-class-command"),
    ).toHaveAttribute("data-type", "OntologyClass");
  });

  it("fills the result's slots from the class, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyClassCommand node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .kind, .location, .vital")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["Layout", "Abstract class", "ds", "used in 88 instances"]);
    expect(container.querySelector(".title")?.getAttribute("href")).toBe(
      MOCK_ONTOLOGY_CLASS_HREF,
    );
  });

  it("counts a class's one instance in the singular", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <OntologyClassCommand node={node} />
        </ul>
      ),
      { instanceCount: 1, isAbstract: false },
    );
    expect(container.querySelector(".vital")?.textContent).toBe(
      "used in 1 instance",
    );
    expect(container.querySelector(".kind")?.textContent).toBe("Class");
  });

  it("names its kind alone when the class's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <OntologyClassCommand node={node} />
        </ul>
      ),
      { _meta: { title: "Layout", curie: "https://ds.canonical.com/Layout" } },
    );
    expect(container.querySelector(".context")?.textContent).toBe(
      "Abstract class",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <OntologyClassCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container
        .querySelector(".ds.ontology-class-command")
        ?.getAttribute("class"),
    ).toBe("ds entity-command ds ontology-class-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <OntologyClassCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
