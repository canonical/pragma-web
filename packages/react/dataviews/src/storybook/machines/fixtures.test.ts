import { describe, expect, it } from "vitest";
import { SERVER_BACKED_DECLARATIONS } from "./constants.js";
import {
  barMachineCollection,
  barMachines,
  machineCollection,
  pooledMachineCollection,
  pooledMachines,
  SERVER_BACKED_COLUMNS,
  spareMachineCollection,
  spareMachines,
  storyMachines,
} from "./fixtures.js";

describe("fixtures", () => {
  describe("storyMachines", () => {
    it("holds twelve machines of distinct identity, every status among them", () => {
      expect(storyMachines).toHaveLength(12);
      expect(new Set(storyMachines.map(machineCollection.identify)).size).toBe(
        12,
      );
      expect(new Set(storyMachines.map(({ status }) => status))).toEqual(
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

  describe("SERVER_BACKED_COLUMNS", () => {
    it("declares the five sortable columns the Show code text spells", () => {
      expect(SERVER_BACKED_COLUMNS.map(({ id }) => id)).toEqual([
        "name",
        "status",
        "cores",
        "region",
        "owner",
      ]);
      expect(SERVER_BACKED_COLUMNS.map(({ id }) => id)).toEqual(
        SERVER_BACKED_DECLARATIONS.map(({ field }) => field),
      );
      expect(SERVER_BACKED_COLUMNS.every(({ sortable }) => sortable)).toBe(
        true,
      );
    });
  });

  describe("spareMachines", () => {
    it("holds six spare machines, some owned, each tagged by the options", () => {
      expect(spareMachines).toHaveLength(6);
      expect(
        spareMachines.filter((machine) => "owner" in machine),
      ).toHaveLength(3);
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
});

describe("barMachineCollection", () => {
  it("declares one field of each kind over the query bar's sixty machines", () => {
    expect(barMachines).toHaveLength(60);
    expect(barMachineCollection.schema.fields.map(({ kind }) => kind)).toEqual([
      "choices",
      "number",
      "choices",
      "presence",
      "text",
      "date",
    ]);
    expect(barMachineCollection.identify(barMachines.at(0) as never)).toBe(
      "bm-01",
    );
  });
});

describe("pooledMachineCollection", () => {
  it("adds a pool of twelve to the query bar's machines", () => {
    expect(pooledMachines).toHaveLength(60);
    expect(pooledMachines.at(13)?.pool).toBe("ex-pool-02");
    expect(pooledMachineCollection.schema.findField("pool")).toMatchObject({
      kind: "choices",
    });
    expect(
      pooledMachineCollection.identify(pooledMachines.at(0) as never),
    ).toBe("bm-01");
  });
});
