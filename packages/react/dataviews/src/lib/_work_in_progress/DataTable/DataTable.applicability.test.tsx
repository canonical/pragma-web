/**
 * A table over a collection whose records come in several types:
 * a field one type does not carry draws a state told apart from empty, a
 * column over such a field says which types it applies to, a column may
 * narrow that further and is checked where it mounts, and a page carrying a
 * record of a type the collection does not declare fails visibly.
 */
import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import expectNoAxeViolations from "../../../../testing/expectNoAxeViolations.js";
import { pageOf } from "../../../../testing/fixtures.js";
import {
  buildContainer,
  buildVirtualMachine,
  createInstanceProvider,
  type Instance,
  instances,
  MIXED_FLEET,
} from "../../../../testing/instances.js";
import silenceRenderErrors from "../../../../testing/silenceRenderErrors.js";
import { virtualizeRows } from "../../virtualization/index.js";
import createColumns from "./createColumns.js";
import DataTable from "./DataTable.js";
import type { DataTableColumn } from "./types.js";

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Name" },
  { id: "type", header: "Type" },
  { id: "image", header: "Image" },
];

/** The data rows of the one table on screen, in order. */
const dataRows = (): readonly HTMLElement[] =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .filter((row) => within(row).queryAllByRole("cell").length > 0);

/** The cells of a row named by its first cell's text. */
const cellsOf = (name: string): readonly HTMLElement[] => {
  const row = dataRows().find(
    (candidate) =>
      within(candidate).getAllByRole("cell").at(0)?.textContent === name,
  );
  if (row === undefined) {
    throw new Error(`no row is named "${name}"`);
  }
  return within(row).getAllByRole("cell");
};

/** A table over a source answering every request at once with `rows`. */
const loadedTable = (
  rows: readonly Instance[] = MIXED_FLEET,
  shown: readonly DataTableColumn[] = columns,
) => {
  const { provider } = createInstanceProvider({ rows });
  render(<DataTable provider={provider} columns={shown} label="Instances" />);
  return provider;
};

describe("a table over records of several types", () => {
  it("draws a dash for a field the row's type does not carry, read as not applicable", () => {
    loadedTable();
    const [, , image] = cellsOf("db-01");
    // A virtual machine runs from no image: the field is not one of its own.
    // The dash is seen and not read; the word is read and not seen.
    expect(image).toHaveTextContent(/^—Not applicable$/);
    expect(image).toHaveAccessibleName("Not applicable");
    expect(image?.querySelector("[aria-hidden]")).toHaveTextContent("—");
    expect(
      image?.querySelector(".data-views-not-applicable"),
    ).not.toHaveAttribute("hidden");
    expect(cellsOf("web-01").at(2)).toHaveTextContent(/^ubuntu:24\.04$/);
  });

  it("tells a field the type does not carry apart from one holding no value", () => {
    loadedTable([
      buildContainer("i-1", "bare", ""),
      buildVirtualMachine("i-2", "vm"),
    ]);
    // A container with no image named is a value that is empty: nothing is
    // drawn and nothing is read, where the machine's cell says why.
    expect(cellsOf("bare").at(2)).toHaveTextContent(/^$/);
    expect(cellsOf("bare").at(2)).toHaveAccessibleName("");
    expect(cellsOf("vm").at(2)).toHaveTextContent(/^—Not applicable$/);
  });

  it("names the types a scoped column applies to in its header, read and not drawn", () => {
    loadedTable();
    const image = screen.getByRole("columnheader", { name: "Image" });
    // Named by its label alone, described by the types: the description is
    // what a reader reaches, so the text is clipped and never hidden.
    expect(image).toHaveAccessibleDescription("Applies to container");
    // A column over a field every type carries says nothing of types.
    const name = screen.getByRole("columnheader", { name: "Name" });
    expect(name).not.toHaveAccessibleDescription();
    expect(name.querySelector(".scope")).toBeNull();
  });

  it("narrows a column to the types it names, and says so in its header", () => {
    loadedTable(MIXED_FLEET, [
      { id: "name", header: "Name" },
      {
        id: "vm-status",
        field: "status",
        header: "VM status",
        appliesTo: ["virtual-machine"],
      },
    ]);
    expect(cellsOf("db-01").at(1)).toHaveTextContent(/^stopped$/);
    expect(cellsOf("web-01").at(1)).toHaveAccessibleName("Not applicable");
    expect(
      screen.getByRole("columnheader", { name: "VM status" }),
    ).toHaveAccessibleDescription("Applies to virtual-machine");
  });

  it("fails where it mounts for a column naming a type its field does not apply to", () => {
    silenceRenderErrors();
    expect(() =>
      loadedTable(MIXED_FLEET, [
        { id: "image", header: "Image", appliesTo: ["virtual-machine"] },
      ]),
    ).toThrow(
      'DataTable column "image" applies to "virtual-machine", which its field "image" does not',
    );
  });

  it("hands a column's own content the record and its applicability, and no value where the field does not apply", () => {
    loadedTable(
      MIXED_FLEET,
      createColumns(instances, [
        { field: "name", header: "Name" },
        {
          field: "image",
          header: "Image",
          cell: ({ value, record, applicability }) =>
            `${applicability}:${record.type}:${String(value)}`,
        },
      ]),
    );
    expect(cellsOf("web-01").at(1)).toHaveTextContent(
      /^applies:container:ubuntu:24\.04$/,
    );
    expect(cellsOf("db-01").at(1)).toHaveTextContent(
      /^not-applicable:virtual-machine:undefined$/,
    );
  });

  it("refuses a page carrying a record of a type the collection does not declare, visibly", () => {
    const { provider, source } = createInstanceProvider();
    render(
      <DataTable provider={provider} columns={columns} label="Instances" />,
    );
    // What a server that added a type sends: the display cannot say which
    // fields apply to it, so the page is refused rather than drawn wrong.
    const rogue = {
      id: "x-1",
      name: "odd",
      type: "sandbox",
    } as unknown as Instance;
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: pageOf([...MIXED_FLEET, rogue]),
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      'record type "sandbox" of row "x-1" is not declared',
    );
    expect(screen.queryByText("web-01")).toBeNull();
  });

  it("has no axe violation with a not-applicable cell and a scoped header", async () => {
    loadedTable();
    await expectNoAxeViolations(screen.getByRole("table"));
  });
});

describe("a table's own render ceiling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("warns of the rows it draws, and not where they are virtualized", () => {
    const warned = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rows = Array.from({ length: 501 }, (_, index) =>
      buildContainer(`i-${index}`, `host-${index}`),
    );
    const { provider } = createInstanceProvider({ rows });
    const view = render(
      <DataTable provider={provider} columns={columns} label="Instances" />,
    );
    expect(warned.mock.calls.at(0)?.at(0)).toMatch(
      /^DataTable renders 501 rows at once/,
    );
    view.unmount();
    warned.mockClear();
    const { provider: other } = createInstanceProvider({ rows });
    render(
      <DataTable
        provider={other}
        columns={columns}
        label="Instances"
        virtualization={virtualizeRows({ estimatedRowHeight: 32 })}
      />,
    );
    expect(warned).not.toHaveBeenCalled();
  });
});

describe("a scoped column that is sorted", () => {
  it("describes its control by its place in the ordering and its types, and its heading by its types", () => {
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    render(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name" },
          { id: "image", header: "Image", sortable: true },
        ]}
        label="Instances"
      />,
    );
    act(() => {
      provider.setSort([{ field: "image", direction: "asc" }]);
    });
    const heading = screen.getByRole("columnheader", { name: "Image" });
    const control = within(heading).getByRole("button", { name: "Image" });
    expect(control).toHaveAccessibleDescription(/ascending/);
    expect(control).toHaveAccessibleDescription(/Applies to container$/);
    expect(heading).toHaveAccessibleDescription("Applies to container");
  });
});
