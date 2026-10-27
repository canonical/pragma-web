import { createStaticRouter } from "@canonical/prism-core";
import { RouterProvider } from "@canonical/router-react";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { DEFAULT_LENS_FILTER } from "../../../constants.js";
import { definitionsRoutes } from "../../../routes.js";
import useProviderState from "./useProviderState.js";

/** A wrapper under one static router, whose session the hook keeps. */
function createRouterWrapper(
  url = "/definitions",
): (props: { readonly children: ReactNode }) => ReactNode {
  const router = createStaticRouter(definitionsRoutes, url);
  return ({ children }) => (
    <RouterProvider router={router}>{children}</RouterProvider>
  );
}

/** Render the hook under a router of its own. */
const renderState = (wrapper = createRouterWrapper()) =>
  renderHook(() => useProviderState(), { wrapper });

describe("useProviderState", () => {
  it("starts from the no-op default, so both sides of hydration agree", () => {
    const { result } = renderState();
    expect(result.current.filter).toBe(DEFAULT_LENS_FILTER);
  });

  it("keeps its value's identity until the filter changes", () => {
    const { result, rerender } = renderState();
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);

    act(() => {
      first.setFilter({ ...DEFAULT_LENS_FILTER, namespaces: ["ds"] });
    });
    expect(result.current).not.toBe(first);
    expect(result.current.filter.namespaces).toEqual(["ds"]);
  });
});

describe("useProviderState's search", () => {
  it("holds the search box's text and writes it into the filter normalised", () => {
    const { result } = renderState();
    expect(result.current.search).toBe("");
    act(() => {
      result.current.setSearch("  Block ");
    });
    expect(result.current.search).toBe("  Block ");
    expect(result.current.filter.text).toBe("block");
  });
});

describe("useProviderState's session", () => {
  it("starts a provider mounted again under the same router where the last left off", () => {
    const wrapper = createRouterWrapper();
    const first = renderState(wrapper);
    act(() => {
      first.result.current.setFilter({
        ...DEFAULT_LENS_FILTER,
        namespaces: ["cs"],
      });
      first.result.current.setSearch("st");
      first.result.current.requestRegion("cs");
    });
    const { camera } = first.result.current;
    first.unmount();
    const second = renderState(wrapper);
    expect(second.result.current.filter.namespaces).toEqual(["cs"]);
    expect(second.result.current.search).toBe("st");
    expect(second.result.current.region).toEqual({ prefix: "cs", serial: 1 });
    expect(second.result.current.camera).toBe(camera);
  });

  it("ends the session when it unmounts on no route of the lens", () => {
    const wrapper = createRouterWrapper("/elsewhere");
    const first = renderState(wrapper);
    act(() => {
      first.result.current.setSearch("st");
    });
    first.unmount();
    expect(renderState(wrapper).result.current.search).toBe("");
  });

  it("starts from the defaults under another router", () => {
    const first = renderState();
    act(() => {
      first.result.current.setSearch("st");
    });
    const second = renderState();
    expect(second.result.current.search).toBe("");
    expect(second.result.current.filter).toBe(DEFAULT_LENS_FILTER);
    expect(second.result.current.camera).not.toBe(first.result.current.camera);
  });
});

describe("useProviderState's region", () => {
  it("asks for no region at first, then holds the one a reader picks", () => {
    const { result } = renderState();
    expect(result.current.region).toBeUndefined();
    act(() => {
      result.current.requestRegion("cs");
    });
    expect(result.current.region).toEqual({ prefix: "cs", serial: 1 });
  });

  it("numbers a second pick of the same region as a new request", () => {
    const { result } = renderState();
    act(() => {
      result.current.requestRegion("cs");
    });
    act(() => {
      result.current.requestRegion("cs");
    });
    expect(result.current.region).toEqual({ prefix: "cs", serial: 2 });
    act(() => {
      result.current.requestRegion("ds");
    });
    expect(result.current.region).toEqual({ prefix: "ds", serial: 3 });
  });
});
