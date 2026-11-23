import { renderHook } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../../testing/buildMachine.js";
import createFakeChannel from "../../../../testing/createFakeChannel.js";
import { machines } from "../../../../testing/machines.js";
import CellContext from "./CellContext.js";

describe("CellContext", () => {
  it("holds null where no cell is installed", () => {
    const { result } = renderHook(() => useContext(CellContext));
    expect(result.current).toBeNull();
  });

  it("carries the installed cell", () => {
    const machine = buildMachine("m-1", "alpha");
    const cell = {
      collection: machines,
      rowId: machine.id,
      columnId: "name",
      record: createFakeChannel<unknown>(machine),
      fields: {},
      selected: createFakeChannel(false),
    };
    const { result } = renderHook(() => useContext(CellContext), {
      wrapper: ({ children }) => (
        <CellContext value={cell}>{children}</CellContext>
      ),
    });
    expect(result.current).toBe(cell);
  });
});
