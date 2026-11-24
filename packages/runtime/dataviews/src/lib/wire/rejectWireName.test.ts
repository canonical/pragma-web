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

  it("refuses a name carrying a table's arrangement", () => {
    expect(rejectWireName("table.machines.order")).not.toBeNull();
    expect(rejectWireName("table.cores")).toBeNull();
  });

  describe("a dot path", () => {
    it("accepts a path whose segments the grammar can spell", () => {
      expect(rejectWireName("config.region")).toBeNull();
    });

    it("accepts a nested field under a record key named table", () => {
      expect(rejectWireName("table.name")).toBeNull();
    });

    it("refuses a segment holding the delimiter", () => {
      expect(rejectWireName("config.re__gion")).toBe(
        'field name "config.re__gion" must not contain "__"',
      );
    });

    it("refuses a whole path that is a reserved query parameter", () => {
      expect(rejectWireName("table.t.order")).toBe(
        'field name "table.t.order" is a reserved query parameter',
      );
    });

    it("refuses a segment with no name", () => {
      for (const name of [".region", "config.", "config..region"]) {
        expect(rejectWireName(name)).toBe(
          `field name "${name}" has a segment with no name`,
        );
      }
    });
  });
});
