import { act, renderHook } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import useDropdownTrigger from "./useDropdownTrigger.js";

/** A key event as React hands it to the trigger. */
const createKey = (key: string) =>
  ({
    key,
    defaultPrevented: false,
    preventDefault: vi.fn(),
  }) as unknown as React.KeyboardEvent<HTMLButtonElement>;

describe("useDropdownTrigger", () => {
  it("targets the popover and names the anchor after it", () => {
    const { result } = renderHook(() => useDropdownTrigger({}));
    const { triggerProps, panel } = result.current;
    expect(triggerProps.popoverTarget).toBe(panel.panelId);
    expect(triggerProps.style).toEqual({ anchorName: `--${panel.panelId}` });
    expect(triggerProps.id).toBe(panel.triggerId);
    expect(triggerProps.id).not.toBe(panel.panelId);
    expect(panel.anchorName).toBe(triggerProps.style.anchorName);
  });

  it("keeps the consumer's id and style", () => {
    const { result } = renderHook(() =>
      useDropdownTrigger({ id: "status", style: { color: "red" } }),
    );
    expect(result.current.triggerProps.id).toBe("status");
    expect(result.current.panel.triggerId).toBe("status");
    expect(result.current.triggerProps.style).toMatchObject({ color: "red" });
  });

  it("advertises the menu once mounted, following the shared state", () => {
    const { result } = renderHook(() => useDropdownTrigger({}));
    expect(result.current.triggerProps).toMatchObject({
      "aria-haspopup": "menu",
      "aria-expanded": false,
      "aria-controls": result.current.panel.panelId,
    });
    act(() => result.current.panel.setOpen(true));
    expect(result.current.triggerProps["aria-expanded"]).toBe(true);
  });

  it("composes the consumer's onKeyDown", () => {
    const onKeyDown = vi.fn();
    const { result } = renderHook(() => useDropdownTrigger({ onKeyDown }));
    const event = createKey("Enter");
    act(() => result.current.triggerProps.onKeyDown(event));
    expect(onKeyDown).toHaveBeenCalledWith(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("asks the menu to focus its last item on ArrowUp", () => {
    const { result } = renderHook(() => useDropdownTrigger({}));
    const event = createKey("ArrowUp");
    act(() => result.current.triggerProps.onKeyDown(event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.current.panel.focusIntent).toBe("last");
  });

  it("keeps the anchor name a CSS ident under any identifierPrefix", () => {
    let result: ReturnType<typeof useDropdownTrigger> | undefined;
    const Probe = () => {
      result = useDropdownTrigger({});
      return null;
    };
    const root = createRoot(document.createElement("div"), {
      identifierPrefix: "a:b.c ",
    });
    act(() => root.render(<Probe />));
    const { triggerProps, panel } = result as ReturnType<
      typeof useDropdownTrigger
    >;
    expect(panel.panelId).toContain("a:b.c ");
    expect(triggerProps.style.anchorName).toMatch(/^--[\w-]+$/);
    act(() => root.unmount());
  });
});
