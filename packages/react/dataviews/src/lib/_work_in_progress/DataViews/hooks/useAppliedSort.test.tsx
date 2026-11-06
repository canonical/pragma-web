/**
 * The applied sort terms of a provider's state, held at one reference while
 * they read the same, so a result landing, a search or a new state with an
 * equal ordering re-renders nothing that lists them.
 */
import {
  createMemoryLocation,
  type QueryLocation,
} from "@canonical/dataviews-core";
import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../../../testing/buildMachine.js";
import buildPage from "../../../../../testing/buildPage.js";
import renderInRoot from "../../../../../testing/renderInRoot.js";
import useAppliedSort from "./useAppliedSort.js";

/** A root over the machine provider, and a hook reading its sort through it. */
const mount = (location?: QueryLocation) =>
  renderInRoot(
    "SortPanel",
    (provider) => useAppliedSort({ provider }),
    location === undefined ? {} : { location },
  );

describe("useAppliedSort", () => {
  it("returns the applied terms", () => {
    const { provider, hook } = mount();
    expect(hook.result.current).toEqual([]);
    act(() => {
      provider.setSort([{ field: "name", direction: "asc" }]);
    });
    expect(hook.result.current).toEqual([{ field: "name", direction: "asc" }]);
  });

  it("keeps the terms' reference when a result lands or the search changes", () => {
    const { provider, source, hook, readRenders } = mount();
    act(() => {
      provider.setSort([{ field: "name", direction: "asc" }]);
    });
    const terms = hook.result.current;
    const renders = readRenders();
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m1", "a")]),
      });
    });
    act(() => {
      provider.setSearch("alpha");
    });
    expect(hook.result.current).toBe(terms);
    expect(readRenders()).toBe(renders);
  });

  it("keeps the terms' reference when a new state carries an equal ordering", () => {
    const location = createMemoryLocation({ href: "/machines" });
    const { provider, hook, readRenders } = mount(location);
    act(() => {
      provider.setSort([{ field: "name", direction: "asc" }]);
    });
    const terms = hook.result.current;
    const renders = readRenders();
    // The location moves to a new search under the same ordering: the
    // provider reads the query back from it, with a new array of equal terms.
    const moved = location.read();
    moved.set("q", "beta");
    act(() => {
      location.write(moved);
    });
    expect(provider.state.get().slice.search).toBe("beta");
    expect(provider.state.get().slice.sort).not.toBe(terms);
    expect(hook.result.current).toBe(terms);
    expect(readRenders()).toBe(renders);
  });

  it("re-renders nothing when the same sort is set again", () => {
    const { provider, hook, readRenders } = mount();
    act(() => {
      provider.setSort([{ field: "name", direction: "asc" }]);
    });
    const terms = hook.result.current;
    const renders = readRenders();
    act(() => {
      provider.setSort([{ field: "name", direction: "asc" }]);
    });
    expect(hook.result.current).toBe(terms);
    expect(readRenders()).toBe(renders);
  });

  it("returns the new terms when the sort changes", () => {
    const { provider, hook } = mount();
    act(() => {
      provider.setSort([{ field: "name", direction: "asc" }]);
    });
    const terms = hook.result.current;
    act(() => {
      provider.setSort([{ field: "name", direction: "desc" }]);
    });
    expect(hook.result.current).not.toBe(terms);
    expect(hook.result.current).toEqual([{ field: "name", direction: "desc" }]);
  });
});
