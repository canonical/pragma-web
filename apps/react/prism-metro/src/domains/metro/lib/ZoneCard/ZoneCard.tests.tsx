// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type ZoneCardTestQuery,
} from "#relay/__generated__/ZoneCardTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import type { ZoneCardProps } from "./types.js";
import ZoneCard from "./ZoneCard.js";

/**
 * The operation the tests render ZoneCard under: one Zone, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ZoneCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...ZoneCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ZoneCardTestNode = ({
  children,
}: {
  children: (node: ZoneCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ZoneCardTestQuery>(testQuery, {});
  const node = data.node?.ZoneCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Zone");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Zone a Relay mock environment answers,
 * under the site's providers: `entity` over the Central Zone, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: ZoneCardProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_ZONE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <ZoneCardTestNode>{children}</ZoneCardTestNode>,
    ),
  );
};

describe("ZoneCard", () => {
  it("reads the Zone through its fragment", () => {
    const { container } = renderWithNode((node) => <ZoneCard node={node} />);
    expect(container.querySelector(".ds.zone-card")).toHaveAttribute(
      "data-type",
      "Zone",
    );
  });

  it("fills the card's slots from the zone, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => <ZoneCard node={node} />);
    expect(
      [
        ...container.querySelectorAll(
          ".location, .title, .kind, .summary, .pair, .vital",
        ),
      ].map((slot) => slot.textContent),
    ).toEqual([
      "Central Zone",
      "Fare zone",
      "The innermost fare band.",
      "2 stations",
    ]);
  });

  it("reads as inert text, since a fare zone has no home on this site", () => {
    const { container } = renderWithNode((node) => <ZoneCard node={node} />);
    expect(container.querySelector("a")).toBeNull();
  });

  it("counts no stations for a zone with none", () => {
    const { container } = renderWithNode((node) => <ZoneCard node={node} />, {
      stops: [],
    });
    expect(container.querySelector(".vital")?.textContent).toBe("0 stations");
  });

  it("renders no summary for a zone without a definition", () => {
    const { container } = renderWithNode((node) => <ZoneCard node={node} />, {
      _meta: { ...MOCK_ZONE._meta, definition: null },
    });
    expect(container.querySelector(".summary")).toBeNull();
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ZoneCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.zone-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds zone-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ZoneCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
