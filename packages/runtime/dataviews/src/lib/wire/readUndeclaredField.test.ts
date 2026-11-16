import { describe, expect, it } from "vitest";
import { createSchema } from "../schema/index.js";
import readUndeclaredField from "./readUndeclaredField.js";

const schema = createSchema([{ field: "status", kind: "choices" }]);

describe("readUndeclaredField", () => {
  it("names the field a filter's key addresses when none is declared", () => {
    expect(readUndeclaredField("memory__gte", schema)).toBe("memory");
    expect(readUndeclaredField("gone__isSet", schema)).toBe("gone");
  });

  it("names nothing for a declared field, a bare name or the host's own spelling", () => {
    expect(readUndeclaredField("status__isAny", schema)).toBeNull();
    expect(readUndeclaredField("memory", schema)).toBeNull();
    expect(readUndeclaredField("utm__source", schema)).toBeNull();
    expect(readUndeclaredField("__gte", schema)).toBeNull();
  });
});
