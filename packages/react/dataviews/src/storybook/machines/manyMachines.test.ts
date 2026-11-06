import { describe, expect, it } from "vitest";
import { machines } from "./fixtures.js";
import manyMachines from "./manyMachines.js";

describe("manyMachines", () => {
  it("numbers each host, cycling through the twelve", () => {
    const many = manyMachines(13);
    expect(many).toHaveLength(13);
    expect(many[0]).toMatchObject({
      id: "n-0",
      name: "node-00000.example.com",
      status: machines[0].status,
    });
    expect(many[12]?.region).toBe(machines[0].region);
  });
});
