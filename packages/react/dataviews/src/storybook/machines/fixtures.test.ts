import { describe, expect, it } from "vitest";
import {
  machineCollection,
  machines,
  spareMachineCollection,
  spareMachines,
} from "./fixtures.js";

describe("machines", () => {
  it("holds twelve machines of distinct identity, every status among them", () => {
    expect(machines).toHaveLength(12);
    expect(new Set(machines.map(machineCollection.identify)).size).toBe(12);
    expect(new Set(machines.map(({ status }) => status))).toEqual(
      new Set(["running", "failed", "pending"]),
    );
  });
});

describe("machineCollection", () => {
  it("declares every field a story filters, searches or sorts by", () => {
    expect(machineCollection.schema.fieldNames).toEqual([
      "status",
      "cores",
      "name",
      "region",
      "owner",
    ]);
  });
});

describe("spareMachines", () => {
  it("holds six spare machines, some owned, each tagged by the options", () => {
    expect(spareMachines).toHaveLength(6);
    expect(spareMachines.filter((machine) => "owner" in machine)).toHaveLength(
      3,
    );
    expect(new Set(spareMachines.flatMap(({ tags }) => tags))).toEqual(
      new Set(["ex-gpu", "ex-nvme"]),
    );
  });
});

describe("spareMachineCollection", () => {
  it("reads memory typed in GiB in MiB, and tags as a list", () => {
    const { schema } = spareMachineCollection;
    expect(schema.validateInput("memory", "8 GiB")).toEqual({
      status: "valid",
      operands: [8192],
    });
    expect(schema.findField("tags")).toMatchObject({ multiple: true });
  });
});
