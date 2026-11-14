import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import renderInRoot from "./renderInRoot.js";

describe("renderInRoot", () => {
  it("reads the hook through the root's provider, counting its renders", () => {
    const { provider, hook, readRenders } = renderInRoot(
      "Search",
      (root) => root,
    );
    expect(hook.result.current).toBe(provider);
    expect(readRenders()).toBe(1);
    hook.rerender();
    expect(readRenders()).toBe(2);
  });

  it("builds the provider from the configuration it is given", () => {
    const { provider, source } = renderInRoot(
      "Search",
      (root) => root.state.get().slice.search,
      { rows: [] },
    );
    act(() => {
      provider.setSearch("alpha");
    });
    expect(source.latest().request.slice.search).toBe("alpha");
  });
});
