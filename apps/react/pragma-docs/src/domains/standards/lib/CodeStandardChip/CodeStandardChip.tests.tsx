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
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type CodeStandardChipTestQuery,
} from "../../../../relay/__generated__/CodeStandardChipTestQuery.graphql.js";
import CodeStandardChip from "./CodeStandardChip.js";
import type { CodeStandardChipProps } from "./types.js";

/**
 * The operation the tests render CodeStandardChip under: one CodeStandard, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CodeStandardChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...CodeStandardChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const CodeStandardChipTestNode = ({
  children,
}: {
  children: (node: CodeStandardChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardChipTestQuery>(testQuery, {});
  const node = data.node?.CodeStandardChip_node;
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
  children: (node: CodeStandardChipProps["node"]) => ReactElement,
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
      <CodeStandardChipTestNode>{children}</CodeStandardChipTestNode>,
    ),
  );
};

describe("CodeStandardChip", () => {
  it("reads the CodeStandard through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <CodeStandardChip node={node} />
    ));
    expect(container.querySelector(".ds.code-standard-chip")).toHaveAttribute(
      "data-type",
      "CodeStandard",
    );
  });

  it("files its title, linked to its reading page, under its prefix", () => {
    const { container } = renderWithNode((node) => (
      <CodeStandardChip node={node} />
    ));
    expect(container.querySelector(".lead")?.textContent).toBe("cs:");
    expect(
      screen.getByRole("link", {
        name: "Public and private subcomponent exports",
      }),
    ).toHaveAttribute("href", MOCK_CODE_STANDARD_HREF);
  });

  it("has no key when the standard's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => <CodeStandardChip node={node} />,
      {
        _meta: {
          ...MOCK_CODE_STANDARD._meta,
          curie:
            "http://pragma.canonical.com/codestandards#react.component.subcomponent_export_api",
        },
      },
    );
    expect(container.querySelector(".lead")).toBeNull();
  });

  it("shows a passage's own link text in place of the title", () => {
    renderWithNode((node) => (
      <CodeStandardChip node={node}>subcomponent exports</CodeStandardChip>
    ));
    expect(
      screen.getByRole("link", { name: "subcomponent exports" }),
    ).toHaveAttribute("href", MOCK_CODE_STANDARD_HREF);
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <CodeStandardChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.code-standard-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds code-standard-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <CodeStandardChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
