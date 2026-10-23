/**
 * The rail's contracts, driven through the real page over the captured
 * records: per-ontology Classes/Properties grouping with prefixed term
 * addresses, and — the load-bearing one — THE ASYMMETRY: the rail DIMS
 * under a filter and never HIDES, so the index stays complete and stable
 * while the graph is what disappears. The filter itself stays EPHEMERAL
 * (component state — the URL never changes while
 * filtering). Mounts are consolidated (the full-triptych render is heavy)
 * and carry explicit timeouts for fully-parallel runs.
 */

import { createEnvironment, createStaticRouter } from "@canonical/prism-core";
import { RouterProvider } from "@canonical/router-react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import { describe, expect, it } from "vitest";
import createDefinitionsPage from "../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  UIBLOCK_TERM,
} from "../../../testing/fixtures.js";
import patchRecords from "../../../testing/patchRecords.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";
import type { DefinitionsExplorerQuery } from "../../__generated__/DefinitionsExplorerQuery.graphql.js";
import definitionsExplorerQueryNode from "../../__generated__/DefinitionsExplorerQuery.graphql.js";
import { DEFAULT_LENS_FILTER } from "../constants.js";
import { buildDefinitionsExplorerVariables } from "../definitionsQuery.js";
import { definitionsRoutes } from "../routes.js";
import TermRail from "./TermRail.js";

/** The rail alone over the warm store, handed an empty depth map. */
const RailWithoutDepths = () => {
  const data = useLazyLoadQuery<DefinitionsExplorerQuery>(
    definitionsExplorerQueryNode,
    buildDefinitionsExplorerVariables(undefined),
  );
  return (
    <TermRail
      depthByUri={new Map()}
      filter={{ ...DEFAULT_LENS_FILTER, namespaces: ["ds"] }}
      hoverCentre={undefined}
      onHoverTerm={() => {}}
      ontologies={data.ontologies}
    />
  );
};

const renderRail = (): HTMLElement => {
  render(
    createDefinitionsPage(
      UIBLOCK_TERM,
      definitionsExplorerRecords,
      createFetchSpy(),
    ),
  );
  return screen.getByRole("navigation", { name: "Ontology terms" });
};

describe("TermRail", () => {
  it("groups terms per ontology with prefixed addresses; abstractness is a note, not a name", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const rail = renderRail();

    // The ds group: a class link and a property link, both prefixed.
    const dsGroup = within(rail).getByRole("region", { name: "ds" });
    expect(
      within(dsGroup)
        .getByRole("link", { name: "Component" })
        .getAttribute("href"),
    ).toBe("/definitions/ds%3AComponent");
    expect(
      within(dsGroup)
        .getByRole("link", { name: "hasSubcomponent" })
        .getAttribute("href"),
    ).toBe("/definitions/ds%3AhasSubcomponent");

    // The other two ontologies group their own terms.
    const csGroup = within(rail).getByRole("region", { name: "cs" });
    expect(
      within(csGroup)
        .getByRole("link", { name: "Code Standard" })
        .getAttribute("href"),
    ).toBe("/definitions/cs%3ACodeStandard");
    const anatomyGroup = within(rail).getByRole("region", {
      name: "anatomy",
    });
    expect(
      within(anatomyGroup)
        .getByRole("link", { name: "Named Node" })
        .getAttribute("href"),
    ).toBe("/definitions/anatomy%3ANamedNode");

    // Abstractness rides beside the link, never inside its name.
    const uiBlockItem = within(rail)
      .getByRole("link", { name: "UI Block" })
      .closest("li");
    expect(uiBlockItem).not.toBeNull();
    expect(uiBlockItem?.textContent).toContain("abstract");
  });

  it("marks each class's abstraction axis — the real one — never a faked status", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const rail = renderRail();

    // UI Block is abstract; its item renders a marker glyph carrying the
    // abstraction axis as a modifier. This is the same distinction the
    // graph draws (dashed border), restated honestly in the index.
    const abstractItem = within(rail)
      .getByRole("link", { name: "UI Block" })
      .closest("li");
    expect(abstractItem?.querySelector(".mark.abstract")).not.toBeNull();

    // A concrete class carries the other value — the axis is total over
    // isAbstract, never a third invented "status".
    const concreteItem = within(rail)
      .getByRole("link", { name: "Component" })
      .closest("li");
    expect(concreteItem?.querySelector(".mark")).not.toBeNull();
    expect(concreteItem?.querySelector(".mark.abstract")).toBeNull();
  });

  it("shows superclass depth — a class under its parent carries a deeper indent than a root", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const rail = renderRail();

    // Component descends from UI Block (← Entity): it must sit DEEPER than
    // a root. The depth is the well's own superclass measure, handed to the
    // rail as data (the fragment cannot carry `superclass`).
    const componentItem = within(rail)
      .getByRole("link", { name: "Component" })
      .closest("li");
    const componentDepth = Number(
      componentItem?.getAttribute("data-depth") ?? "0",
    );
    expect(componentDepth).toBeGreaterThan(0);

    // …and the depth glyph (a monospace dot-run) is rendered,
    // one dot per TRUE hop (the indent clamps, the glyph does not), and
    // aria-hidden so it never enters the accessible name.
    const glyph = componentItem?.querySelector(".depth");
    expect(glyph?.textContent?.length ?? 0).toBeGreaterThanOrEqual(
      componentDepth,
    );
    expect(glyph?.textContent?.length ?? 0).toBeGreaterThan(0);
    expect(glyph).toHaveAttribute("aria-hidden", "true");

    // A root class has no depth and shows an empty glyph cell.
    const rootItem = within(rail)
      .getByRole("link", { name: "Entity" })
      .closest("li");
    expect(rootItem).toHaveAttribute("data-depth", "0");
  });

  it("DIMS under a filter and never HIDES — the index stays complete", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(
      createDefinitionsPage(
        UIBLOCK_TERM,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    const rail = screen.getByRole("navigation", { name: "Ontology terms" });
    const urlBefore = window.location.pathname;
    const countAll = within(rail).getAllByRole("link").length;
    expect(countAll).toBeGreaterThan(1);

    fireEvent.change(screen.getByLabelText("Filter terms"), {
      target: { value: "UI Block" },
    });

    // NOTHING is removed: the same number of links is still mounted, in
    // the same document order. This is the exact behaviour the previous
    // implementation got backwards, and the TTL contract's demand.
    expect(within(rail).getAllByRole("link")).toHaveLength(countAll);
    const match = within(rail).getByRole("link", { name: "UI Block" });
    const nonMatch = within(rail).getByRole("link", { name: "Code Standard" });
    expect(nonMatch).toBeInTheDocument();

    // The non-match is DIMMED; the match is not.
    expect(nonMatch.closest("li")).toHaveClass("is-dimmed");
    expect(match.closest("li")).not.toHaveClass("is-dimmed");
    // …and it is dimmed, NOT disabled. The link still works and is still
    // focusable, so announcing it as unavailable would be a false state; the
    // heading counts are what tell a screen reader the filter did something.
    expect(nonMatch.closest("li")).not.toHaveAttribute("aria-disabled");
    expect(nonMatch).not.toHaveAttribute("aria-disabled");

    // The filter is view state, never address state.
    expect(window.location.pathname).toBe(urlBefore);

    // Clearing un-dims everything.
    fireEvent.change(screen.getByLabelText("Filter terms"), {
      target: { value: "" },
    });
    expect(
      within(rail).getByRole("link", { name: "Code Standard" }).closest("li"),
    ).not.toHaveClass("is-dimmed");
  });

  it("reports each group's match count in words, not only in opacity", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(
      createDefinitionsPage(
        UIBLOCK_TERM,
        definitionsExplorerRecords,
        createFetchSpy(),
      ),
    );
    const rail = screen.getByRole("navigation", { name: "Ontology terms" });
    const dsGroup = within(rail).getByRole("region", { name: "ds" });
    const classCount = within(dsGroup)
      .getByRole("heading", { name: /^Classes/ })
      .textContent?.replace("Classes", "")
      .trim();
    // Unfiltered: every class in the group matches.
    expect(classCount).toMatch(/^(\d+) of \1$/);

    fireEvent.change(screen.getByLabelText("Filter terms"), {
      target: { value: "UI Block" },
    });

    // Filtered: the numerator drops, the denominator (what EXISTS) does
    // not — the count says how many match, never how many there are.
    const filtered = within(dsGroup)
      .getByRole("heading", { name: /^Classes/ })
      .textContent?.replace("Classes", "")
      .trim();
    expect(filtered).toBe(`1 of ${classCount?.split(" of ").at(1)}`);
  });

  it("names an unlabelled ontology and class by their compact addresses", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(
      createDefinitionsPage(
        UIBLOCK_TERM,
        patchRecords(definitionsExplorerRecords, {
          "client:root:ontologies:1": { label: null },
          "https://ds.canonical.com/UIBlock": { label: null },
        }),
        createFetchSpy(),
      ),
    );
    const rail = screen.getByRole("navigation", { name: "Ontology terms" });
    const dsGroup = within(rail).getByRole("region", { name: "ds" });

    expect(
      within(dsGroup).getByRole("link", { name: "ds:UIBlock" }),
    ).toBeInTheDocument();
  });

  it("reads a class the depth map does not name as a root", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    render(
      <RelayEnvironmentProvider
        environment={createEnvironment({
          records: definitionsExplorerRecords,
          fetchFn: createFetchSpy(),
        })}
      >
        <RouterProvider
          router={createStaticRouter(definitionsRoutes, "/definitions")}
        >
          <RailWithoutDepths />
        </RouterProvider>
      </RelayEnvironmentProvider>,
    );
    const rail = screen.getByRole("navigation", { name: "Ontology terms" });

    expect(
      [...rail.querySelectorAll("li[data-depth]")].map((item) =>
        item.getAttribute("data-depth"),
      ),
    ).not.toContain("1");
  });
});
