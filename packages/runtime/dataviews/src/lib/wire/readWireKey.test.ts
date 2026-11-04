import { describe, expect, it } from "vitest";
import readWireKey from "./readWireKey.js";

describe("readWireKey", () => {
  it("reads a bare name as the field, with no operator, at ordinal 0", () => {
    expect(readWireKey("status")).toEqual({
      field: "status",
      operator: null,
      ordinal: 0,
    });
  });

  it("reads one delimiter as the field and its operator, at ordinal 0", () => {
    expect(readWireKey("config.cores__gte")).toEqual({
      field: "config.cores",
      operator: "gte",
      ordinal: 0,
    });
    expect(readWireKey("status__")).toEqual({
      field: "status",
      operator: "",
      ordinal: 0,
    });
  });

  it("reads the third segment as the conjunct's ordinal", () => {
    expect(readWireKey("tags__isAny__1")).toEqual({
      field: "tags",
      operator: "isAny",
      ordinal: 1,
    });
    expect(readWireKey("tags__isAny__0").ordinal).toBe(0);
    // Leading zeros read as the number they spell.
    expect(readWireKey("tags__isAny__01").ordinal).toBe(1);
  });

  it("reads anything else after the second delimiter as no ordinal", () => {
    for (const key of [
      "cpu__gte__-1",
      "cpu__gte__1.5",
      "cpu__gte__x",
      "cpu__gte__",
      "cpu__gte__1__2",
      "cpu__gte__ 1",
      "cpu__gte__99999999999999999999",
    ]) {
      expect(readWireKey(key)).toEqual({
        field: "cpu",
        operator: "gte",
        ordinal: null,
      });
    }
  });
});
