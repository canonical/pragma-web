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
  type CodeStandardCardTestQuery,
} from "../../../../relay/__generated__/CodeStandardCardTestQuery.graphql.js";
import CodeStandardCard from "./CodeStandardCard.js";
import type { CodeStandardCardProps } from "./types.js";

/**
 * The operation the tests render CodeStandardCard under: one CodeStandard, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CodeStandardCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...CodeStandardCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const CodeStandardCardTestNode = ({
  children,
}: {
  children: (node: CodeStandardCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardCardTestQuery>(testQuery, {});
  const node = data.node?.CodeStandardCard_node;
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
  children: (node: CodeStandardCardProps["node"]) => ReactElement,
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
      <CodeStandardCardTestNode>{children}</CodeStandardCardTestNode>,
    ),
  );
};

/** Read each key value of a card as its key and its value. */
const readPairs = (container: HTMLElement): string[][] =>
  [...container.querySelectorAll(".pair")].map((pair) => [
    pair.querySelector(".key")?.textContent ?? "",
    pair.querySelector(".value")?.textContent ?? "",
  ]);

describe("CodeStandardCard", () => {
  it("reads the CodeStandard through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <CodeStandardCard node={node} />
    ));
    expect(container.querySelector(".ds.code-standard-card")).toHaveAttribute(
      "data-type",
      "CodeStandard",
    );
  });

  it("fills the card's slots from the standard, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <CodeStandardCard node={node} />
    ));
    expect(
      [...container.querySelectorAll(".location, .title, .kind, .summary")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "cs",
      "Public and private subcomponent exports",
      "Code Standard",
      "Subcomponents are public if they are intended to be directly used by the consumer of the parent component to construct a UI.",
    ]);
    expect(readPairs(container)).toEqual([["Category", "React"]]);
    expect(container.querySelector(".footer")).toBeNull();
    expect(container.querySelector(".sidecar")).toBeNull();
    expect(
      screen.getByRole("link", {
        name: "Public and private subcomponent exports",
      }),
    ).toHaveAttribute("href", MOCK_CODE_STANDARD_HREF);
  });

  it("keeps the summary's emphasis, inline in the card's paragraph", () => {
    const { container } = renderWithNode((node) => (
      <CodeStandardCard node={node} />
    ));
    const summary = container.querySelector(".summary");
    expect(summary?.querySelector("strong")?.textContent).toBe("public");
    expect(summary?.querySelector("p")).toBeNull();
  });

  it("has no key value when the standard has no category", () => {
    const { container } = renderWithNode(
      (node) => <CodeStandardCard node={node} />,
      { categories: { edges: [] } },
    );
    expect(container.querySelector(".key-values")).toBeNull();
  });

  it("has no summary when the description is empty or absent", () => {
    for (const description of ["", null]) {
      const { container, unmount } = renderWithNode(
        (node) => <CodeStandardCard node={node} />,
        { description },
      );
      expect(
        container.querySelector(".summary"),
        String(description),
      ).toBeNull();
      unmount();
    }
  });

  it("has no location when the standard's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => <CodeStandardCard node={node} />,
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

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <CodeStandardCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.code-standard-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds code-standard-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <CodeStandardCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
