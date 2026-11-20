import { describe, expect, it } from "vitest";
import buildMachines from "./buildMachines.js";
import { machines } from "./fixtures.js";

describe("buildMachines", () => {
  it("numbers each host, cycling through the twelve", () => {
    const many = buildMachines(13);
    expect(many).toHaveLength(13);
    expect(many[0]).toMatchObject({
      id: "n-0",
      name: "node-00000.example.com",
      status: machines[0].status,
    });
    expect(many[12]?.region).toBe(machines[0].region);
  });
});
