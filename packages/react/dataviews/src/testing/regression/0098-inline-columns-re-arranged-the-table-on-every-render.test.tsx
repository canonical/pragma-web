/**
 * The table held its declared columns at one reference while they said the
 * same, and then handed the unheld list to the arrangement and to the column
 * management, which each compared it again and resolved the arrangement
 * again: a caller writing its columns inline re-arranged the table on every
 * render for columns that had not changed.
 *
 * Both are handed the held list.
 */

import { act, render } from "@testing-library/react";
import { type ReactElement, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

const calls = vi.hoisted(() => ({ count: 0 }));

vi.mock("@canonical/dataviews-core/bindings", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@canonical/dataviews-core/bindings")>();
  return {
    ...actual,
    resolveColumnArrangement: (
      ...args: Parameters<typeof actual.resolveColumnArrangement>
    ) => {
      calls.count += 1;
      return actual.resolveColumnArrangement(...args);
    },
  };
});

describe("a column list written inline", () => {
  it("resolves no arrangement again when the table renders again", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha")],
    });
    let rerender: () => void = () => undefined;
    const Host = (): ReactElement => {
      const [tick, setTick] = useState(0);
      rerender = () => setTick(tick + 1);
      return (
        <DataTable
          provider={provider}
          columns={[
            { id: "name", header: "Name" },
            { id: "status", header: "Status" },
          ]}
          label="Machines"
        />
      );
    };
    render(<Host />);
    const before = calls.count;
    // Counted at all, so a mock that stopped applying cannot pass unseen.
    expect(before).toBeGreaterThan(0);
    act(() => {
      rerender();
    });
    expect(calls.count).toBe(before);
  });
});
