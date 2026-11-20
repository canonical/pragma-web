import { createMemoryLocation, createPage } from "@canonical/dataviews-core";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  activity,
  createActivityProvider,
} from "../../../../../testing/activities.js";
import useTimelineReach from "./useTimelineReach.js";

const TEN = Array.from({ length: 10 }, (_unused, at) =>
  activity(`a-${at + 1}`, at + 1),
);

/** A provider over `TEN`, answering each window at once, on page 2 of 3. */
const pagedProvider = (href?: string) => {
  const { provider } = createActivityProvider({
    answer: ({ window: { page, size } }) =>
      createPage({
        rows: TEN.slice((page - 1) * size, page * size),
        matched: TEN.length,
      }),
    ...(href === undefined ? {} : { location: createMemoryLocation({ href }) }),
  });
  onTestFinished(provider.observe());
  return provider;
};

describe("useTimelineReach", () => {
  it("counts the collection and grows the window from its first event", () => {
    const provider = pagedProvider();
    act(() => {
      provider.navigateWindow({ page: 2, size: 4 });
    });
    const { result } = renderHook(() =>
      useTimelineReach({ provider, count: 4, step: 3 }),
    );
    expect(result.current.total).toEqual({ kind: "exact", value: 10 });
    expect(result.current.moreHref).toBeNull();
    act(() => {
      result.current.requestMore?.();
    });
    expect(provider.state.get().window).toMatchObject({
      page: 1,
      size: 11,
      cursor: null,
    });
  });

  it("counts only the page, and asks for nothing, on the last page", () => {
    const provider = pagedProvider();
    const { result } = renderHook(() =>
      useTimelineReach({ provider, count: 10, step: 4 }),
    );
    expect(result.current).toEqual({
      total: { kind: "exact", value: 10 },
      requestMore: null,
      moreHref: null,
    });
  });

  it("spells the grown window for the location", () => {
    const provider = pagedProvider("/activity?size=4");
    const { result } = renderHook(() =>
      useTimelineReach({ provider, count: 4, step: 4 }),
    );
    expect(result.current.moreHref).toMatch(/size=8/u);
  });
});
