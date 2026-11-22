// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type StationCardTestQuery,
} from "#relay/__generated__/StationCardTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import StationCard from "./StationCard.js";
import type { StationCardProps } from "./types.js";

/**
 * The operation the tests render StationCard under: one Station, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query StationCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...StationCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const StationCardTestNode = ({
  children,
}: {
  children: (node: StationCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<StationCardTestQuery>(testQuery, {});
  const node = data.node?.StationCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Station");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Station a Relay mock environment
 * answers, under the site's providers: `entity` over Northgate, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: StationCardProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_STATION, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <StationCardTestNode>{children}</StationCardTestNode>,
    ),
  );
};

describe("StationCard", () => {
  it("reads the Station through its fragment", () => {
    const { container } = renderWithNode((node) => <StationCard node={node} />);
    expect(container.querySelector(".ds.station-card")).toHaveAttribute(
      "data-type",
      "Station",
    );
  });

  it("fills the card's slots from the station, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => <StationCard node={node} />);
    const root = container.querySelector(".ds.station-card");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/location.svg#location",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title, .summary") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["metro:", "Northgate", "The northern terminus."]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([
      ["platformCount", "4"],
      ["inZone", "Central Zone"],
      ["servesLine", "North Line"],
      ["location", "51.53, -0.12"],
    ]);
    for (const slot of [".address", ".kind", ".status", ".specimen"]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(screen.getByRole("link", { name: "Northgate" })).toHaveAttribute(
      "href",
      "/network/stations/metro%3Anorthgate",
    );
  });

  it("leaves out each fact the graph does not assert, and the summary", () => {
    const { container } = renderWithNode(
      (node) => <StationCard node={node} />,
      {
        platformCount: null,
        inZone: null,
        servesLine: [],
        location: null,
        _meta: { ...MOCK_STATION._meta, definition: null },
      },
    );
    for (const slot of [".facts", ".fact", ".summary", ".status"]) {
      expect(container.querySelector(slot), slot).toBeNull();
    }
    expect(container.querySelector(".title")?.textContent).toBe("Northgate");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <StationCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.station-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds station-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <StationCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
