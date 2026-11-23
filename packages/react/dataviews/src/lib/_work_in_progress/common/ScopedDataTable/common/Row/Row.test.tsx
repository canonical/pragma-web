import {
  createRowScopes,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { act, render, screen, within } from "@testing-library/react";
import { createRef, type ReactNode, type Ref } from "react";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  deliverRows,
} from "../../../../../../../testing/index.js";
import Row from "./Row.js";

const COLUMNS = [
  { id: "name", header: "Name" },
  { id: "host", header: "Host", field: "status" },
] as const;

/** One delivered machine's row, its scopes observed for the test. */
const mountRow = ({
  selectable = false,
  position = undefined as number | undefined,
  gap = undefined as number | undefined,
  ref = undefined as Ref<HTMLTableRowElement> | undefined,
} = {}) => {
  const { provider } = createMachineProvider();
  const host = readProviderHost(provider);
  host.complete(
    host.refresh(),
    deliverRows([buildMachine("m-1", "alpha", "failed")]),
  );
  const scopes = createRowScopes({
    rows: provider.rows,
    selection: provider.selection,
    fields: ["name", "status"],
  });
  onTestFinished(scopes.observe());
  render(
    <Row
      provider={provider}
      channels={scopes.readRow("m-1")}
      columns={COLUMNS}
      selectable={selectable}
      getRowLabel={(row) => row.name}
      position={position}
      gap={gap}
      ref={ref}
    />,
    {
      container: document.body.appendChild(document.createElement("table")),
      wrapper: ({ children }: { readonly children: ReactNode }) => (
        <tbody>{children}</tbody>
      ),
    },
  );
  return { provider };
};

describe("Row", () => {
  it("draws a cell per column, each reading its own field", () => {
    mountRow();
    const row = screen.getByRole("row");
    expect(row).toHaveClass("ds", "data-table-row");
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["alpha", "failed"]);
  });

  it("offers no selection where none is offered", () => {
    mountRow();
    const row = screen.getByRole("row");
    expect(row).not.toHaveAttribute("aria-selected");
    expect(within(row).queryByRole("checkbox")).toBeNull();
  });

  it("marks the row as its selection channel says", () => {
    const { provider } = mountRow({ selectable: true });
    const row = screen.getByRole("row");
    expect(row).toHaveAttribute("aria-selected", "false");
    act(() => {
      provider.selection.toggle("m-1");
    });
    expect(row).toHaveAttribute("aria-selected", "true");
    expect(row.className).toBe("ds data-table-row");
    expect(
      within(row).getByRole("checkbox", { name: "Select alpha" }),
    ).toBeChecked();
  });

  it("reports its position and hands its element to the ref", () => {
    const ref = createRef<HTMLTableRowElement>();
    mountRow({ position: 3, ref });
    const row = screen.getByRole("row");
    expect(row).toHaveAttribute("aria-rowindex", "3");
    expect(ref.current).toBe(row);
  });

  it("draws the unmounted space before it as its top margin", () => {
    mountRow({ gap: 40 });
    expect(screen.getByRole("row")).toHaveStyle({ marginBlockStart: "40px" });
  });
});
