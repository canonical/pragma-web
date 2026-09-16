/**
 * The connected table's footer defaulted to `<DataViews.Pagination />`
 * written as a default parameter, so every render of the table minted a new
 * element and the bar rendered again with it, though nothing of the bar's
 * had changed.
 *
 * The default is one element, minted once, so React reconciles the same
 * element and renders the bar only for its own reasons.
 */

import { act, render } from "@testing-library/react";
import { type ReactElement, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataViews } from "../../lib/_work_in_progress/DataViews/index.js";

const renders = vi.hoisted(() => ({ count: 0 }));

vi.mock(
  "../../lib/_work_in_progress/DataViews/common/Pagination/Pagination.js",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../lib/_work_in_progress/DataViews/common/Pagination/Pagination.js")
      >();
    // A pass-through: the real bar renders, and each render is counted.
    return {
      default: (props: Parameters<typeof actual.default>[0]) => {
        renders.count += 1;
        return actual.default(props);
      },
    };
  },
);

describe("the connected table's default footer", () => {
  it("renders the bar once for renders of the table alone", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    let rerender: () => void = () => undefined;
    const Host = (): ReactElement => {
      const [tick, setTick] = useState(0);
      rerender = () => setTick(tick + 1);
      return (
        <DataViews provider={provider}>
          <DataViews.DataTable
            columns={[{ id: "name", header: "Name" }]}
            label={`Machines ${tick}`}
          />
        </DataViews>
      );
    };
    render(<Host />);
    const before = renders.count;
    // Counted at all, so a mock that stopped applying cannot pass unseen.
    expect(before).toBeGreaterThan(0);
    act(() => {
      rerender();
    });
    expect(renders.count).toBe(before);
  });
});
