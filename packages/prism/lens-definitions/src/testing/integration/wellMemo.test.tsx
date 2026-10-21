/**
 * THE WELL STAYS STILL WHILE A READER TYPES. The search box governs the rail
 * only, and the well is memoised at its boundary (`HierarchyWell`'s `memo`
 * comparator) so that a keystroke does not re-render every node of the
 * graph. This counts the well's node renders through the real page: typing
 * renders none, and a rail hover, which the comparator must let through,
 * renders them all.
 *
 * The node component is wrapped, not replaced: the wrapper counts each render
 * and renders the real node, so the page paints exactly what it always does.
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import createDefinitionsPage from "../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { DEFINITIONS_TEST_TIMEOUT_MS } from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";
import type { TermNodeProps } from "../../lib/HierarchyWell/common/TermNode/types.js";

const nodeRenders = vi.hoisted(() => ({ count: 0 }));

vi.mock(
  "../../lib/HierarchyWell/common/TermNode/index.js",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../lib/HierarchyWell/common/TermNode/index.js")
      >();
    const CountedTermNode = (props: TermNodeProps) => {
      nodeRenders.count += 1;
      return createElement(actual.TermNode, props);
    };
    return { ...actual, TermNode: CountedTermNode };
  },
);

describe("the well's memo boundary", () => {
  it("renders no node while the reader types, and every node on a rail hover", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(
      createDefinitionsPage(
        undefined,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    const rail = screen.getByRole("navigation", { name: "Ontology terms" });
    const countDimmedItems = (): number =>
      rail.querySelectorAll("li.is-dimmed").length;
    expect(countDimmedItems()).toBe(0);
    const nodes = document.querySelectorAll(".ds.term-node").length;
    expect(nodes).toBeGreaterThan(0);

    nodeRenders.count = 0;
    const search = screen.getByRole("searchbox", { name: "Filter terms" });
    fireEvent.change(search, { target: { value: "comp" } });
    fireEvent.change(search, { target: { value: "component" } });

    // The keystrokes reached the rail, which dims every other term...
    expect(countDimmedItems()).toBeGreaterThan(0);
    // ...and not the well, which rendered no node for them.
    expect(nodeRenders.count).toBe(0);

    // A rail hover is an input the well answers to: every node renders.
    const componentItem = within(rail)
      .getByRole("link", { name: "Component" })
      .closest("li");
    if (!componentItem) throw new Error("no Component rail item");
    fireEvent.mouseEnter(componentItem);
    expect(nodeRenders.count).toBe(nodes);
  });
});
