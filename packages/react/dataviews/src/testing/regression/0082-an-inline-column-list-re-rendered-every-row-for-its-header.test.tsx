/**
 * The row header the rows were handed was read off the caller's own column
 * list and rebuilt as a fresh object, so a caller writing its columns inline
 * — which the table promises costs no row a render — handed every row a new
 * header on every render, and every row rendered again.
 *
 * The rows read their header from the content-stable list the rest of the
 * tree reads.
 */

import { act, render } from "@testing-library/react";
import { createElement, memo, type ReactElement, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import type { RowProps } from "../../lib/_work_in_progress/DataTable/common/Row/types.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

const renders = vi.hoisted(() => ({ rows: [] as string[] }));

vi.mock(
  "../../lib/_work_in_progress/DataTable/common/Row/Row.js",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../lib/_work_in_progress/DataTable/common/Row/Row.js")
      >();
    // Compared as the row itself is, so it renders exactly when the row does.
    const Counted = memo((props: RowProps<object>) => {
      renders.rows.push(props.channels.id);
      return createElement(actual.default, props);
    });
    return { default: Counted };
  },
);

describe("a column list written inline, with a row header", () => {
  it("renders no row again when the table renders again", () => {
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
            { id: "name", header: "Name", rowHeader: true },
            { id: "status", header: "Status" },
          ]}
          label="Machines"
          selectable
        />
      );
    };
    render(<Host />);
    // Counted at all, so a mock that stopped applying cannot pass unseen.
    expect(renders.rows.length).toBeGreaterThan(0);
    renders.rows.length = 0;
    act(() => {
      rerender();
    });
    expect(renders.rows).toEqual([]);
  });
});
