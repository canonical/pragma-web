// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import testQuery, {
  type ZoneCommandTestQuery,
} from "../../../../relay/__generated__/ZoneCommandTestQuery.graphql.js";
import type { ZoneCommandProps } from "./types.js";
import ZoneCommand from "./ZoneCommand.js";

/**
 * The operation the tests render ZoneCommand under: one Zone, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ZoneCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...ZoneCommand_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ZoneCommandTestNode = ({
  children,
}: {
  children: (node: ZoneCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ZoneCommandTestQuery>(testQuery, {});
  const node = data.node?.ZoneCommand_node;
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
  children: (node: ZoneCommandProps["node"]) => ReactElement,
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
      <ZoneCommandTestNode>{children}</ZoneCommandTestNode>,
    ),
  );
};

describe("ZoneCommand", () => {
  it("reads the Zone through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ZoneCommand node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.zone-command")).toHaveAttribute(
      "data-type",
      "Zone",
    );
  });

  it("fills the result's lines from the zone", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ZoneCommand node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .context, .vital")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["Central Zone", "Fare zone", "2 stations"]);
  });

  it("reads as inert text, since a fare zone has no home on this site", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ZoneCommand node={node} />
      </ul>
    ));
    expect(container.querySelector("a")).toBeNull();
  });

  it("counts no stations for a zone with none", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <ZoneCommand node={node} />
        </ul>
      ),
      {
        stops: [],
      },
    );
    expect(container.querySelector(".vital")?.textContent).toBe("0 stations");
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ZoneCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.zone-command")?.getAttribute("class"),
    ).toBe("ds entity-command ds zone-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <ZoneCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
