// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type ZoneChipTestQuery,
} from "#relay/__generated__/ZoneChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import type { ZoneChipProps } from "./types.js";
import ZoneChip from "./ZoneChip.js";

/**
 * The operation the tests render ZoneChip under: one Zone, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ZoneChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...ZoneChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ZoneChipTestNode = ({
  children,
}: {
  children: (node: ZoneChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ZoneChipTestQuery>(testQuery, {});
  const node = data.node?.ZoneChip_node;
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
  children: (node: ZoneChipProps["node"]) => ReactElement,
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
      <ZoneChipTestNode>{children}</ZoneChipTestNode>,
    ),
  );
};

describe("ZoneChip", () => {
  it("reads the Zone through its fragment", () => {
    const { container } = renderWithNode((node) => <ZoneChip node={node} />);
    expect(container.querySelector(".ds.zone-chip")).toHaveAttribute(
      "data-type",
      "Zone",
    );
  });

  it("fills the pill with the zone's name", () => {
    const { container } = renderWithNode((node) => <ZoneChip node={node} />);
    expect(container.querySelector(".value")?.textContent).toBe("Central Zone");
  });

  it("reads as inert text, since a fare zone has no home on this site", () => {
    const { container } = renderWithNode((node) => <ZoneChip node={node} />);
    expect(container.querySelector("a")).toBeNull();
  });

  it("takes a passage's link text in place of the name", () => {
    const { container } = renderWithNode((node) => (
      <ZoneChip node={node}>the inner zone</ZoneChip>
    ));
    expect(container.querySelector(".value")?.textContent).toBe(
      "the inner zone",
    );
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ZoneChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.zone-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds zone-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ZoneChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
