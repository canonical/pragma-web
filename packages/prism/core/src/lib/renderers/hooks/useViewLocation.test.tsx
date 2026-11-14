import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { LENS_ROUTES } from "../../../../testing/fixtures.js";
import useViewLocation from "./useViewLocation.js";

describe("useViewLocation", () => {
  it("reads the address's path and its parameters by name", () => {
    const router = createRouter(LENS_ROUTES, {
      adapter: createMemoryAdapter("/catalog?as=cards&q=cen"),
    });
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <RouterProvider router={router}>{children}</RouterProvider>
    );
    const { result } = renderHook(() => useViewLocation(), { wrapper });
    expect(result.current).toEqual({
      pathname: "/catalog",
      search: { as: "cards", q: "cen" },
    });
  });
});
