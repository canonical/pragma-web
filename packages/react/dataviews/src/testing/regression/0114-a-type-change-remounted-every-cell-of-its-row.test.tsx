/**
 * A cell had to draw again when its record's type moved, so content
 * narrowing on the record read its current type. It was made to by keying
 * each cell by the type, which remounts it: a column's own content lost its
 * state, its DOM and any focus inside it whenever a record came back as
 * another type.
 *
 * The cell is handed the type and compares it, so it draws again and keeps
 * what it holds.
 */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { pageOf } from "../../../testing/fixtures.js";
import {
  container,
  createInstanceProvider,
  type Instance,
  instances,
  virtualMachine,
} from "../../../testing/instances.js";
import createColumns from "../../lib/_work_in_progress/DataTable/createColumns.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import type { DisplayFieldCellProps } from "../../lib/common/index.js";

/** Content holding state of its own, beside the type it narrows on. */
const Counted = ({ record }: DisplayFieldCellProps<string, Instance>) => {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      {record.type} {count}
    </button>
  );
};

describe("a record returning as another type", () => {
  it("draws its cells again without remounting them", () => {
    const { provider, source } = createInstanceProvider();
    render(
      <DataTable
        provider={provider}
        columns={createColumns(instances, [
          { field: "name", header: "Name", rowHeader: true },
          { id: "kind", field: "status", header: "Kind", cell: Counted },
        ])}
        label="Instances"
      />,
    );
    const deliver = (rows: readonly Instance[]) => {
      act(() => {
        source.latest().deliver({ status: "succeeded", page: pageOf(rows) });
      });
    };
    deliver([container("i-1", "host-01")]);
    const button = () =>
      within(screen.getByRole("row", { name: "host-01" })).getByRole("button");
    fireEvent.click(button());
    expect(button()).toHaveTextContent("container 1");
    act(() => {
      provider.refresh();
    });
    deliver([virtualMachine("i-1", "host-01")]);
    // The new type, and the state it held.
    expect(button()).toHaveTextContent("virtual-machine 1");
  });
});
