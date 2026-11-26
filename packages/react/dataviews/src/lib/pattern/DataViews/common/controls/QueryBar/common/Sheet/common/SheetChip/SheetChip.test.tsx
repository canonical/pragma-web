/**
 * One applied clause in the sheet, read-only, its remove control its one
 * stop.
 */
import { createMemoryLocation } from "@canonical/dataviews-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createMachineProvider } from "../../../../../../../../../../../testing/index.js";
import DataViews from "../../../../../../../../../_work_in_progress/DataViews/Provider.js";
import type { QueryClause } from "../../../../types.js";
import SheetChip from "./SheetChip.js";

/** Each kind of clause the sheet lists. */
const CLAUSES = {
  status: {
    kind: "predicate",
    id: "status__isAny__0",
    refs: [{ field: "status", operator: "isAny", nth: 0 }],
    predicate: {
      field: "status",
      operator: "isAny",
      operands: ["running", "failed"],
    },
    condition: "inclusion",
  },
  name: {
    kind: "predicate",
    id: "name__contains__0",
    refs: [{ field: "name", operator: "contains", nth: 0 }],
    predicate: { field: "name", operator: "contains", operands: ["web"] },
    condition: "match",
  },
  cores: {
    kind: "range",
    id: "cores__range",
    field: "cores",
    refs: [
      { field: "cores", operator: "gte", nth: 0 },
      { field: "cores", operator: "lte", nth: 0 },
    ],
    lower: { field: "cores", operator: "gte", operands: [2] },
    upper: { field: "cores", operator: "lte", operands: [8] },
    condition: "range",
  },
  search: { kind: "search", id: "search", refs: [], search: "alder" },
  refused: {
    kind: "refused",
    id: "refused__status",
    refs: [],
    issue: {
      parameter: "status",
      field: "status",
      code: "invalid",
      reason: "no such option",
    },
  },
} as const satisfies Record<string, QueryClause>;

/** The chip over a provider at an address, or in memory. */
const mount = (clause: QueryClause, href?: string) => {
  const onRemove = vi.fn();
  const { provider } = createMachineProvider(
    href === undefined
      ? {}
      : { location: createMemoryLocation({ href: `/m${href}` }) },
  );
  const view = render(
    <DataViews provider={provider}>
      <SheetChip clause={clause} onRemove={onRemove} />
    </DataViews>,
  );
  return { onRemove, view };
};

describe("SheetChip", () => {
  it("shows a conjunct as plain parts, its remove control its one stop", () => {
    const { onRemove, view } = mount(CLAUSES.status);
    const chip = view.container.querySelector(".ds.query-chip");
    expect(chip).toHaveAttribute("data-clause", "status__isAny__0");
    expect(chip).not.toHaveAttribute("id");
    expect(chip).toHaveTextContent("status:is any ofrunning, failed");
    expect(screen.queryByRole("group")).toBeNull();
    expect(view.container.querySelectorAll("button:not(.remove)")).toHaveLength(
      0,
    );
    const remove = screen.getByRole("button", {
      name: "Remove status is any of running, failed",
    });
    fireEvent.click(remove);
    expect(onRemove).toHaveBeenCalledWith(CLAUSES.status);
  });

  it("shows an operator spelled in words as its words alone", () => {
    const { view } = mount(CLAUSES.name);
    expect(view.container.querySelector(".ds.query-chip")).toHaveTextContent(
      "namecontainsweb",
    );
  });

  it("shows presence with no value part", () => {
    const { view } = mount({
      kind: "predicate",
      id: "name__isSet__0",
      refs: [{ field: "name", operator: "isSet", nth: 0 }],
      predicate: { field: "name", operator: "isSet", operands: [true] },
      condition: "presence",
    });
    expect(view.container.querySelectorAll("[data-part]")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Remove name has a value" }),
    ).toBeInTheDocument();
  });

  it("shows a range's field and both bounds", () => {
    const { view } = mount(CLAUSES.cores);
    expect(view.container.querySelector(".ds.query-chip")).toHaveTextContent(
      "cores≥ 2at least 2≤ 8at most 8",
    );
    expect(
      screen.getByRole("button", {
        name: "Remove cores at least 2 and at most 8",
      }),
    ).toBeInTheDocument();
  });

  it("shows the search by its text", () => {
    mount(CLAUSES.search);
    expect(
      screen.getByRole("button", { name: "Remove Search for alder" }),
    ).toBeInTheDocument();
  });

  it("shows a refusal in the error tone, cleared where there is an address", () => {
    const { onRemove, view } = mount(CLAUSES.refused, "?status=melted");
    const chip = view.container.querySelector(".ds.query-chip");
    expect(chip).toHaveClass("error");
    const clear = screen.getByRole("button", { name: "Clear status" });
    expect(clear).toHaveAccessibleDescription("status: no such option.");
    fireEvent.click(clear);
    expect(onRemove).toHaveBeenCalledWith(CLAUSES.refused);
  });

  it("offers no clear for a refusal without an address", () => {
    mount(CLAUSES.refused);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
