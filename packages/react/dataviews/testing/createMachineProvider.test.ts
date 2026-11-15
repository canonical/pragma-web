import { createMemoryLocation } from "@canonical/dataviews-core";
import { describe, expect, it, onTestFinished } from "vitest";
import buildMachine from "./buildMachine.js";
import createMachineProvider from "./createMachineProvider.js";
import createMemoryViewStore from "./createMemoryViewStore.js";
import { MACHINE_CAPABILITIES, machines } from "./machines.js";

describe("createMachineProvider", () => {
  it("answers every request at once with the rows given", () => {
    const { provider, collection } = createMachineProvider({
      rows: [buildMachine("m-1", "alpha")],
    });
    expect(collection).toBe(machines);
    expect(provider.capabilities).toEqual(MACHINE_CAPABILITIES);
    onTestFinished(provider.observe());
    expect(provider.rows.get().ids).toEqual(["m-1"]);
  });

  it("leaves the answer to the test without rows", () => {
    const { provider, source } = createMachineProvider();
    onTestFinished(provider.observe());
    expect(source.calls).toHaveLength(1);
    expect(provider.rows.get().ids).toEqual([]);
  });

  it("takes a location, a view store and a snapshot", () => {
    const { provider } = createMachineProvider({
      location: createMemoryLocation({ href: "/machines?status=failed" }),
      views: createMemoryViewStore().store,
      snapshot: { query: "status=running", presentation: {} },
    });
    expect(provider.state.get().slice.filter).toEqual([
      { field: "status", operator: "isAny", operands: ["failed"] },
    ]);
  });
});
