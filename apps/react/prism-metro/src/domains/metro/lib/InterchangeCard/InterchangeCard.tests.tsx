// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type InterchangeCardTestQuery,
} from "#relay/__generated__/InterchangeCardTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import InterchangeCard from "./InterchangeCard.js";
import type { InterchangeCardProps } from "./types.js";

/**
 * The operation the tests render InterchangeCard under: one Interchange, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query InterchangeCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...InterchangeCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const InterchangeCardTestNode = ({
  children,
}: {
  children: (node: InterchangeCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<InterchangeCardTestQuery>(testQuery, {});
  const node = data.node?.InterchangeCard_node;
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
  children: (node: InterchangeCardProps["node"]) => ReactElement,
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
      <InterchangeCardTestNode>{children}</InterchangeCardTestNode>,
    ),
  );
};

/** Read each key value of the card as its key and its value's text. */
const readPairs = (container: HTMLElement): (string | null)[][] =>
  [...container.querySelectorAll(".pair")].map((pair) => [
    pair.querySelector(".key")?.textContent ?? null,
    pair.querySelector(".value")?.textContent ?? null,
  ]);

describe("InterchangeCard", () => {
  it("reads the Interchange through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeCard node={node} />
    ));
    expect(container.querySelector(".ds.interchange-card")).toHaveAttribute(
      "data-type",
      "Interchange",
    );
  });

  it("fills the card's heading from the interchange, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeCard node={node} />
    ));
    expect(
      [...container.querySelectorAll(".location, .title, .kind, .summary")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "Central Zone",
      "Central Exchange",
      "Interchange",
      "The busiest transfer point on the network.",
    ]);
  });

  it("adds its transfer time to a station's pairs, and counts its lines", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeCard node={node} />
    ));
    expect(readPairs(container)).toEqual([
      ["Platforms", "8"],
      ["Zone", "Central Zone"],
      ["Lines", "North Line, Circle Line, Coastal Line"],
      ["Transfer", "4 minutes"],
    ]);
    expect(
      [...container.querySelectorAll(".vital")].map(
        (vital) => vital.textContent,
      ),
    ).toEqual(["8 platforms", "3 lines"]);
  });

  it("links its title to the interchange's page", () => {
    renderWithNode((node) => <InterchangeCard node={node} />);
    expect(
      screen
        .getByRole("link", { name: "Central Exchange" })
        .getAttribute("href"),
    ).toBe("/stations/metro%3Acentral-exchange");
  });

  it("leaves out the transfer of an interchange that asserts none", () => {
    const { container } = renderWithNode(
      (node) => <InterchangeCard node={node} />,
      {
        transferMinutes: null,
      },
    );
    expect(readPairs(container).map(([key]) => key)).toEqual([
      "Platforms",
      "Zone",
      "Lines",
    ]);
  });

  it("counts its lines alone without a platform count", () => {
    const { container } = renderWithNode(
      (node) => <InterchangeCard node={node} />,
      {
        platformCount: null,
      },
    );
    expect(
      [...container.querySelectorAll(".vital")].map(
        (vital) => vital.textContent,
      ),
    ).toEqual(["3 lines"]);
  });

  it("renders no summary for an interchange without a definition", () => {
    const { container } = renderWithNode(
      (node) => <InterchangeCard node={node} />,
      {
        _meta: { ...MOCK_INTERCHANGE._meta, definition: null },
      },
    );
    expect(container.querySelector(".summary")).toBeNull();
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.interchange-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds interchange-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <InterchangeCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
