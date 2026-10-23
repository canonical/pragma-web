// Scaffolded by @canonical/summon-component:react v0.43.0

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

/** Read each key value of the card as its key and its value's text. */
const readPairs = (container: HTMLElement): (string | null)[][] =>
  [...container.querySelectorAll(".pair")].map((pair) => [
    pair.querySelector(".key")?.textContent ?? null,
    pair.querySelector(".value")?.textContent ?? null,
  ]);

describe("StationCard", () => {
  it("reads the Station through its fragment", () => {
    const { container } = renderWithNode((node) => <StationCard node={node} />);
    expect(container.querySelector(".ds.station-card")).toHaveAttribute(
      "data-type",
      "Station",
    );
  });

  it("fills the card's heading from the station, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => <StationCard node={node} />);
    expect(
      [...container.querySelectorAll(".location, .title, .kind, .summary")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "Central Zone",
      "Northgate",
      "Station",
      "The northern terminus.",
    ]);
  });

  it("lists its platforms, its zone and its lines, and counts its platforms", () => {
    const { container } = renderWithNode((node) => <StationCard node={node} />);
    expect(readPairs(container)).toEqual([
      ["Platforms", "4"],
      ["Zone", "Central Zone"],
      ["Lines", "North Line"],
    ]);
    expect(
      [...container.querySelectorAll(".vital")].map(
        (vital) => vital.textContent,
      ),
    ).toEqual(["4 platforms"]);
  });

  it("links its title to the station's page", () => {
    renderWithNode((node) => <StationCard node={node} />);
    expect(
      screen.getByRole("link", { name: "Northgate" }).getAttribute("href"),
    ).toBe("/stations/metro%3Anorthgate");
  });

  it("leaves out the pair and the vital of an unasserted platform count", () => {
    const { container } = renderWithNode(
      (node) => <StationCard node={node} />,
      {
        platformCount: null,
      },
    );
    expect(readPairs(container).map(([key]) => key)).toEqual(["Zone", "Lines"]);
    expect(container.querySelector(".footer")).toBeNull();
  });

  it("has no location and no zone for a station in no zone", () => {
    const { container } = renderWithNode(
      (node) => <StationCard node={node} />,
      {
        inZone: null,
      },
    );
    expect(container.querySelector(".location")).toBeNull();
    expect(readPairs(container).map(([key]) => key)).toEqual([
      "Platforms",
      "Lines",
    ]);
  });

  it("lists no lines for a station no line serves", () => {
    const { container } = renderWithNode(
      (node) => <StationCard node={node} />,
      {
        servesLine: [],
      },
    );
    expect(readPairs(container).map(([key]) => key)).toEqual([
      "Platforms",
      "Zone",
    ]);
  });

  it("renders no summary for a station without a definition", () => {
    const { container } = renderWithNode(
      (node) => <StationCard node={node} />,
      {
        _meta: { ...MOCK_STATION._meta, definition: null },
      },
    );
    expect(container.querySelector(".summary")).toBeNull();
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
