import { describe, expect, it } from "vitest";
import { createSchema } from "../schema/index.js";
import isOwnedKey from "./isOwnedKey.js";

const schema = createSchema([
  { field: "status", kind: "choices", options: ["running", "stopped"] },
  { field: "cores", kind: "number" },
]);

describe("isOwnedKey", () => {
  it("owns every parameter the grammar writes", () => {
    for (const key of ["q", "sort", "group", "page", "size", "cursor"]) {
      expect(isOwnedKey(key, schema)).toBe(true);
    }
  });

  it("owns a declared field and any address of one", () => {
    expect(isOwnedKey("status", schema)).toBe(true);
    expect(isOwnedKey("status__isAny", schema)).toBe(true);
    expect(isOwnedKey("cores__gte", schema)).toBe(true);
    // An operator the grammar does not know still addresses the field.
    expect(isOwnedKey("cores__between", schema)).toBe(true);
  });

  it("owns every spelling of a further conjunct, malformed ones included", () => {
    for (const key of [
      "status__isAny__0",
      "status__isAny__1",
      "status__isAny__01",
      "cores__gte__3",
      "cores__gte__-1",
      "cores__gte__1.5",
      "cores__gte__x",
      "cores__gte__",
      "cores__gte__1__2",
      "cores__gte__99999999999999999999",
      "gone__isAny__1",
    ]) {
      expect(isOwnedKey(key, schema)).toBe(true);
    }
  });

  it("owns a filter spelled on a field the collection does not declare", () => {
    expect(isOwnedKey("memory__gte", schema)).toBe(true);
    expect(isOwnedKey("owner__isSet", schema)).toBe(true);
  });

  it("leaves the host's own parameters to the host", () => {
    expect(isOwnedKey("tab", schema)).toBe(false);
    expect(isOwnedKey("view", schema)).toBe(false);
    expect(isOwnedKey("utm__source", schema)).toBe(false);
  });
});
