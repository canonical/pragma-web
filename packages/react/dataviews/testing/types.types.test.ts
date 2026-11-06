/**
 * The test-only shapes the React suites share: a machine record, the
 * provider a test drives, and the stores and sources the helpers hand back.
 */
import type {
  DataViewsProvider,
  SavedView,
  ViewStore,
} from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import type {
  Machine,
  MachineFields,
  MachineFixture,
  MachineProvider,
  MemoryViewStore,
} from "./types.js";

describe("Machine", () => {
  it("is one record, failed or running", () => {
    expectTypeOf<Machine["status"]>().toEqualTypeOf<"failed" | "running">();
    expectTypeOf<Machine["cores"]>().toEqualTypeOf<number>();
  });
});

describe("MachineProvider and MachineFixture", () => {
  it("are a provider over the machines, and it with the source to answer", () => {
    expectTypeOf<MachineProvider>().toEqualTypeOf<
      DataViewsProvider<MachineFields, Machine>
    >();
    expectTypeOf<MachineFixture["provider"]>().toEqualTypeOf<MachineProvider>();
  });
});

describe("MemoryViewStore", () => {
  it("is a store, with a way to change and drop records as another tab would", () => {
    expectTypeOf<MemoryViewStore["store"]>().toEqualTypeOf<ViewStore>();
    expectTypeOf<MemoryViewStore["elsewhere"]>().toEqualTypeOf<
      (id: string, changes: Partial<SavedView>) => void
    >();
  });
});
