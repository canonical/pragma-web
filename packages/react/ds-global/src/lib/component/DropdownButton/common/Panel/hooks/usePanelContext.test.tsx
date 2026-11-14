import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import Context from "../Context.js";
import type { PanelContextValue } from "./types.js";
import usePanelContext from "./usePanelContext.js";

describe("usePanelContext", () => {
  it("is undefined outside a panel", () => {
    const { result } = renderHook(() => usePanelContext());
    expect(result.current).toBeUndefined();
  });

  it("reads the panel's state", () => {
    const value: PanelContextValue = {
      panelId: "p",
      isOpen: true,
      setOpen: () => {},
      kind: "dialog",
      registerMenu: () => () => {},
      focusIntent: "first",
      setFocusIntent: () => {},
      hide: () => {},
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Context.Provider value={value}>{children}</Context.Provider>
    );
    const { result } = renderHook(() => usePanelContext(), { wrapper });
    expect(result.current).toBe(value);
  });
});
