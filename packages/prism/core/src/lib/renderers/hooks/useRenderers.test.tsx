import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LENS_ROUTES } from "../../../../testing/fixtures.js";
import RenderersProvider from "../Provider.js";
import type { RendererDefaults } from "../types.js";
import useRenderers from "./useRenderers.js";

const DEFAULTS: RendererDefaults = {
  list: [
    { name: "table", label: "Table", render: () => "table" },
    { name: "cards", label: "Cards", render: () => "cards" },
  ],
  page: [
    { name: "page", label: "Page", render: ({ children }) => children },
    { name: "turtle", label: "Turtle", render: () => "turtle" },
  ],
};

/** A wrapper over the fixtures' router at `href`, under the defaults. */
const wrapAt =
  (href: string, withProvider = true) =>
  ({ children }: { readonly children: ReactNode }) => (
    <RouterProvider
      router={createRouter(LENS_ROUTES, {
        adapter: createMemoryAdapter(href),
      })}
    >
      {withProvider ? (
        <RenderersProvider defaults={DEFAULTS} extensions={[]}>
          {children}
        </RenderersProvider>
      ) : (
        children
      )}
    </RouterProvider>
  );

describe("useRenderers", () => {
  it("offers a list's defaults and activates the first by default", () => {
    const { result } = renderHook(() => useRenderers("list"), {
      wrapper: wrapAt("/catalog"),
    });
    expect(result.current.offered.map(({ name }) => name)).toEqual([
      "table",
      "cards",
    ]);
    expect(result.current.active.name).toBe("table");
  });

  it("activates the renderer the address names", () => {
    const { result } = renderHook(() => useRenderers("list"), {
      wrapper: wrapAt("/catalog?as=cards"),
    });
    expect(result.current.active.name).toBe("cards");
  });

  it("resolves a page's renderers from the lens's declaration", () => {
    const { result } = renderHook(() => useRenderers("page", ["page"]), {
      wrapper: wrapAt("/catalog?as=turtle"),
    });
    expect(result.current.offered.map(({ name }) => name)).toEqual(["page"]);
    expect(result.current.active.name).toBe("page");
  });

  it("throws outside a provider, where a site offers no renderer", () => {
    // React reports the render error before rethrowing; keep the output clean.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      expect(() =>
        renderHook(() => useRenderers("page"), {
          wrapper: wrapAt("/", false),
        }),
      ).toThrow("readRenderer: the view offers no renderer");
    } finally {
      consoleError.mockRestore();
    }
  });
});
