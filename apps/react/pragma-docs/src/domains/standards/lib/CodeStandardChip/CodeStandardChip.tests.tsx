// Scaffolded by @canonical/summon-component:react v0.43.0

import { RouterLink } from "@canonical/prism-core";
import { expectSlotOrder } from "@canonical/prism-core/testing";
import { ProjectionLinkProvider } from "@canonical/prism-projections";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
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

/** The absolute IRI the mock standard answers as its `uri`. */
const MOCK_CODE_STANDARD_URI =
  "http://pragma.canonical.com/codestandards#react.component.subcomponent_export_api";

/**
 * Wrap `children` in a projection provider whose peek records the address
 * each chip asks it for, and renders that address as a link to look for.
 */
const withRecordingPeek = (
  peek: (uri: string) => ReactNode,
  children: ReactElement,
): ReactElement => (
  <ProjectionLinkProvider LinkComponent={RouterLink} peek={peek}>
    {children}
  </ProjectionLinkProvider>
);

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

  it("links its title to a standard's reading page", () => {
    renderWithNode((node) => <CodeStandardChip node={node} />);
    const link = screen.getByRole("link", {
      name: "Public and private subcomponent exports",
    });
    expect(link).toHaveAttribute("href", MOCK_CODE_STANDARD_HREF);
    expect(link).toHaveClass("title");
  });

  it("leads with the standard's mark and its prefix, off the page's namespace", () => {
    const { container } = renderWithNode((node) => (
      <CodeStandardChip node={node} />
    ));
    const chip = container.querySelector(".ds.code-standard-chip");
    expect(chip?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/code.svg#code",
    );
    expect(chip?.querySelector(".prefix")?.textContent).toBe("cs:");
    if (chip) expectSlotOrder(chip);
  });

  it("has no prefix when the standard's address did not compact", () => {
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
    expect(container.querySelector(".prefix")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe(
      "Public and private subcomponent exports",
    );
  });

  it("peeks at the standard's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withRecordingPeek(peek, <CodeStandardChip node={node} />),
      { uri: MOCK_CODE_STANDARD_URI },
    );
    expect(peek).toHaveBeenCalledWith(MOCK_CODE_STANDARD_URI);
    expect(peek).not.toHaveBeenCalledWith(MOCK_CODE_STANDARD._meta.curie);
    act(() => {
      screen
        .getByRole("link", { name: "Public and private subcomponent exports" })
        .focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector(`a[href="${MOCK_CODE_STANDARD_URI}"]`),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode(
      (node) =>
        withRecordingPeek(
          peek,
          <CodeStandardChip linked={false} node={node} />,
        ),
      { uri: MOCK_CODE_STANDARD_URI },
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Public and private subcomponent exports");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
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
