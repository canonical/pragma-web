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
  type CodeStandardCommandTestQuery,
} from "../../../../relay/__generated__/CodeStandardCommandTestQuery.graphql.js";
import CodeStandardCommand from "./CodeStandardCommand.js";
import type { CodeStandardCommandProps } from "./types.js";

/**
 * The operation the tests render CodeStandardCommand under: one CodeStandard,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CodeStandardCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...CodeStandardCommand_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const CodeStandardCommandTestNode = ({
  children,
}: {
  children: (node: CodeStandardCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardCommandTestQuery>(testQuery, {});
  const node = data.node?.CodeStandardCommand_node;
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
  children: (node: CodeStandardCommandProps["node"]) => ReactElement,
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
      <CodeStandardCommandTestNode>{children}</CodeStandardCommandTestNode>,
    ),
  );
};

describe("CodeStandardCommand", () => {
  it("reads the CodeStandard through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CodeStandardCommand node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.code-standard-command"),
    ).toHaveAttribute("data-type", "CodeStandard");
  });

  it("fills the result's lines from the standard", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CodeStandardCommand node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .context, .vital")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "Public and private subcomponent exports",
      "Code Standard in cs",
      "React",
    ]);
    expect(
      screen.getByRole("link", {
        name: "Public and private subcomponent exports",
      }),
    ).toHaveAttribute("href", MOCK_CODE_STANDARD_HREF);
  });

  it("names its class alone and ends in no vital with no prefix or category", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <CodeStandardCommand node={node} />
        </ul>
      ),
      {
        categories: { edges: [] },
        _meta: {
          ...MOCK_CODE_STANDARD._meta,
          curie:
            "http://pragma.canonical.com/codestandards#react.component.subcomponent_export_api",
        },
      },
    );
    expect(container.querySelector(".context")?.textContent).toBe(
      "Code Standard",
    );
    expect(container.querySelector(".vital")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CodeStandardCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container
        .querySelector(".ds.code-standard-command")
        ?.getAttribute("class"),
    ).toBe("ds entity-command ds code-standard-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <CodeStandardCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
