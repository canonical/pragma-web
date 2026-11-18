/**
 * The bar's read of its chips: held while their ids stay.
 */
import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import renderInRoot from "../../../../../../../testing/renderInRoot.js";
import useClauseIds from "./useClauseIds.js";
import useQueryGroup from "./useQueryGroup.js";

describe("useClauseIds", () => {
  it("holds the chips while their ids stay, and reads them anew when they move", () => {
    const { hook, provider } = renderInRoot(
      "QueryBar",
      (rooted) => useClauseIds({ group: useQueryGroup({ provider: rooted }) }),
      { snapshot: { query: "status=running", presentation: {} } },
    );
    const before = hook.result.current;
    expect(before.map(({ id }) => id)).toEqual(["status__isAny__0"]);
    act(() => {
      provider.clear(["filter"]);
      provider.setSearch("alpha");
    });
    expect(hook.result.current.map(({ id }) => id)).toEqual(["search"]);
    const searched = hook.result.current;
    act(() => {
      provider.setSearch("beta");
    });
    // The search moved; its chip reads its own text.
    expect(hook.result.current).toBe(searched);
  });
});
