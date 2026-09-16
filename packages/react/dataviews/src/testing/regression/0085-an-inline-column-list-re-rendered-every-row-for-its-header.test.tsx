/**
 * The row header the rows were handed was read off the caller's own column
 * list and rebuilt as a fresh object, so a caller writing its columns inline
 * — which the table promises costs no row a render — handed every row a new
 * header on every render, and every row and its checkbox rendered again.
 *
 * The rows read their header from the content-stable list the rest of the
 * tree reads.
 */
import { render } from "@testing-library/react";
import { act, type ReactElement, useState } from "react";
import { describe, expect, it } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import type { DisplayFieldCellProps } from "../../lib/common/index.js";

describe("a column list written inline, with a row header", () => {
  it("re-renders no cell when the table renders again", () => {
    const renders: string[] = [];
    const Probe = ({ rowId, columnId }: DisplayFieldCellProps) => {
      renders.push(`${rowId}/${columnId}`);
      return null;
    };
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha"), machine("m-2", "beta")],
    });
    let rerender: () => void = () => undefined;
    const Host = (): ReactElement => {
      const [tick, setTick] = useState(0);
      rerender = () => setTick(tick + 1);
      return (
        <DataTable
          provider={provider}
          // A fresh array of fresh objects on every render.
          columns={[
            { id: "name", header: "Name", rowHeader: true, cell: Probe },
            { id: "status", header: "Status", cell: Probe },
          ]}
          label="Machines"
          selectable
        />
      );
    };
    render(<Host />);
    expect(renders).toHaveLength(4);
    renders.length = 0;
    act(() => {
      rerender();
    });
    expect(renders).toEqual([]);
  });
});
