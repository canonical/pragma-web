import { describe, expect, it } from "vitest";
import buildBarMachines from "./buildBarMachines.js";

describe("buildBarMachines", () => {
  it("builds sixty machines of distinct identity, the same every call", () => {
    const machines = buildBarMachines();
    expect(machines).toHaveLength(60);
    expect(new Set(machines.map(({ id }) => id)).size).toBe(60);
    expect(buildBarMachines()).toEqual(machines);
  });

  it("gives every status, size and tag, some unowned, each on a calendar date", () => {
    const machines = buildBarMachines();
    expect(new Set(machines.map(({ status }) => status)).size).toBe(5);
    expect(new Set(machines.map(({ memory }) => memory)).size).toBe(6);
    expect(new Set(machines.flatMap(({ tags }) => tags))).toEqual(
      new Set(["ex-gpu", "ex-nvme", "ex-ssd"]),
    );
    expect(machines.filter((machine) => !("owner" in machine))).toHaveLength(
      20,
    );
    expect(machines.at(0)).toEqual({
      id: "bm-01",
      hostname: "ex-node-01.example.com",
      status: "deployed",
      memory: 4096,
      tags: ["ex-gpu", "ex-nvme"],
      owner: "ex:ana",
      deployed: "2026-01-01",
    });
    expect(
      machines.every(({ deployed }) => /^2026-\d\d-\d\d$/.test(deployed)),
    ).toBe(true);
  });
});
