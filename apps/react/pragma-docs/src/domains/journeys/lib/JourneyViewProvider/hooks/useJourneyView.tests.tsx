import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import JourneyViewProvider from "../Provider.js";
import useJourneyView from "./useJourneyView.js";

describe("useJourneyView", () => {
  it("degrades to the table with an inert setter outside a provider", () => {
    const { result } = renderHook(() => useJourneyView());
    expect(result.current.view).toBe("table");
    act(() => {
      result.current.setView("graph");
    });
    expect(result.current.view).toBe("table");
  });

  it("shares the provider's view and lets a consumer change it", () => {
    const { result } = renderHook(() => useJourneyView(), {
      wrapper: ({ children }: { readonly children: ReactNode }) => (
        <JourneyViewProvider>{children}</JourneyViewProvider>
      ),
    });
    act(() => {
      result.current.setView("graph");
    });
    expect(result.current.view).toBe("graph");
  });
});
