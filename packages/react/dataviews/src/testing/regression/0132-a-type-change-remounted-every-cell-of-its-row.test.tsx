/**
 * Regression: a record returning as another type draws its cells again
 * without remounting them, so a column's own content keeps its state.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  createWorkloadProvider,
  elementAt,
  WORKLOAD_RECORDS,
  WORKLOAD_RETYPED,
  type Workload,
} from "../../../testing/index.js";
import type { DisplayFieldCellProps } from "../../lib/common/index.js";
import { DataTable } from "../../lib/pattern/DataViews/common/renderers/DataTable/index.js";

/** Content holding a count of its own, and naming the record's type. */
const Counted = ({ record }: DisplayFieldCellProps<unknown, Workload>) => {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      {record.type} {count}
    </button>
  );
};

describe("regression 0132 — a type change remounted every cell of its row", () => {
  it("keeps the content's state across a type change, naming the new type", () => {
    const { provider, source } = createWorkloadProvider([
      elementAt(WORKLOAD_RECORDS, 0),
    ]);
    onTestFinished(provider.observe());
    render(
      <DataTable
        provider={provider}
        columns={[{ id: "name", header: "Name", cell: Counted }]}
        label="Workloads"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "container 0" }));
    act(() => {
      source.setRows([WORKLOAD_RETYPED]);
      provider.refresh();
    });
    expect(screen.getByRole("button", { name: "vm 1" })).toBeVisible();
  });
});
