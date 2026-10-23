// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import {
  MOCK_CODE_STANDARD,
  MOCK_CODE_STANDARD_HREF,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
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
  it("reads the CodeStandard through its fragment", () => {
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
    expect(
      [...container.querySelectorAll(".location, .title, .meta")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["cs:", "Public and private subcomponent exports", "React"]);
    expect(container.querySelector(".location code.identifier")).not.toBeNull();
    expect(
      screen.getByRole("link", {
        name: "Public and private subcomponent exports",
      }),
    ).toHaveAttribute("href", MOCK_CODE_STANDARD_HREF);
  });

  it("has no prefix when the standard's address did not compact", () => {
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
      },
    );
    expect(container.querySelector(".location")).toBeNull();
  });

  it("ends in its title when the standard has no category", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <CodeStandardRow node={node} />
        </ul>
      ),
      { categories: { edges: [] } },
    );
    expect(container.querySelector(".meta")).toBeNull();
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
});
