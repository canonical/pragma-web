import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import Provider from "../Provider.js";
import useRovingStop from "./useRovingStop.js";

describe("useRovingStop", () => {
  it("returns nothing outside a roving context", () => {
    const { result } = renderHook(() => useRovingStop());
    expect(result.current).toBeUndefined();
  });

  it("returns the composite's stop inside one", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider activeItem="a" onActiveItemChange={vi.fn()}>
        {children}
      </Provider>
    );
    const { result } = renderHook(() => useRovingStop(), { wrapper });
    expect(result.current?.activeItem).toBe("a");
  });
});
