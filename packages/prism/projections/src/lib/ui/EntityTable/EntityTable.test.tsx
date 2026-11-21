import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import {
  ENTITY_TABLE_PROPS,
  THING_ROUTES,
} from "../../../../testing/fixtures.js";
import EntityTable from "./EntityTable.js";
import type { EntityTableProps } from "./types.js";

/** The table under a router, which its sort links need. */
const renderTable = (props: Partial<EntityTableProps> = {}) =>
  render(
    (
      <RouterProvider
        router={createRouter(THING_ROUTES, {
          adapter: createMemoryAdapter("/"),
        })}
      >
        <EntityTable {...ENTITY_TABLE_PROPS} {...props} />
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

  it("marks a number column's header and cells to read from their end", () => {
    const { container } = renderTable({
      columns: ENTITY_TABLE_PROPS.columns.map((column, index) =>
        index === 0 ? { ...column, numeric: true } : column,
      ),
    });
    const field = ENTITY_TABLE_PROPS.columns.at(0)?.field;
    const marked = [...container.querySelectorAll(".is-number")];
    expect(marked.length).toBe(1 + ENTITY_TABLE_PROPS.rows.length);
    for (const cell of marked) {
      expect(cell).toHaveAttribute("data-property", field);
    }
  });

  it("draws a row per entity with its values under their fields", () => {
    renderTable();
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(2);
    const cells = screen
      .getAllByRole("cell")
      .filter((cell) => cell.dataset.property !== undefined);
    expect(
      cells.map((cell) => [
        cell.dataset.property,
        cell.querySelector(".detail")?.textContent ?? "",
      ]),
    ).toEqual([
      ["servesLine", "Central Line"],
      ["inZone", "Zone 1"],
      ["servesLine", "Northern Line"],
      ["inZone", ""],
    ]);
  });

  it("labels each value with its field's header, for the folded row", () => {
    renderTable();
    const [first, , , empty] = screen
      .getAllByRole("cell")
      .filter((cell) => cell.dataset.property !== undefined);
    expect(first?.querySelector(".term")?.textContent).toBe("Line");
    expect(first?.textContent).toBe("Line Central Line");
    expect(empty?.childElementCount).toBe(0);
  });

  it("marks the values after the first two as the folded row's later ones", () => {
    const { container } = renderTable({
      columns: [
        ...ENTITY_TABLE_PROPS.columns,
        { field: "platformCount", header: "Platforms", href: "/x" },
      ],
      rows: [
        {
          key: "a",
          title: "Bank",
          cells: [
            { field: "servesLine", text: "Central Line" },
            { field: "inZone", text: "Zone 1" },
            { field: "platformCount", text: "8" },
          ],
        },
      ],
    });
    expect(
      Array.from(container.querySelectorAll("td"), (cell) => cell.className),
    ).toEqual(["value", "value", "value is-later"]);
  });

  it("folds the first two values that are not empty, an empty cell holding nothing", () => {
    const { container } = renderTable({
      columns: [
        ...ENTITY_TABLE_PROPS.columns,
        { field: "platformCount", header: "Platforms", href: "/x" },
        { field: "platformLength", header: "Length", href: "/x" },
      ],
      rows: [
        {
          key: "a",
          title: "Bank",
          cells: [
            { field: "servesLine", text: null },
            { field: "inZone", text: "Zone 1" },
            { field: "platformCount", text: "8" },
            { field: "platformLength", text: "120" },
          ],
        },
      ],
    });
    const cells = Array.from(container.querySelectorAll("td"));
    expect(cells.map((cell) => cell.className)).toEqual([
      "value is-empty",
      "value",
      "value",
      "value is-later",
    ]);
    expect(cells.at(0)?.childNodes).toHaveLength(0);
  });

  it("highlights the selected row only", () => {
    renderTable({ selected: "b" });
    const [, first, second] = screen.getAllByRole("row");
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(first).not.toHaveAttribute("aria-selected");
  });

  it("takes one line a row unless told two", () => {
    const { container, unmount } = renderTable();
    expect(container.querySelectorAll(".row.is-two-line")).toHaveLength(0);
    unmount();
    const two = renderTable({ lines: "two" });
    expect(two.container.querySelectorAll(".row.is-two-line")).toHaveLength(2);
  });
});
