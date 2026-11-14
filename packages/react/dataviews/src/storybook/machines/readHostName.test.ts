import { describe, expect, it } from "vitest";
import { machines } from "./fixtures.js";
import readHostName from "./readHostName.js";

describe("readHostName", () => {
  it("names a machine by its host", () => {
    expect(readHostName(machines[0])).toBe(machines[0].name);
  });
});
