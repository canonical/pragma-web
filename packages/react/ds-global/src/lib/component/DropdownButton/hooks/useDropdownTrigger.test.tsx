import { act, renderHook } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import useDropdownTrigger from "./useDropdownTrigger.js";

describe("useDropdownTrigger", () => {
  it("targets the panel and names the anchor after it", () => {
    const { result } = renderHook(() => useDropdownTrigger({}));
    const { triggerProps, renderProps } = result.current;
    expect(triggerProps.popoverTarget).toBe(renderProps.id);
    expect(triggerProps.style).toEqual({ anchorName: `--${renderProps.id}` });
    expect(triggerProps.id).toBe(renderProps.triggerId);
    expect(triggerProps.id).not.toBe(renderProps.id);
  });

  it("keeps the consumer's id and style", () => {
    const { result } = renderHook(() =>
      useDropdownTrigger({ id: "status", style: { color: "red" } }),
    );
    expect(result.current.triggerProps.id).toBe("status");
    expect(result.current.triggerProps.style).toMatchObject({ color: "red" });
  });

  it("advertises the dialog once mounted, following the shared state", () => {
    const { result } = renderHook(() => useDropdownTrigger({}));
    expect(result.current.triggerProps).toMatchObject({
      "aria-haspopup": "dialog",
      "aria-expanded": false,
      "aria-controls": result.current.renderProps.id,
    });
    act(() => result.current.contextValue.setOpen(true));
    expect(result.current.triggerProps["aria-expanded"]).toBe(true);
  });

  it("shares the ids and anchor with the panel through the context", () => {
    const { result } = renderHook(() => useDropdownTrigger({ id: "t" }));
    const { contextValue, renderProps } = result.current;
    expect(contextValue).toMatchObject({
      panelId: renderProps.id,
      triggerId: "t",
      anchorName: `--${renderProps.id}`,
    });
  });

  it("closes nothing before a panel takes the ref", () => {
    const { result } = renderHook(() => useDropdownTrigger({}));
    expect(() => result.current.renderProps.close()).not.toThrow();
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
    const { triggerProps, contextValue, renderProps } = result as ReturnType<
      typeof useDropdownTrigger
    >;
    expect(renderProps.id).toContain("a:b.c ");
    expect(triggerProps.style.anchorName).toMatch(/^--[\w-]+$/);
    expect(contextValue.anchorName).toBe(triggerProps.style.anchorName);
    act(() => root.unmount());
  });
});
