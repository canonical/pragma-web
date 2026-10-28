// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type InterchangeChipTestQuery,
} from "#relay/__generated__/InterchangeChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import InterchangeChip from "./InterchangeChip.js";
import type { InterchangeChipProps } from "./types.js";

/**
 * The operation the tests render InterchangeChip under: one Interchange, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query InterchangeChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...InterchangeChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const InterchangeChipTestNode = ({
  children,
}: {
  children: (node: InterchangeChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<InterchangeChipTestQuery>(testQuery, {});
  const node = data.node?.InterchangeChip_node;
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
  children: (node: InterchangeChipProps["node"]) => ReactElement,
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
      <InterchangeChipTestNode>{children}</InterchangeChipTestNode>,
    ),
  );
};

describe("InterchangeChip", () => {
  it("reads the Interchange through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeChip node={node} />
    ));
    expect(container.querySelector(".ds.interchange-chip")).toHaveAttribute(
      "data-type",
      "Interchange",
    );
  });

  it("links its title to the interchange's page", () => {
    renderWithNode((node) => <InterchangeChip node={node} />);
    expect(
      screen
        .getByRole("link", { name: "Central Exchange" })
        .getAttribute("href"),
    ).toBe("/network/stations/metro%3Acentral-exchange");
  });

  it("takes a passage's link text in place of the name", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeChip node={node}>the exchange</InterchangeChip>
    ));
    expect(container.querySelector(".value")?.textContent).toBe("the exchange");
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.interchange-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds interchange-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <InterchangeChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
