/**
 * The body rows were handed the rendered column list, held while its
 * columns said the same — headings compared by reference among them. A
 * caller writing its headings as inline elements, the ordinary case, handed
 * every row a new list on every render, and every row and every cell drew
 * again, though no row or cell draws a heading.
 *
 * The rows are handed a list held by what a row reads, the heading left out.
 */

import { act, render } from "@testing-library/react";
import { type ReactElement, useState } from "react";
import { describe, expect, it } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import type { DisplayFieldCellProps } from "../../lib/common/index.js";

describe("headings written as inline elements", () => {
  it("draw no cell again when the table renders again", () => {
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
          columns={[
            { id: "name", header: <span>Name</span>, cell: Probe },
            { id: "status", header: <span>Status</span>, cell: Probe },
          ]}
          label="Machines"
        />
      );
    };
    render(<Host />);
    expect(renders.length).toBeGreaterThan(0);
    renders.length = 0;
    act(() => {
      rerender();
    });
    expect(renders).toEqual([]);
  });
});
