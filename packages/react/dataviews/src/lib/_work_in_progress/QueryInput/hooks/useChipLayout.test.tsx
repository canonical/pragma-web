import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useChipLayout from "./useChipLayout.js";

/** A content row whose chips' list is `width` px wide, each chip 60 px wide. */
const createRow = (count: number, width: number, wraps = false) => {
  const content = document.createElement("div");
  content.innerHTML = `<ul role="list">${"<li></li>".repeat(count)}</ul>`;
  const list = content.firstElementChild;
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function (this: Element) {
      if (this === list) {
        return { left: 0, right: width, top: 0, bottom: 26 } as DOMRect;
      }
      const index = [...(this.parentElement?.children ?? [])].indexOf(this);
      const top = wraps ? index * 30 : 0;
      const left = wraps ? 0 : index * 60;
      return { left, right: left + 60, top, bottom: top + 24 } as DOMRect;
    },
  );
  return { current: content };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useChipLayout", () => {
  it("counts the chips and those past the line's end", () => {
    const { result } = renderHook(() =>
      useChipLayout({ contentRef: createRow(3, 130) }),
    );
    expect(result.current.hiddenCount).toBe(1);
  });

  it("counts the chips on later rows while the field wraps", () => {
    const { result } = renderHook(() =>
      useChipLayout({ contentRef: createRow(3, 130, true) }),
    );
    expect(result.current.hiddenCount).toBe(2);
  });

  it("counts no chip hidden among chips of two heights on one line", () => {
    const contentRef = createRow(2, 130);
    vi.mocked(Element.prototype.getBoundingClientRect).mockImplementation(
      function (this: Element) {
        if (this === contentRef.current.firstElementChild) {
          return { left: 0, right: 130, top: 0, bottom: 26 } as DOMRect;
        }
        // A joined 26 px chip, then a separated 24 px one centred beside it.
        const isFirst = this.previousElementSibling === null;
        return (
          isFirst
            ? { left: 0, right: 60, top: 0, bottom: 26 }
            : { left: 60, right: 120, top: 1, bottom: 25 }
        ) as DOMRect;
      },
    );
    const { result } = renderHook(() => useChipLayout({ contentRef }));
    expect(result.current.hiddenCount).toBe(0);
  });

  it("counts chips before the line's start, as in right-to-left text", () => {
    const contentRef = createRow(1, 130);
    vi.mocked(Element.prototype.getBoundingClientRect).mockImplementation(
      function (this: Element) {
        return (
          this === contentRef.current.firstElementChild
            ? { left: 0, right: 130, top: 0, bottom: 24 }
            : { left: -10, right: 50, top: 0, bottom: 24 }
        ) as DOMRect;
      },
    );
    const { result } = renderHook(() => useChipLayout({ contentRef }));
    expect(result.current.hiddenCount).toBe(1);
  });

  it("measures nothing without a row, and keeps an unchanged layout", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useChipLayout({ contentRef: { current: null } });
    });
    const before = renders;
    act(() => result.current.measure());
    expect(result.current.hiddenCount).toBe(0);
    expect(renders).toBe(before);
  });

  it("marks the clipped chips, and unmarks them once they fit", () => {
    const contentRef = createRow(3, 130);
    const { result } = renderHook(() => useChipLayout({ contentRef }));
    const items = [...contentRef.current.querySelectorAll("li")];
    expect(items.map((item) => item.hasAttribute("data-clipped"))).toEqual([
      false,
      false,
      true,
    ]);
    vi.mocked(Element.prototype.getBoundingClientRect).mockReturnValue({
      left: 0,
      right: 60,
      top: 0,
      bottom: 24,
    } as DOMRect);
    act(() => result.current.measure());
    expect(items.some((item) => item.hasAttribute("data-clipped"))).toBe(false);
  });

  it("measures again when the row changes size", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    let onResize = () => {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          onResize = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    const contentRef = createRow(1, 130);
    const { result, unmount } = renderHook(() => useChipLayout({ contentRef }));
    expect(observe).toHaveBeenCalledWith(contentRef.current);
    contentRef.current
      .querySelector("ul")
      ?.append(document.createElement("li"), document.createElement("li"));
    act(() => onResize());
    expect(result.current.hiddenCount).toBe(1);
    // Each chip is observed too, so one that grows is measured again.
    const last = contentRef.current.querySelector("li:last-child");
    expect(observe).toHaveBeenCalledWith(last);
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("measures again once fonts load", () => {
    const fonts = new EventTarget();
    Object.defineProperty(document, "fonts", {
      value: fonts,
      configurable: true,
    });
    const contentRef = createRow(1, 130);
    const { result, unmount } = renderHook(() => useChipLayout({ contentRef }));
    contentRef.current
      .querySelector("ul")
      ?.append(document.createElement("li"), document.createElement("li"));
    act(() => {
      fonts.dispatchEvent(new Event("loadingdone"));
    });
    expect(result.current.hiddenCount).toBe(1);
    unmount();
    Reflect.deleteProperty(document, "fonts");
  });
});
