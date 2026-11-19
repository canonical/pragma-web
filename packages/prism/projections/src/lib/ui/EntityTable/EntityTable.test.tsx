import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { THING_ROUTES } from "../../../../testing/fixtures.js";
import EntityTable from "./EntityTable.js";
import type { EntityTableProps } from "./types.js";

const PROPS: EntityTableProps = {
  columns: [
    { field: "servesLine", header: "Line", href: "/x?sort=servesLine" },
    {
      field: "inZone",
      header: "Zone",
      href: "/x?sort=-inZone",
      sorted: "ascending",
    },
  ],
  rows: [
    {
      key: "a",
      title: "Bank",
      cells: [
        { field: "servesLine", text: "Central Line" },
        { field: "inZone", text: "Zone 1" },
      ],
    },
    {
      key: "b",
      title: "Angel",
      cells: [
        { field: "servesLine", text: "Northern Line" },
        { field: "inZone", text: null },
      ],
    },
  ],
};

/** The table under a router, which its sort links need. */
const renderTable = (props: Partial<EntityTableProps> = {}) =>
  render(
    (
      <RouterProvider
        router={createRouter(THING_ROUTES, {
          adapter: createMemoryAdapter("/"),
        })}
      >
        <EntityTable {...PROPS} {...props} />
      </RouterProvider>
    ) as ReactElement,
  );

describe("EntityTable", () => {
  it("heads each value column with a link that sorts by it", () => {
    renderTable();
    expect(screen.getByRole("link", { name: "Line" })).toHaveAttribute(
      "href",
      "/x?sort=servesLine",
    );
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((header) => header.textContent)).toEqual([
      "Name",
      "Line",
      "Zone",
    ]);
    expect(headers.at(2)).toHaveAttribute("aria-sort", "ascending");
    expect(headers.at(1)).not.toHaveAttribute("aria-sort");
  });

  it("draws a row per entity with its values under their fields", () => {
    renderTable();
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    const cells = screen
      .getAllByRole("cell")
      .filter((cell) => cell.dataset.property !== undefined);
    expect(
      cells.map((cell) => [cell.dataset.property, cell.textContent]),
    ).toEqual([
      ["servesLine", "Central Line"],
      ["inZone", "Zone 1"],
      ["servesLine", "Northern Line"],
      ["inZone", ""],
    ]);
  });

  it("highlights the selected row only", () => {
    renderTable({ selected: "b" });
    const [, first, second] = screen.getAllByRole("row");
    expect(second).toHaveAttribute("aria-current", "true");
    expect(second).toHaveClass("is-selected");
    expect(first).not.toHaveAttribute("aria-current");
  });

  it("takes one line a row unless told two", () => {
    const { container, unmount } = renderTable();
    expect(container.querySelector(".entity-table")).toHaveClass("is-one-line");
    unmount();
    const two = renderTable({ lines: "two" });
    expect(two.container.querySelector(".entity-table")).toHaveClass(
      "is-two-line",
    );
  });
});
