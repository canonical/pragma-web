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

/** Read each fact of a card as its property, its term and its detail. */
const readFacts = (container: HTMLElement): (string | null)[][] =>
  [...container.querySelectorAll(".fact")].map((fact) => [
    fact.getAttribute("data-property"),
    fact.querySelector(".term")?.textContent ?? null,
    fact.querySelector(".detail")?.textContent ?? null,
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
    const card = container.querySelector(".ds.code-standard-card");
    expect(
      [...(card?.querySelectorAll(".prefix, .title, .summary") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "cs:",
      "Public and private subcomponent exports",
      "Subcomponents are public if they are intended to be directly used by the consumer of the parent component to construct a UI.",
    ]);
    expect(readFacts(container)).toEqual([["category", "Category", "React"]]);
    expect(card?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/code.svg#code",
    );
    expect(card?.querySelector(".address, .kind, .status")).toBeNull();
    expect(card?.querySelector(".specimen")).toBeNull();
    if (card) expectSlotOrder(card);
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

  it("ends the summary at a list that follows its opening line", () => {
    const { container } = renderWithNode(
      (node) => <CodeStandardCard node={node} />,
      {
        description:
          "Icon files must:\n- Use kebab-case naming\n- Use semantic identifiers",
      },
    );
    const summary = container.querySelector(".summary");
    expect(summary?.textContent).toBe("Icon files must:");
    expect(summary?.querySelector("ul")).toBeNull();
  });

  it("ends the summary at a blank line written with CRLF", () => {
    const { container } = renderWithNode(
      (node) => <CodeStandardCard node={node} />,
      { description: "The **first** paragraph.\r\n\r\nThe second." },
    );
    expect(container.querySelector(".summary")?.textContent).toBe(
      "The first paragraph.",
    );
  });

  it("has no fact when the standard has no category", () => {
    const { container } = renderWithNode(
      (node) => <CodeStandardCard node={node} />,
      { categories: { edges: [] } },
    );
    for (const slot of [".facts", ".fact", ".status", ".specimen"]) {
      expect(container.querySelector(slot), slot).toBeNull();
    }
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

  it("has no prefix when the standard's address did not compact", () => {
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
    expect(container.querySelector(".prefix")).toBeNull();
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
