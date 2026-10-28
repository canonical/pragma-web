// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type InterchangeCommandTestQuery,
} from "#relay/__generated__/InterchangeCommandTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import InterchangeCommand from "./InterchangeCommand.js";
import type { InterchangeCommandProps } from "./types.js";

/**
 * The operation the tests render InterchangeCommand under: one Interchange,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query InterchangeCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...InterchangeCommand_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const InterchangeCommandTestNode = ({
  children,
}: {
  children: (node: InterchangeCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<InterchangeCommandTestQuery>(testQuery, {});
  const node = data.node?.InterchangeCommand_node;
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
  children: (node: InterchangeCommandProps["node"]) => ReactElement,
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
      <InterchangeCommandTestNode>{children}</InterchangeCommandTestNode>,
    ),
  );
};

describe("InterchangeCommand", () => {
  it("reads the Interchange through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <InterchangeCommand node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.interchange-command")).toHaveAttribute(
      "data-type",
      "Interchange",
    );
  });

  it("fills the result's lines from the interchange", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <InterchangeCommand node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .context, .vital")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["Central Exchange", "Interchange in Central Zone", "3 lines"]);
  });

  it("links its title to the interchange's page", () => {
    renderWithNode((node) => (
      <ul>
        <InterchangeCommand node={node} />
      </ul>
    ));
    expect(
      screen
        .getByRole("link", { name: "Central Exchange" })
        .getAttribute("href"),
    ).toBe("/network/stations/metro%3Acentral-exchange");
  });

  it("names its class alone for an interchange in no zone", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <InterchangeCommand node={node} />
        </ul>
      ),
      {
        inZone: null,
      },
    );
    expect(container.querySelector(".context")?.textContent).toBe(
      "Interchange",
    );
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <InterchangeCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.interchange-command")?.getAttribute("class"),
    ).toBe("ds entity-command ds interchange-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <InterchangeCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
