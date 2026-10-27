import { createStaticRouter } from "@canonical/prism-core";
import { RouterProvider } from "@canonical/router-react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { DEFAULT_LENS_FILTER } from "../../../constants.js";
import { definitionsRoutes } from "../../../routes.js";
import LensFilterProvider from "../Provider.js";
import useLensFilter from "./useLensFilter.js";

/** The provider under a static router, whose session it keeps. */
const ProviderUnderRouter = ({
  children,
}: {
  readonly children: ReactNode;
}): ReactNode => (
  <RouterProvider
    router={createStaticRouter(definitionsRoutes, "/definitions")}
  >
    <LensFilterProvider>{children}</LensFilterProvider>
  </RouterProvider>
);

describe("useLensFilter", () => {
  it("degrades to the no-op filter outside a provider, with an inert setter", () => {
    const { result } = renderHook(() => useLensFilter());

    expect(result.current.filter).toBe(DEFAULT_LENS_FILTER);
    act(() => {
      result.current.setFilter({ ...DEFAULT_LENS_FILTER, text: "block" });
      result.current.setSearch("block");
      result.current.requestRegion("ds");
    });
    expect(result.current.filter).toBe(DEFAULT_LENS_FILTER);
    expect(result.current.search).toBe("");
    expect(result.current.region).toBeUndefined();
    expect(result.current.camera).toBeUndefined();
  });

  it("reads and writes the provider's filter", () => {
    const { result } = renderHook(() => useLensFilter(), {
      wrapper: ProviderUnderRouter,
    });

    expect(result.current.filter).toBe(DEFAULT_LENS_FILTER);
    act(() => {
      result.current.setFilter({ ...DEFAULT_LENS_FILTER, text: "block" });
    });
    expect(result.current.filter.text).toBe("block");
  });
});
