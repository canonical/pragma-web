import { describe, expect, it } from "vitest";
import viewSearch from "./viewSearch.js";

/** Validate `value` with the schema and return its value. */
const read = (value: unknown) => {
  const result = viewSearch["~standard"].validate(value);
  if (result instanceof Promise || result.issues !== undefined) {
    throw new Error("viewSearch failed");
  }
  return result.value;
};

describe("viewSearch", () => {
  it("passes the view's six parameters through as text", () => {
    expect(
      read({
        as: "cards",
        q: "cen",
        sheet: "filter",
        graph: "orbit",
        select: "ds:a",
        expand: "ds:a:p:out",
      }),
    ).toEqual({
      as: "cards",
      q: "cen",
      sheet: "filter",
      graph: "orbit",
      select: "ds:a",
      expand: "ds:a:p:out",
    });
  });

  it("leaves out every parameter the address does not carry", () => {
    expect(read({})).toEqual({});
    expect(read({ q: "" })).toEqual({ q: "" });
  });

  it("never fails, ignoring parameters it does not name", () => {
    expect(read({ view: "cards", as: 3 })).toEqual({});
  });
});
