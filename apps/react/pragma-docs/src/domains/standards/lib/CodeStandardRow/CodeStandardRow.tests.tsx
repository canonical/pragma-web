// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import {
  MOCK_CODE_STANDARD,
  MOCK_CODE_STANDARD_HREF,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type CodeStandardRowTestQuery,
} from "../../../../relay/__generated__/CodeStandardRowTestQuery.graphql.js";
import CodeStandardRow from "./CodeStandardRow.js";
import type { CodeStandardRowProps } from "./types.js";

/**
 * The operation the tests render CodeStandardRow under: one CodeStandard, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CodeStandardRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...CodeStandardRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const CodeStandardRowTestNode = ({
  children,
}: {
  children: (node: CodeStandardRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardRowTestQuery>(testQuery, {});
  const node = data.node?.CodeStandardRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no CodeStandard");
  }
  return children(node);
};

/**
 * Render `children` with the key of the CodeStandard a Relay mock environment
 * answers, under the site's providers: `entity` over the standard on public and
 * private subcomponent exports.
 */
const renderWithNode = (
  children: (node: CodeStandardRowProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_CODE_STANDARD, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <CodeStandardRowTestNode>{children}</CodeStandardRowTestNode>,
    ),
  );
};

describe("CodeStandardRow", () => {
  it("reads the Modifier through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CodeStandardRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.code-standard-row")).toHaveAttribute(
      "data-type",
      "CodeStandard",
    );
  });

  it("fills the row's slots from the standard, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CodeStandardRow node={node} />
      </ul>
    ));
    const row = container.querySelector(".ds.code-standard-row");
    expect(
      [...(row?.querySelectorAll(".prefix, .title") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["cs:", "Public and private subcomponent exports"]);
    expect(
      [...(row?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".term")?.textContent,
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([["category", "Category", "React"]]);
    expect(row?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/code.svg#code",
    );
    expect(row?.querySelector(".kind, .status, .summary")).toBeNull();
    expect(
      screen.getByRole("link", {
        name: "Public and private subcomponent exports",
      }),
    ).toHaveAttribute("href", MOCK_CODE_STANDARD_HREF);
    if (row) expectSlotOrder(row);
  });

  it("has no fact with no category, and no prefix when the address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <CodeStandardRow node={node} />
        </ul>
      ),
      {
        _meta: {
          ...MOCK_CODE_STANDARD._meta,
          curie:
            "http://pragma.canonical.com/codestandards#react.component.subcomponent_export_api",
        },
        categories: { edges: [] },
      },
    );
    expect(container.querySelector(".facts")).toBeNull();
    expect(container.querySelector(".prefix")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe(
      "Public and private subcomponent exports",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CodeStandardRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.code-standard-row")?.getAttribute("class"),
    ).toBe("ds entity-row ds code-standard-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <CodeStandardRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });

  it("puts the summary's first paragraph under the title in a two-line row", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CodeStandardRow lines="two" node={node} />
      </ul>
    ));
    expect(container.querySelector(".summary")?.textContent).toBe(
      "Subcomponents are public if they are intended to be directly used by the consumer of the parent component to construct a UI.",
    );
  });

  it("keeps a summary written over several lines to the row's one second line", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <CodeStandardRow lines="two" node={node} />
        </ul>
      ),
      { description: "A subcomponent is public\nwhen consumers use it." },
    );
    const summary = container.querySelector(".summary");
    expect(summary?.querySelector("br")).toBeNull();
    expect(summary?.textContent).toBe(
      "A subcomponent is public when consumers use it.",
    );
  });
});
