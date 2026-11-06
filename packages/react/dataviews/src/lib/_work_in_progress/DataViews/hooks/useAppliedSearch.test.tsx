/**
 * The applied search text of a provider's state, so a result landing
 * re-renders no search box.
 */
import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import machine from "../../../../../testing/machine.js";
import pageOf from "../../../../../testing/pageOf.js";
import renderInRoot from "../../../../../testing/renderInRoot.js";
import useAppliedSearch from "./useAppliedSearch.js";

/** A root over the machine provider, and a hook reading its search through it. */
const mount = () =>
  renderInRoot("Search", (provider) => useAppliedSearch({ provider }));

describe("useAppliedSearch", () => {
  it("returns the applied search, empty for none", () => {
    const { provider, hook } = mount();
    expect(hook.result.current).toBe("");
    act(() => {
      provider.setSearch("alpha");
    });
    expect(hook.result.current).toBe("alpha");
  });

  it("does not re-render when only the result changes", () => {
    const { source, hook, readRenders } = mount();
    const renders = readRenders();
    act(() => {
      source
        .latest()
        .deliver({ status: "succeeded", page: pageOf([machine("m1", "a")]) });
    });
    expect(hook.result.current).toBe("");
    expect(readRenders()).toBe(renders);
  });

  it("follows the search when it changes", () => {
    const { provider, hook } = mount();
    act(() => {
      provider.setSearch("alpha");
    });
    act(() => {
      provider.setSearch("beta");
    });
    expect(hook.result.current).toBe("beta");
    act(() => {
      provider.setSearch("");
    });
    expect(hook.result.current).toBe("");
  });
});
