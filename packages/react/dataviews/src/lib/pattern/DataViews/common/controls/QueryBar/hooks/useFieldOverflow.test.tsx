/**
 * How far the focused field reaches past its resting line, kept on the
 * bar's root.
 */
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useFieldOverflow from "./useFieldOverflow.js";

/** A root holding a QueryInput whose field is `field` tall over `input`. */
const createRoot = (input: number, field: number) => {
  const root = document.createElement("div");
  root.innerHTML =
    '<div class="ds query-input"><div class="field"></div></div>';
  const inputElement = root.querySelector<HTMLElement>(".ds.query-input");
  const fieldElement = root.querySelector<HTMLElement>(".field");
  const box = (height: number) => () => ({ height }) as DOMRect;
  if (inputElement === null || fieldElement === null) throw new Error("");
  inputElement.getBoundingClientRect = box(input);
  let fieldHeight = field;
  fieldElement.getBoundingClientRect = () =>
    ({ height: fieldHeight }) as DOMRect;
  return {
    root,
    grow: (height: number) => {
      fieldHeight = height;
    },
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useFieldOverflow", () => {
  it("keeps how far the field reaches past its line, and clears it on unmount", () => {
    let onResize = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          onResize = callback;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
    const { root, grow } = createRoot(40, 40);
    const { unmount } = renderHook(() =>
      useFieldOverflow({ rootRef: { current: root } }),
    );
    expect(
      root.style.getPropertyValue("--data-views-query-bar-field-overflow"),
    ).toBe("0px");
    grow(96);
    onResize();
    expect(
      root.style.getPropertyValue("--data-views-query-bar-field-overflow"),
    ).toBe("56px");
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(
      root.style.getPropertyValue("--data-views-query-bar-field-overflow"),
    ).toBe("");
  });

  it("leaves the rows where they rest without an observer or a field", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    const { root } = createRoot(40, 96);
    renderHook(() => useFieldOverflow({ rootRef: { current: root } }));
    expect(
      root.style.getPropertyValue("--data-views-query-bar-field-overflow"),
    ).toBe("");
    renderHook(() => useFieldOverflow({ rootRef: { current: null } }));
    const bare = document.createElement("div");
    renderHook(() => useFieldOverflow({ rootRef: { current: bare } }));
    bare.innerHTML = '<div class="ds query-input"></div>';
    renderHook(() => useFieldOverflow({ rootRef: { current: bare } }));
    expect(
      bare.style.getPropertyValue("--data-views-query-bar-field-overflow"),
    ).toBe("");
  });
});
