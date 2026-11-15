/**
 * The columns one table renders, as the presentation arranges them: in the
 * stored order, less the hidden ones, held at one reference while they are
 * the same.
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createMachineProvider from "../../../../../testing/createMachineProvider.js";
import type { DataTableColumn } from "../types.js";
import useColumnArrangement from "./useColumnArrangement.js";

const NAME: DataTableColumn = { id: "name", header: "Name" };
const STATUS: DataTableColumn = { id: "status", header: "Status" };
const CORES: DataTableColumn = { id: "cores", header: "Cores" };

/** A hook over a fresh provider's presentation, counting its renders. */
const mount = (columns: readonly DataTableColumn[]) => {
  const { presentation } = createMachineProvider().provider;
  let renders = 0;
  const hook = renderHook(
    ({ declared }) => {
      renders += 1;
      return useColumnArrangement({ presentation, columns: declared });
    },
    { initialProps: { declared: columns } },
  );
  return { presentation, hook, readRenders: () => renders };
};

describe("useColumnArrangement", () => {
  it("lists the declared columns in the stored order, less the hidden ones", () => {
    const { presentation, hook } = mount([NAME, STATUS, CORES]);
    expect(hook.result.current).toEqual([NAME, STATUS, CORES]);
    act(() => {
      presentation.arrange({
        "table.order": ["cores", "name", "status"],
        "table.hidden": ["status"],
      });
    });
    expect(hook.result.current).toEqual([CORES, NAME]);
  });

  it("keeps the list's reference when a width is written", () => {
    const { presentation, hook, readRenders } = mount([NAME, STATUS]);
    const columns = hook.result.current;
    const renders = readRenders();
    act(() => {
      presentation.arrange({ "table.width.name": 180 });
    });
    expect(hook.result.current).toBe(columns);
    expect(readRenders()).toBe(renders);
  });

  it("keeps the reference when the caller rebuilds equal columns inline", () => {
    const { hook } = mount([NAME, STATUS]);
    const columns = hook.result.current;
    hook.rerender({ declared: [{ ...NAME }, { ...STATUS }] });
    expect(hook.result.current).toBe(columns);
    hook.rerender({ declared: [{ ...NAME, header: "Host" }, STATUS] });
    expect(hook.result.current).not.toBe(columns);
  });

  it("never hides a column declared hideable: false", () => {
    const pinned: DataTableColumn = { ...NAME, hideable: false };
    const { presentation, hook } = mount([pinned, STATUS]);
    act(() => {
      presentation.arrange({ "table.hidden": ["name", "status"] });
    });
    expect(hook.result.current).toEqual([pinned]);
  });
});
