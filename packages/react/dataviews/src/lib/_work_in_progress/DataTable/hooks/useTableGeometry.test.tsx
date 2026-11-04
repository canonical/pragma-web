/**
 * One table's geometry, resolved from its layout and its container: the
 * declarative tracks before the container is measured, the solved widths
 * after, the room the reserving cells take, and a live resize's preview.
 */
import {
  type ColumnToSize,
  createColumnLayout,
  createGridInteraction,
} from "@canonical/dataviews-core/bindings";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import createMachineProvider from "../../../../../testing/createMachineProvider.js";
import useTableGeometry from "./useTableGeometry.js";

/** An element whose layout width is `width`, as jsdom measures nothing. */
const measured = (
  width: number,
  property: "clientWidth" | "offsetWidth" = "clientWidth",
): HTMLDivElement => {
  const node = document.createElement("div");
  Object.defineProperty(node, property, { value: width });
  return node;
};

const mount = (columns: readonly ColumnToSize[]) => {
  const layout = createColumnLayout({
    columns,
    presentation: createMachineProvider().provider.presentation,
  });
  const interaction = createGridInteraction(layout);
  const ids = columns.map((column) => column.id);
  const hook = renderHook(() => useTableGeometry(layout, interaction, ids));
  return { interaction, hook };
};

const FIXED_NAME: ColumnToSize = {
  id: "name",
  sizing: { kind: "fixed", px: 100 },
};

const FLEX_STATUS: ColumnToSize = {
  id: "status",
  sizing: { kind: "flex", weight: 1, minPx: 50 },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useTableGeometry", () => {
  it("declares its tracks before the container is measured", () => {
    const { hook } = mount([FIXED_NAME, FLEX_STATUS]);
    expect(hook.result.current.template).toBe("100px minmax(50px, 1fr)");
    // Each column's own reservation: what a resize captures before then.
    expect(hook.result.current.widths).toEqual([100, 50]);
  });

  it("gives a flexible last column what the others leave of the container", () => {
    const { hook } = mount([FIXED_NAME, FLEX_STATUS]);
    act(() => {
      hook.result.current.attach(measured(400));
    });
    expect(hook.result.current.widths).toEqual([100, 300]);
    expect(hook.result.current.template).toBe("100px 300px");
  });

  it("shares only what the reserving cells leave, until each is released", () => {
    const { hook } = mount([FIXED_NAME, FLEX_STATUS]);
    act(() => {
      hook.result.current.attach(measured(400));
    });
    let release = () => {};
    act(() => {
      release = hook.result.current.reserve(measured(48, "offsetWidth"));
    });
    expect(hook.result.current.widths).toEqual([100, 252]);
    act(() => {
      release();
    });
    expect(hook.result.current.widths).toEqual([100, 300]);
  });

  it("follows the container as it is resized", () => {
    const observed: ResizeObserverCallback[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          observed.push(callback);
        }
        observe(): void {}
        disconnect(): void {}
      },
    );
    const { hook } = mount([FIXED_NAME, FLEX_STATUS]);
    act(() => {
      hook.result.current.attach(measured(400));
    });
    act(() => {
      observed[0]?.(
        [{ contentRect: { width: 250 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      );
    });
    expect(hook.result.current.widths).toEqual([100, 150]);
  });

  it("measures once, and observes nothing, where there is no observer", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    const { hook } = mount([FIXED_NAME, FLEX_STATUS]);
    let detach: (() => void) | undefined = () => {};
    act(() => {
      detach = hook.result.current.attach(measured(400));
    });
    expect(detach).toBeUndefined();
    expect(hook.result.current.widths).toEqual([100, 300]);
  });

  it("previews a live resize, the flexible last column following the edge", () => {
    const { hook, interaction } = mount([
      { id: "name", sizing: { kind: "flex", weight: 1, minPx: 50 } },
      FLEX_STATUS,
    ]);
    act(() => {
      hook.result.current.attach(measured(400));
    });
    act(() => {
      interaction.startResize("name", 0, 200);
      interaction.preview(-80);
    });
    expect(hook.result.current.template).toBe("120px 280px");
    // The solved widths stay the layout's until the resize commits.
    expect(hook.result.current.widths).toEqual([200, 200]);
  });

  it("publishes no tracks without columns", () => {
    const { hook } = mount([]);
    expect(hook.result.current.template).toBeUndefined();
    expect(hook.result.current.widths).toEqual([]);
  });
});
