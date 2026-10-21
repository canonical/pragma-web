/**
 * THE WELL ACTUALLY RE-RENDERS — the claim no other suite makes.
 *
 * The well is memoised at its boundary (`HierarchyWell`'s `memo`
 * comparator), and that comparator is the single point of failure for the
 * whole chip mechanism: it decides whether a filter change reaches the
 * graph at all. Every OTHER consequence of a chip has its own independent
 * witness — the chip's `aria-pressed` flips in `ExplorerControls.test`,
 * the status figure recounts in `stripSlots.test` (a sibling reading the
 * same context), the rail dims in `TermRail.test` — so if the comparator
 * were replaced by `return true`, freezing the graph forever, every other
 * definitions test would still pass. The chips would visibly toggle, the
 * figure would recount, the rail would dim, and the GRAPH would sit
 * frozen, which is the one thing the lens exists to show.
 *
 * This file closes that. It mounts the page and the strip's Controls the
 * way PRODUCTION mounts them — siblings under one `LensFilterProvider`,
 * because the layout renders the strip outside the page's subtree —
 * clicks a real chip through the real UI, and asserts on the WELL'S OWN
 * NODES: the count carrying `is-hidden` must rise. Nothing here reads the
 * comparator, the filter object or any internal; the assertion is what a
 * reader would see in the graph.
 *
 * TEETH (verified by hand, and the reason this file exists): setting the
 * comparator body to `return true` makes the hidden count stay 0 and this
 * test fail. Restoring it makes it pass.
 */

import {
  createEnvironment,
  createStaticRouter,
  HomesProvider,
} from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { RouterProvider } from "@canonical/router-react";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import type { FetchFunction } from "relay-runtime";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  HOMES,
} from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";
import { DefinitionsPage } from "../../lib/DefinitionsPage/index.js";
import { HIDDEN_CLASS } from "../../lib/HierarchyWell/constants.js";
import { LensFilterProvider } from "../../lib/LensFilter/index.js";
import { definitionsRoutes } from "../../lib/routes.js";
import { definitionsStripSlots } from "../../lib/stripSlots.js";

/**
 * The explorer AND the strip's chip toolbar under ONE filter provider —
 * the production arrangement (`DefinitionsLayout` puts the provider around
 * both the strip and the canvas). Neither existing suite renders both: the
 * explorer's tests mount the page without the chips, and the strip's
 * tests mount the chips without the well. This is the join, and the join
 * is exactly where the memo boundary lives.
 */
const createExplorerWithChips = (fetchFn: FetchFunction): ReactElement => {
  const { Controls } = definitionsStripSlots;
  return (
    <RelayEnvironmentProvider
      environment={createEnvironment({
        records: definitionsExplorerRecords,
        fetchFn,
      })}
    >
      <RouterProvider
        router={createStaticRouter(definitionsRoutes, "/definitions")}
      >
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider maps={defaultProjectionMaps}>
            <LensFilterProvider>
              <Controls />
              <DefinitionsPage params={{}} />
            </LensFilterProvider>
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>
  );
};

/** How many of the well's nodes the graph is currently HIDING. Counted
 * from the DOM the well painted, never from the model. */
const countHiddenNodes = (): number =>
  document.querySelectorAll(`.ds.term-node.${HIDDEN_CLASS}`).length;

/** Every node the well painted, hidden or not. */
const countNodes = (): number =>
  document.querySelectorAll(".ds.term-node").length;

describe("the well answers a chip toggle", () => {
  it("hides nodes in the GRAPH when an ontology chip goes off", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(createExplorerWithChips(createFetchSpy()));

    // The unfiltered graph: every class painted, none hidden. The total
    // is read from the render rather than pinned, so this survives the
    // ontology growing (the 111-to-108 drift lesson).
    const total = countNodes();
    expect(total).toBeGreaterThan(0);
    expect(countHiddenNodes()).toBe(0);

    // Toggle a real chip through the real UI — the same button a reader
    // presses, mounted by the same code path the layout uses.
    const chip = screen.getByRole("button", { name: "anatomy" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(chip);

    // THE CLAIM: the graph itself changed. Some nodes are now hidden,
    // and not all of them are — a chip narrows the view, it does not
    // blank it. Counts are related to each other, never pinned.
    const hidden = countHiddenNodes();
    expect(hidden).toBeGreaterThan(0);
    expect(hidden).toBeLessThan(total);
    // The graph HIDES rather than removing: positions are preserved so
    // the picture restores exactly when the chip comes back on.
    expect(countNodes()).toBe(total);

    // And it is reversible: pressing the chip again restores the whole
    // graph, which is what "hide, never re-lay-out" buys.
    fireEvent.click(chip);
    expect(countHiddenNodes()).toBe(0);
    expect(countNodes()).toBe(total);
  });

  it("hides nodes in the GRAPH when an abstraction chip goes off", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(createExplorerWithChips(createFetchSpy()));

    const total = countNodes();
    expect(countHiddenNodes()).toBe(0);

    // The other axis, so the comparator is pinned on BOTH the fields it
    // compares — `abstractions` as well as `namespaces`.
    fireEvent.click(screen.getByRole("button", { name: "Abstract" }));

    const hidden = countHiddenNodes();
    expect(hidden).toBeGreaterThan(0);
    expect(hidden).toBeLessThan(total);
    expect(countNodes()).toBe(total);
  });
});
