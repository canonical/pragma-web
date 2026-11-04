/**
 * The machine stories' shapes: a record as a source delivers it, and the
 * fields a story may sort by, which are the collection's own.
 */
import type { SortTerm } from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import type {
  Machine,
  MachineFields,
  MachineSourceConfig,
  SortableField,
} from "./types.js";

describe("Machine", () => {
  it("is one record, keyed by its id", () => {
    expectTypeOf<Machine["id"]>().toEqualTypeOf<string>();
    expectTypeOf<Machine["status"]>().toEqualTypeOf<
      "running" | "failed" | "pending"
    >();
  });
});

describe("SortableField", () => {
  it("names a field of the collection", () => {
    expectTypeOf<SortableField>().toEqualTypeOf<
      MachineFields[number]["field"]
    >();
    expectTypeOf<SortableField>().toEqualTypeOf<
      "status" | "cores" | "name" | "region" | "owner"
    >();
  });
});

describe("MachineSourceConfig", () => {
  it("optionally takes the rows and the order the source documents", () => {
    expectTypeOf<MachineSourceConfig["rows"]>().toEqualTypeOf<
      readonly Machine[] | undefined
    >();
    expectTypeOf<MachineSourceConfig["defaultSort"]>().toEqualTypeOf<
      readonly SortTerm[] | undefined
    >();
  });
});
