/**
 * BIDIRECTIONAL HOVER, PROVEN AT THE DOM. The hover centre lives in
 * `DefinitionsExplorer`, shared by the rail and the well, so a hover on
 * EITHER surface reaches the OTHER.
 *
 * These are interaction TEETH: not "a handler fired" but
 * the actual cross-surface DOM change a reader would see. Both directions
 * read the real painted class, never an internal.
 *
 * - Hover a RAIL item → the matching GRAPH node keeps its focus standing
 *   (un-faded) while non-neighbours gain the faded class. A rail hover
 *   drives the graph's fade, exactly as a node hover does.
 * - Hover a GRAPH node → the matching RAIL item gains its hover-highlight
 *   (`is-hovered`), distinct from the aria-current selection underneath.
 *
 * The rail-to-graph cases mount the explorer with NO term selected, where
 * the well paints no fade at all, so every faded node they see is the
 * hover's doing and a hover that never reached the graph fails them.
 *
 * The mount is the full triptych over the captured store (the heaviest
 * render), so it carries the shared timeout for parallel runs.
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  UIBLOCK_TERM,
} from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";

/** The class the focus's fade marks a graph node with. */
const NODE_FADED_CLASS = "is-faded";

/** The canvas's node whose term link points at `href`: the stable
 * cross-reference between a rail item and its node (both address the same
 * term). Returns the `.node` group that carries the state class. */
const findNodeByHref = (well: HTMLElement, href: string): HTMLElement => {
  const link = well.querySelector<HTMLElement>(
    `.desktop .node a[href="${href}"]`,
  );
  const node = link?.closest<HTMLElement>(".node");
  if (!node) throw new Error(`no graph node for ${href}`);
  return node;
};

/** How many of the canvas's nodes the focus's fade currently dims. */
const countFadedNodes = (well: HTMLElement): number =>
  well.querySelectorAll(`.desktop .node.${NODE_FADED_CLASS}`).length;

describe("bidirectional hover — the rail and the graph share one focus", () => {
  it("a RAIL hover fades the GRAPH: the hovered term's node stays lit, a distant node fades", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = render(
      createDefinitionsPage(
        undefined,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    const rail = screen.getByRole("navigation", { name: "Ontology terms" });
    const well = container.querySelector<HTMLElement>(
      '[data-slot="explorer-canvas"]',
    );
    if (!well) throw new Error("unreachable");

    // No term is selected and nothing is hovered: the well fades nothing.
    expect(countFadedNodes(well)).toBe(0);

    const componentItem = within(rail)
      .getByRole("link", { name: "Component" })
      .closest("li");
    if (!componentItem) throw new Error("no Component rail item");

    // Hover the rail's "Component" item: its node and one-hop neighbours
    // stay lit, and every other node fades.
    fireEvent.mouseEnter(componentItem);

    expect(countFadedNodes(well)).toBeGreaterThan(0);
    const componentNode = findNodeByHref(well, "/definitions/ds%3AComponent");
    // The hovered term itself is the focus: never faded.
    expect(componentNode.classList.contains(NODE_FADED_CLASS)).toBe(false);
    // CodeStandard is in a different ontology entirely — guaranteed distant.
    const distantNode = findNodeByHref(well, "/definitions/cs%3ACodeStandard");
    expect(distantNode.classList.contains(NODE_FADED_CLASS)).toBe(true);

    // Leaving the rail item lifts the hover's fade entirely.
    fireEvent.mouseLeave(componentItem);
    expect(countFadedNodes(well)).toBe(0);
  });

  it("a GRAPH hover marks the RAIL: the hovered node's rail item gains is-hovered", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = render(
      createDefinitionsPage(
        UIBLOCK_TERM,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    const rail = screen.getByRole("navigation", { name: "Ontology terms" });
    const well = container.querySelector<HTMLElement>(
      '[data-slot="explorer-canvas"]',
    );
    if (!well) throw new Error("unreachable");

    const patternRailItem = within(rail)
      .getByRole("link", { name: "Pattern" })
      .closest("li");
    if (!patternRailItem) throw new Error("no Pattern rail item");
    // Nothing hovered yet: the rail item carries no hover highlight.
    expect(patternRailItem.classList.contains("is-hovered")).toBe(false);

    // Point at the Pattern NODE in the graph.
    const patternNode = findNodeByHref(well, "/definitions/ds%3APattern");
    fireEvent.mouseOver(patternNode);

    // THE CROSS-SURFACE CLAIM: the matching RAIL item lit up — a graph
    // hover reached the index. Distinct from selection (aria-current is
    // UIBlock's, untouched).
    expect(patternRailItem.classList.contains("is-hovered")).toBe(true);
    expect(patternRailItem.querySelector("a")).not.toHaveAttribute(
      "aria-current",
    );

    // Leaving the graph clears it.
    fireEvent.mouseLeave(well);
    expect(patternRailItem.classList.contains("is-hovered")).toBe(false);
  });

  it("keyboard focus on a rail item drives the same shared centre", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = render(
      createDefinitionsPage(
        undefined,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    const rail = screen.getByRole("navigation", { name: "Ontology terms" });
    const well = container.querySelector<HTMLElement>(
      '[data-slot="explorer-canvas"]',
    );
    if (!well) throw new Error("unreachable");

    const componentItem = within(rail)
      .getByRole("link", { name: "Component" })
      .closest("li");
    if (!componentItem) throw new Error("no Component rail item");

    // Nothing selected, nothing focused: the well fades nothing.
    expect(countFadedNodes(well)).toBe(0);

    // Focus (not pointer) raises the centre — the fade follows the keyboard.
    fireEvent.focus(componentItem);
    const distantNode = findNodeByHref(well, "/definitions/cs%3ACodeStandard");
    expect(distantNode.classList.contains(NODE_FADED_CLASS)).toBe(true);
    // The rail item marks itself under focus too.
    expect(componentItem.classList.contains("is-hovered")).toBe(true);

    // Blurring lifts the fade and the mark together.
    fireEvent.blur(componentItem);
    expect(countFadedNodes(well)).toBe(0);
    expect(componentItem.classList.contains("is-hovered")).toBe(false);
  });

  it("keyboard focus on a graph node drives the same shared centre back to the rail", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = render(
      createDefinitionsPage(
        UIBLOCK_TERM,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    const rail = screen.getByRole("navigation", { name: "Ontology terms" });
    const well = container.querySelector<HTMLElement>(
      '[data-slot="explorer-canvas"]',
    );
    if (!well) throw new Error("unreachable");
    const componentRailItem = within(rail)
      .getByRole("link", { name: "Component" })
      .closest("li");
    if (!componentRailItem) throw new Error("no Component rail item");
    const componentLink = findNodeByHref(
      well,
      "/definitions/ds%3AComponent",
    ).querySelector("a");
    if (!componentLink) throw new Error("no Component node link");

    fireEvent.focus(componentLink);
    expect(componentRailItem.classList.contains("is-hovered")).toBe(true);

    fireEvent.blur(componentLink);
    expect(componentRailItem.classList.contains("is-hovered")).toBe(false);
  });
});
