import { RouterProvider } from "@canonical/router-react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { createRouterAt } from "../../../__fixtures__/journeysPageHarness.js";
import { ALL_JOURNEYS_FILTER } from "../../../journeyFilter.js";
import JourneyViewProvider from "../Provider.js";
import useJourneyView from "./useJourneyView.js";

describe("useJourneyView", () => {
  it("degrades to the table with an inert setter outside a provider", () => {
    const { result } = renderHook(() => useJourneyView());
    expect(result.current.view).toBe("table");
    act(() => {
      result.current.setFilter({ job: undefined, filter: ALL_JOURNEYS_FILTER });
    });
    expect(result.current.view).toBe("table");
    expect(result.current.filter).toBeUndefined();
  });

  it("shares the provider's view, which follows the address", async () => {
    const router = createRouterAt("/journeys");
    const { result } = renderHook(() => useJourneyView(), {
      wrapper: ({ children }: { readonly children: ReactNode }) => (
        <RouterProvider router={router}>
          <JourneyViewProvider>{children}</JourneyViewProvider>
        </RouterProvider>
      ),
    });
    act(() => {
      router.setSearchParams({ as: "graph" });
    });
    await waitFor(() => expect(result.current.view).toBe("graph"));
  });
});
