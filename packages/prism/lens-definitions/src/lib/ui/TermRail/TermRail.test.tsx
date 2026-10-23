/**
 * The rail over the captured store: per-ontology classes and properties
 * as term links, the classes in the graph's rail order at their depth; it
 * dims under every filter and never hides, and it raises the shared focus
 * from either input modality.
 */

import { createEnvironment, createStaticRouter } from "@canonical/prism-core";
import { RouterProvider } from "@canonical/router-react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { RelayEnvironmentProvider } from "react-relay";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { describe, expect, it, vi } from "vitest";
import createAllNamespacesFilter from "../../../../testing/createAllNamespacesFilter.js";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import { DEFINITIONS_TEST_TIMEOUT_MS } from "../../../../testing/fixtures.js";
import patchRecords from "../../../../testing/patchRecords.js";
import definitionsExplorerRecords from "../../../../testing/records/definitionsExplorerRecords.js";
import useCapturedExplorer from "../../../../testing/useCapturedExplorer.js";
import { definitionsRoutes } from "../../routes.js";
import type { LensFilter } from "../../types.js";
import TermRail from "./TermRail.js";
import type { TermRailProps } from "./types.js";

const ALL = createAllNamespacesFilter(["ds", "cs", "anatomy"]);

/** The rail over the store, laid out as the explorer lays it out. */
function Rail({
  filter,
  ...props
}: Partial<TermRailProps> & { readonly filter: LensFilter }) {
  const { data, layout } = useCapturedExplorer();
  return (
    <TermRail
      filter={filter}
      hoverCentre={undefined}
      layout={layout}
      onHoverTerm={() => {}}
      onSearchChange={() => {}}
      ontologies={data.ontologies}
      searchText=""
      {...props}
    />
  );
}

/** Mount the rail over `records` at the explorer's address. */
function renderRail(
  props: Partial<TermRailProps> & { readonly filter?: LensFilter } = {},
  records: RecordMap = definitionsExplorerRecords,
): HTMLElement {
  render(
    <RelayEnvironmentProvider
      environment={createEnvironment({ records, fetchFn: createFetchSpy() })}
    >
      <RouterProvider
        router={createStaticRouter(
          definitionsRoutes,
          "/definitions/ds%3AUIBlock",
        )}
      >
        <Rail filter={ALL} {...props} />
      </RouterProvider>
    </RelayEnvironmentProvider>,
  );
  return screen.getByRole("navigation", { name: "Ontology terms" });
}

/** The rail item that holds the link named `name`. */
function itemOf(rail: HTMLElement, name: string): HTMLElement {
  const item = within(rail).getByRole("link", { name }).closest("li");
  if (item === null) throw new Error(`no item holds ${name}`);
  return item;
}

describe("TermRail", { timeout: DEFINITIONS_TEST_TIMEOUT_MS }, () => {
  it("groups the terms per ontology, each a link to its compact address", () => {
    const rail = renderRail();
    const ds = within(rail).getByRole("region", { name: "ds" });
    expect(within(ds).getByRole("link", { name: "Component" })).toHaveAttribute(
      "href",
      "/definitions/ds%3AComponent",
    );
    expect(
      within(ds).getByRole("link", { name: "hasSubcomponent" }),
    ).toHaveAttribute("href", "/definitions/ds%3AhasSubcomponent");
    expect(
      within(within(rail).getByRole("region", { name: "anatomy" })).getByRole(
        "link",
        { name: "Named Node" },
      ),
    ).toHaveAttribute("href", "/definitions/anatomy%3ANamedNode");
    expect(itemOf(rail, "hasSubcomponent").textContent).toContain("object");
  });

  it("lists the classes in the graph's rail order, each at its depth", () => {
    const rail = renderRail();
    const ds = within(rail).getByRole("region", { name: "ds" });
    const classes = within(ds).getAllByRole("list").at(0);
    const names = within(classes as HTMLElement)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(names.at(0)).toBe("Entity");
    expect(names.indexOf("UI Block")).toBeLessThan(names.indexOf("Component"));
    expect(itemOf(rail, "Entity").querySelector(".depth")?.textContent).toBe(
      "",
    );
    expect(itemOf(rail, "Component").querySelector(".depth")).toHaveTextContent(
      "···",
    );
  });

  it("marks a class's kind as the graph draws it, and its instance count", () => {
    const rail = renderRail();
    const abstract = itemOf(rail, "UI Block");
    expect(abstract.querySelector(".mark")?.className).toBe("mark is-abstract");
    expect(abstract.textContent).toContain("abstract");
    const concrete = itemOf(rail, "Code Standard");
    expect(concrete.querySelector(".mark")?.className).toBe("mark");
    expect(concrete.querySelector(".note")?.textContent).toMatch(/^\d+$/);
  });

  it("marks the selected term current", () => {
    const rail = renderRail();
    expect(
      within(rail).getByRole("link", { name: "UI Block" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("dims under the search and never hides, counting the matches in words", () => {
    const rail = renderRail({ filter: { ...ALL, text: "ui block" } });
    const ds = within(rail).getByRole("region", { name: "ds" });
    expect(itemOf(rail, "UI Block")).not.toHaveClass("is-dimmed");
    expect(itemOf(rail, "Code Standard")).toHaveClass("is-dimmed");
    expect(itemOf(rail, "hasSubcomponent")).toHaveClass("is-dimmed");
    expect(
      within(ds).getByRole("heading", { name: /^Classes/ }).textContent,
    ).toMatch(/^Classes1 of 20$/);
  });

  it("dims the classes a chip or the instances axis leaves out", () => {
    const rail = renderRail({
      filter: {
        ...createAllNamespacesFilter(["ds", "cs"]),
        abstractions: ["concrete"],
        withInstances: true,
      },
    });
    expect(itemOf(rail, "Named Node")).toHaveClass("is-dimmed");
    expect(itemOf(rail, "UI Block")).toHaveClass("is-dimmed");
    expect(itemOf(rail, "Code Standard")).not.toHaveClass("is-dimmed");
    // A property dims with its ontology's chip.
    const anatomy = within(rail).getByRole("region", { name: "anatomy" });
    for (const item of within(anatomy).getAllByRole("listitem")) {
      expect(item).toHaveClass("is-dimmed");
    }
  });

  it("takes the hover fill when the shared focus names its term", () => {
    const rail = renderRail({ hoverCentre: "ds:Component" });
    expect(itemOf(rail, "Component")).toHaveClass("item is-hovered");
    expect(itemOf(rail, "UI Block")).not.toHaveClass("is-hovered");
  });

  it("raises and clears the shared focus from the pointer and the keyboard", () => {
    const onHoverTerm = vi.fn();
    const rail = renderRail({ onHoverTerm });
    const item = itemOf(rail, "Component");
    fireEvent.mouseEnter(item);
    fireEvent.mouseLeave(item);
    fireEvent.focus(within(item).getByRole("link"));
    fireEvent.blur(within(item).getByRole("link"));
    expect(onHoverTerm.mock.calls).toEqual([
      ["ds:Component"],
      [undefined],
      ["ds:Component"],
      [undefined],
    ]);
  });

  it("hands the search box's edits up, raw", () => {
    const onSearchChange = vi.fn();
    renderRail({ onSearchChange, searchText: "ui" });
    const field = screen.getByRole("searchbox", { name: "Filter terms" });
    expect(field).toHaveValue("ui");
    fireEvent.change(field, { target: { value: "UI B" } });
    expect(onSearchChange).toHaveBeenCalledWith("UI B");
  });

  it("names an unlabelled ontology and term by their compact addresses", () => {
    const rail = renderRail(
      {},
      patchRecords(definitionsExplorerRecords, {
        "client:root:ontologies:0": { label: null },
        "client:root:ontologies:0:classes:17": { label: null },
        "client:root:ontologies:0:properties:0": { label: null },
      }),
    );
    const ds = within(rail).getByRole("region", { name: "ds" });
    expect(
      within(ds).getByRole("link", { name: "ds:UIBlock" }),
    ).toBeInTheDocument();
    expect(
      within(ds).getByRole("link", { name: "ds:viaBlock" }),
    ).toBeInTheDocument();
  });

  it("merges a class name and passes native props to its root", () => {
    const rail = renderRail({ className: "custom-class", id: "rail" });
    expect(rail.className).toBe("ds term-rail custom-class");
    expect(rail.id).toBe("rail");
  });
});
