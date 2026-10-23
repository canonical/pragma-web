// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type ZoneRowTestQuery,
} from "#relay/__generated__/ZoneRowTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import type { ZoneRowProps } from "./types.js";
import ZoneRow from "./ZoneRow.js";

/**
 * The operation the tests render ZoneRow under: one Zone, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ZoneRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...ZoneRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ZoneRowTestNode = ({
  children,
}: {
  children: (node: ZoneRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ZoneRowTestQuery>(testQuery, {});
  const node = data.node?.ZoneRow_node;
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
  children: (node: ZoneRowProps["node"]) => ReactElement,
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
      <ZoneRowTestNode>{children}</ZoneRowTestNode>,
    ),
  );
};

describe("ZoneRow", () => {
  it("reads the Zone through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ZoneRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.zone-row")).toHaveAttribute(
      "data-type",
      "Zone",
    );
  });

  it("fills the row's slots from the zone, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ZoneRow node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .meta")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["Central Zone", "2 stations"]);
  });

  it("reads as inert text, since a fare zone has no home on this site", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ZoneRow node={node} />
      </ul>
    ));
    expect(container.querySelector("a")).toBeNull();
  });

  it("counts no stations for a zone with none", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <ZoneRow node={node} />
        </ul>
      ),
      {
        stops: [],
      },
    );
    expect(container.querySelector(".meta")?.textContent).toBe("0 stations");
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ZoneRow className="custom-class" node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.zone-row")?.getAttribute("class")).toBe(
      "ds entity-row ds zone-row custom-class",
    );
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <ZoneRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
