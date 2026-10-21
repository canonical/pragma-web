import {
  createMemoryAdapter,
  createRouter,
  type Router,
} from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LENS_ROUTES } from "../../../testing/fixtures.js";
import HomesProvider from "./Provider.js";
import type { HomeNode, HomeResolver, Homes } from "./types.js";
import useHome from "./useHome.js";

const term: HomeNode = { __typename: "Term", uri: "ds:UIBlock" };

/** Resolve `node`'s home under `homes`, inside a router over the fixtures. */
const resolveHome = (homes: Homes, node: HomeNode = term) => {
  const router = createRouter(LENS_ROUTES, {
    adapter: createMemoryAdapter("/"),
  });
  const wrapper = ({ children }: { readonly children: ReactNode }) => (
    <RouterProvider router={router}>
      <HomesProvider homes={homes}>{children}</HomesProvider>
    </RouterProvider>
  );
  return renderHook(() => useHome(node), { wrapper }).result.current;
};

describe("useHome", () => {
  it("resolves through the node's own type over the Node fallback", () => {
    expect(
      resolveHome({ Term: () => "/term-home", Node: () => "/node-home" }),
    ).toBe("/term-home");
  });

  it("falls back to the Node resolver for a type without its own", () => {
    expect(resolveHome({ Node: () => "/node-home" })).toBe("/node-home");
  });

  it("returns undefined when neither the type nor Node has a resolver", () => {
    expect(resolveHome({ Station: () => "/station-home" })).toBeUndefined();
  });

  it("hands the resolver the node and the provider's router", () => {
    // Typed over the fixture table: a site registers its own route map, so
    // its resolvers are typed against it without a cast.
    const termHome = (
      node: HomeNode,
      router: Router<typeof LENS_ROUTES>,
    ): string =>
      router.buildPath("glossaryTerm", { params: { term: node.uri } });
    expect(resolveHome({ Term: termHome as unknown as HomeResolver })).toBe(
      "/glossary/ds%3AUIBlock",
    );
  });

  it("throws when no HomesProvider is mounted above", () => {
    const router = createRouter(LENS_ROUTES, {
      adapter: createMemoryAdapter("/"),
    });
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <RouterProvider router={router}>{children}</RouterProvider>
    );
    // React reports the render error before rethrowing; keep the output clean.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      expect(() => renderHook(() => useHome(term), { wrapper })).toThrow(
        "useHome: no HomesProvider above",
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
