import {
  createMemoryAdapter,
  createRouter,
  route,
} from "@canonical/router-core";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RECENT_PAGE_LIMIT } from "../constants.js";
import useRecentPages from "./useRecentPages.js";

/** A router over pages `/p/:n`, starting at the first. */
const createPageRouter = () =>
  createRouter(
    { page: route({ url: "/p/:n", content: () => null }) },
    { adapter: createMemoryAdapter("/p/0") },
  );

/** Navigate `router` to page `n`, the document titled after the page left. */
const visit = async (
  router: ReturnType<typeof createPageRouter>,
  n: number,
): Promise<void> => {
  await act(async () => {
    await router.navigate("page", { params: { n: String(n) } });
  });
};

describe("useRecentPages", () => {
  it("lists none before the first navigation", () => {
    const { result } = renderHook(() => useRecentPages(createPageRouter()));
    expect(result.current).toEqual([]);
  });

  it("records each page left under its title, latest first, each once, never the page on screen", async () => {
    const router = createPageRouter();
    const { result } = renderHook(() => useRecentPages(router));
    document.title = "Zero";
    await visit(router, 1);
    document.title = "One";
    await visit(router, 2);
    expect(result.current).toEqual([
      { label: "One", href: "/p/1" },
      { label: "Zero", href: "/p/0" },
    ]);
    document.title = "Two";
    await visit(router, 1);
    expect(result.current).toEqual([
      { label: "Two", href: "/p/2" },
      { label: "Zero", href: "/p/0" },
    ]);
  });

  it(`keeps at most ${RECENT_PAGE_LIMIT} pages`, async () => {
    const router = createPageRouter();
    const { result } = renderHook(() => useRecentPages(router));
    for (let n = 1; n <= RECENT_PAGE_LIMIT + 2; n += 1) {
      document.title = `Page ${n - 1}`;
      await visit(router, n);
    }
    expect(result.current).toHaveLength(RECENT_PAGE_LIMIT);
    expect(result.current.at(0)).toEqual({
      label: `Page ${RECENT_PAGE_LIMIT + 1}`,
      href: `/p/${RECENT_PAGE_LIMIT + 1}`,
    });
  });
});
