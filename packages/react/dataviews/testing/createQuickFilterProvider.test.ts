import { createMemoryLocation } from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { describe, expect, it, onTestFinished } from "vitest";
import createQuickFilterProvider from "./createQuickFilterProvider.js";
import { quickHostCollection, quickHosts } from "./fixtures.js";

describe("createQuickFilterProvider", () => {
  it("answers at once with the twelve hosts", () => {
    const provider = createQuickFilterProvider();
    onTestFinished(provider.observe());
    expect(provider.collection).toBe(quickHostCollection);
    expect(provider.rows.get().ids).toHaveLength(12);
    expect(quickHosts.filter((host) => host.owner !== undefined)).toHaveLength(
      4,
    );
  });

  it("starts on a query, at a location, counting the fields asked for", () => {
    const provider = createQuickFilterProvider({
      query: "status=ready",
      location: createMemoryLocation({ href: "/hosts?status=ready" }),
      facets: ["status"],
    });
    onTestFinished(provider.observe());
    expect(provider.rows.get().ids).toEqual(["h2", "h6", "h10"]);
    expect(provider.state.get().result.facets?.["status"]).toBeDefined();
    expect(
      readProviderHost(provider).spellQuery(provider.state.get())?.toString(),
    ).toContain("status=ready");
  });
});
