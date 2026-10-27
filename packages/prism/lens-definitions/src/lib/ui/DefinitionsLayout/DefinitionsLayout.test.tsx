import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createDefinitionsLayout from "../../../../testing/createDefinitionsLayout.js";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import definitionsExplorerRecords from "../../../../testing/records/definitionsExplorerRecords.js";
import { useLensFilter } from "../LensFilterProvider/index.js";

/** A routed page that prints the namespaces the shared filter allows. */
const FilterProbe = () => {
  const { filter } = useLensFilter();
  return <output>{filter.namespaces?.join(",") ?? "untouched"}</output>;
};

describe("DefinitionsLayout", () => {
  it("lays the site's rail, the strip and the page on the workspace", () => {
    const { container } = render(
      createDefinitionsLayout({
        url: "/definitions",
        records: definitionsExplorerRecords,
        fetchFn: createFetchSpy(),
        rail: <nav aria-label="Site rail" />,
        children: <p>Routed page</p>,
      }),
    );

    const workspace = container.querySelector(".ds.workspace-layout");
    expect(workspace?.querySelector(":scope > .rail")?.firstElementChild).toBe(
      screen.getByRole("navigation", { name: "Site rail" }),
    );
    expect(
      workspace?.querySelector(":scope > .strip > .ds.mode-strip"),
    ).not.toBeNull();
    expect(screen.getByRole("main")).toHaveTextContent("Routed page");
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("claims all three strip sockets: the trail, the chips and the figure", () => {
    const { container } = render(
      createDefinitionsLayout({
        url: "/definitions",
        records: definitionsExplorerRecords,
        fetchFn: createFetchSpy(),
        rail: null,
        children: null,
      }),
    );

    expect(
      within(
        container.querySelector('[data-slot="context"]') as HTMLElement,
      ).getByText("Definitions"),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="explorer-controls"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="explorer-status"]'),
    ).not.toBeNull();
  });

  it("shares one filter between the strip's chips and the routed page", () => {
    render(
      createDefinitionsLayout({
        url: "/definitions",
        records: definitionsExplorerRecords,
        fetchFn: createFetchSpy(),
        rail: null,
        children: <FilterProbe />,
      }),
    );

    expect(screen.getByRole("status")).toHaveTextContent("untouched");
    fireEvent.click(screen.getByRole("button", { name: "anatomy" }));
    expect(screen.getByRole("status")).toHaveTextContent("ds,cs");
  });

  it("turns every ontology off when the reader presses the last lit chip", () => {
    render(
      createDefinitionsLayout({
        url: "/definitions",
        records: definitionsExplorerRecords,
        fetchFn: createFetchSpy(),
        rail: null,
        children: <FilterProbe />,
      }),
    );
    const chips = within(
      screen.getByRole("group", { name: "Filter by ontology" }),
    ).getAllByRole("button");
    expect(chips.length).toBeGreaterThan(1);

    for (const chip of chips) fireEvent.click(chip);

    // Every chip reads off, and the shared filter holds an EMPTY allow-list
    // rather than falling back to "untouched", so nothing is shown.
    expect(chips.map((chip) => chip.getAttribute("aria-pressed"))).toEqual(
      chips.map(() => "false"),
    );
    expect(screen.getByRole("status").textContent).toBe("");
    expect(screen.getByRole("figure").textContent).toContain("0 of 35");
  });

  it("puts the term inspector in the workspace's inspector region", () => {
    const { container } = render(
      createDefinitionsLayout({
        url: "/definitions/ds%3AUIBlock",
        records: definitionsExplorerRecords,
        fetchFn: createFetchSpy(),
        rail: null,
        children: null,
      }),
    );
    const inspector = screen.getByRole("complementary", {
      name: "Term inspector",
    });
    expect(container.querySelector(".ds.workspace-layout")).toContainElement(
      inspector,
    );
    expect(
      within(inspector).getByRole("heading", { level: 2, name: "UI Block" }),
    ).toBeInTheDocument();
  });

  it("waits with a loading line in the inspector over a cold store", () => {
    render(
      createDefinitionsLayout({
        url: "/definitions",
        records: undefined,
        fetchFn: createFetchSpy(),
        rail: null,
        children: null,
      }),
    );
    expect(screen.getByText("Loading the ontologies…")).toBeInTheDocument();
  });

  it("merges the site's class names after its own on its root", () => {
    const { container } = render(
      createDefinitionsLayout({
        url: "/definitions",
        records: definitionsExplorerRecords,
        fetchFn: createFetchSpy(),
        rail: null,
        children: null,
        className: "site-layout",
      }),
    );

    expect(container.querySelector(".ds.workspace-layout")?.className).toBe(
      "ds workspace-layout site-layout",
    );
  });
});
