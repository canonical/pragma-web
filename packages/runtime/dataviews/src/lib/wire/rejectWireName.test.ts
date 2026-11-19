import { describe, expect, it } from "vitest";
import rejectWireName from "./rejectWireName.js";

describe("rejectWireName", () => {
  it("accepts a name the grammar can spell", () => {
    expect(rejectWireName("status")).toBeNull();
  });

  it("refuses a name holding the delimiter", () => {
    expect(rejectWireName("cpu__gte")).toBe(
      'field name "cpu__gte" must not contain "__"',
    );
  });

  it("refuses a reserved query parameter", () => {
    expect(rejectWireName("view")).toBe(
      'field name "view" is a reserved query parameter',
    );
  });
});
