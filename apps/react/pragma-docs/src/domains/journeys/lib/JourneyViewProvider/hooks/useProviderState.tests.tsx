import { RouterProvider } from "@canonical/router-react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { createRouterAt } from "../../../__fixtures__/journeysPageHarness.js";
import { DEFAULT_JOURNEY_VIEW } from "../../../constants.js";
import { ALL_JOURNEYS_FILTER } from "../../../journeyFilter.js";
import useProviderState from "./useProviderState.js";

/** Render the hook under a router at `url`. */
const renderAt = (url: string) => {
  const router = createRouterAt(url);
  const rendered = renderHook(() => useProviderState(), {
    wrapper: ({ children }: { readonly children: ReactNode }) => (
      <RouterProvider router={router}>{children}</RouterProvider>
    ),
  });
  return { ...rendered, router };
};

describe("useProviderState", () => {
  it("starts from the table when the address names no view", () => {
    const { result } = renderAt("/journeys");
    expect(result.current.view).toBe(DEFAULT_JOURNEY_VIEW);
  });

  it("reads the view the address names, so the server and the client agree", () => {
    const { result } = renderAt("/journeys/job?view=graph");
    expect(result.current.view).toBe("graph");
  });

  it("writes the view to the address, and drops it for the table", async () => {
    const { result, router } = renderAt("/journeys");
    act(() => {
      result.current.setView("graph");
    });
    await waitFor(() => expect(result.current.view).toBe("graph"));
    expect(router.getState().location.href).toBe("/journeys?view=graph");
    act(() => {
      result.current.setView("table");
    });
    await waitFor(() => expect(result.current.view).toBe("table"));
    expect(router.getState().location.href).toBe("/journeys");
  });

  it("starts from no filter and records the reader's choice", () => {
    const { result } = renderAt("/journeys");
    expect(result.current.filter).toBeUndefined();
    const choice = { job: undefined, filter: ALL_JOURNEYS_FILTER };
    act(() => {
      result.current.setFilter(choice);
    });
    expect(result.current.filter).toBe(choice);
  });

  it("keeps its value's identity until the view or the filter changes", () => {
    const { result, rerender } = renderAt("/journeys");
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    act(() => {
      first.setFilter({ job: undefined, filter: ALL_JOURNEYS_FILTER });
    });
    expect(result.current).not.toBe(first);
  });
});
