import { describe, expect, it } from "vitest";
import { STATUSES, TAGS } from "./constants.js";

describe("the word stories' constants", () => {
  it("counts each status", () => {
    expect(STATUSES).toEqual([
      { value: "deployed", count: "12" },
      { value: "ready", count: "4" },
      { value: "broken", count: "1" },
    ]);
  });

  it("lists the tags", () => {
    expect(TAGS).toEqual(["ex-gpu", "ex-nvme", "ex-ssd"]);
  });
});
