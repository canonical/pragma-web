import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createDefinitionsLayout from "../../../testing/createDefinitionsLayout.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";
import { useLensFilter } from "../LensFilter/index.js";

/** A routed page that prints the namespaces the shared filter allows. */
const FilterProbe = () => {
  const { filter } = useLensFilter();
  return <output>{filter.namespaces.join(",") || "untouched"}</output>;
};

describe("DefinitionsLayout", () => {
  it("renders the site's rail and colophon around the canvas", () => {
    render(
      createDefinitionsLayout({
        url: "/definitions",
        records: definitionsExplorerRecords,
        fetchFn: createFetchSpy(),
        rail: <nav aria-label="Site rail" />,
        colophon: <footer>Colophon</footer>,
        children: <p>Routed page</p>,
      }),
    );

    expect(screen.getByRole("navigation", { name: "Site rail" })).toBeVisible();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Colophon");
    expect(screen.getByText("Routed page")).toBeInTheDocument();
  });

  it("renders no footer band when the site gives no colophon", () => {
    render(
      createDefinitionsLayout({
        url: "/definitions",
        records: definitionsExplorerRecords,
        fetchFn: createFetchSpy(),
        rail: null,
        children: null,
      }),
    );

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
    expect(screen.getByRole("status")).toHaveTextContent("surface,ds,cs");
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

    expect(container.querySelector(".ds.definitions-layout")?.className).toBe(
      "ds definitions-layout site-layout",
    );
  });
});
