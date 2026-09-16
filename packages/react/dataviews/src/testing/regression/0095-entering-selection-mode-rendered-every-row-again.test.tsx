/**
 * Whether the table was in selection mode was handed to every row as a prop,
 * though no row draws it: the mode is stated on the table, and a row read it
 * only to decide what a tap does. Entering or leaving the mode therefore
 * rendered every row again, for a value none of them shows.
 *
 * The table decides what a tap does, and no row is told the mode: entering
 * it renders again the pressed row alone, whose own selection moved.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { createElement, memo } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import type { RowProps } from "../../lib/_work_in_progress/DataTable/common/Row/types.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import { LONG_PRESS_MS } from "../../lib/hooks/constants.js";

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

describe("entering selection mode", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders again the pressed row alone", () => {
    const { provider } = createMachineProvider({
      rows: [machine("m-1", "alpha"), machine("m-2", "beta")],
    });
    render(
      <DataTable
        provider={provider}
        columns={[{ id: "name", header: "Name", rowHeader: true }]}
        label="Machines"
        selectable
      />,
    );
    expect(renders.rows.length).toBeGreaterThan(0);
    renders.rows.length = 0;
    fireEvent.pointerDown(screen.getByRole("row", { name: "beta" }), {
      pointerType: "touch",
      clientX: 1,
      clientY: 1,
    });
    act(() => {
      vi.advanceTimersByTime(LONG_PRESS_MS);
    });
    expect(screen.getByRole("table")).toHaveAttribute(
      "data-selection-mode",
      "true",
    );
    expect(renders.rows).toEqual([]);
  });
});
