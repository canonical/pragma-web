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

describe("headings written as inline elements", () => {
  it("render no row again when the table renders again", () => {
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
            { id: "name", header: <span>Name</span> },
            { id: "status", header: <span>Status</span> },
          ]}
          label="Machines"
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
