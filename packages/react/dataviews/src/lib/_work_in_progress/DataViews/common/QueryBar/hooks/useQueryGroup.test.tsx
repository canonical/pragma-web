/**
 * The query group's stand-in: one state per query, view and refusals, and
 * the provider's own commands behind each member.
 */
import { createMemoryLocation } from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import buildMachine from "../../../../../../../testing/buildMachine.js";
import buildPage from "../../../../../../../testing/buildPage.js";
import createMemoryViewStore from "../../../../../../../testing/createMemoryViewStore.js";
import renderInRoot from "../../../../../../../testing/renderInRoot.js";
import type { MachineProviderConfig } from "../../../../../../../testing/types.js";
import useQueryGroup from "./useQueryGroup.js";

/** The group over a fresh machine provider, read inside its root. */
const mount = (config: MachineProviderConfig = {}) => {
  const rooted = renderInRoot(
    "QueryBar",
    (provider) => useQueryGroup({ provider }),
    config,
  );
  return { ...rooted, group: rooted.hook.result.current };
};

describe("useQueryGroup", () => {
  it("keeps one group per provider across renders", () => {
    const { group, hook } = mount();
    hook.rerender();
    expect(hook.result.current).toBe(group);
  });

  it("reads one state while the query, view and refusals stay", () => {
    const { group, source } = mount();
    const before = group.state.get();
    expect(before).toEqual({
      slice: before.slice,
      window: before.window,
      view: null,
      refused: [],
    });
    expect(Object.isFrozen(before)).toBe(true);
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m1", "alpha")]),
      });
    });
    // A result over the same query is the same state.
    expect(group.state.get()).toBe(before);
    act(() => {
      group.setSearch("alpha");
    });
    const after = group.state.get();
    expect(after).not.toBe(before);
    expect(after.slice.search).toBe("alpha");
    expect(group.state.get()).toBe(after);
  });

  it("hears the provider's state, view and refusals, and lets go of all three", () => {
    const location = createMemoryLocation({ href: "/machines" });
    const { group, provider } = mount({
      location,
      views: createMemoryViewStore().store,
    });
    const host = readProviderHost(provider);
    const listener = vi.fn();
    const stop = group.state.subscribe(listener);
    act(() => {
      group.setSearch("alpha");
    });
    expect(listener).toHaveBeenCalled();
    // The open view alone.
    listener.mockClear();
    act(() => {
      host.adopt(provider.state.get(), "view", "mine");
    });
    expect(host.view.get()).toBe("mine");
    expect(listener).toHaveBeenCalled();
    // The refused parameters alone, from a link the location follows.
    listener.mockClear();
    act(() => {
      location.write(new URLSearchParams("status=melted"));
    });
    expect(provider.issues.get()).not.toEqual([]);
    expect(listener).toHaveBeenCalled();
    stop();
    listener.mockClear();
    act(() => {
      group.setSearch("beta");
      host.adopt(provider.state.get(), "view", null);
      location.write(new URLSearchParams(""));
    });
    expect(listener).not.toHaveBeenCalled();
  });

  it("routes every command to the provider", () => {
    const { group } = mount();
    const running = {
      field: "status",
      operator: "isAny",
      operands: ["running"],
    } as const;
    act(() => {
      expect(group.addPredicate(running)).toEqual([]);
    });
    expect(group.state.get().slice.filter).toEqual([running]);
    act(() => {
      group.setPredicate({ ...running, operands: ["failed"] }, 0);
    });
    expect(group.state.get().slice.filter).toEqual([
      { ...running, operands: ["failed"] },
    ]);
    act(() => {
      group.editPredicates({
        remove: [{ field: "status", operator: "isAny", nth: 0 }],
        add: [{ field: "cores", operator: "gte", operands: [4] }],
      });
    });
    expect(group.state.get().slice.filter).toEqual([
      { field: "cores", operator: "gte", operands: [4] },
    ]);
    act(() => {
      group.removePredicate({ field: "cores", operator: "gte", nth: 0 });
    });
    expect(group.state.get().slice.filter).toEqual([]);
    act(() => {
      group.addPredicate(running);
      group.setSearch("alpha");
    });
    act(() => {
      group.clear(["filter", "search"]);
    });
    expect(group.state.get().slice).toMatchObject({ filter: [], search: null });
    // An operator the source does not run is refused, and moves nothing.
    const refused = {
      field: "name",
      operator: "contains",
      operands: ["a"],
    } as const;
    expect(
      group.listRefusals({
        ...group.state.get(),
        slice: { ...group.state.get().slice, filter: [refused] },
      }),
    ).not.toEqual([]);
  });

  it("spells a destination as the location's address, or none without a location", () => {
    expect(mount().group.spellHref(mount().group.state.get())).toBeNull();
    const { group } = mount({
      location: createMemoryLocation({ href: "/machines" }),
    });
    act(() => {
      group.setSearch("alpha");
    });
    expect(group.spellHref(group.state.get())).toBe("?q=alpha&page=1&size=50");
  });
});
