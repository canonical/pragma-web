import { describe, expect, it } from "vitest";
import readFieldName from "./readFieldName.js";

describe("readFieldName", () => {
  it("reads the field the display field names", () => {
    expect(readFieldName({ id: "host", header: "Host", field: "name" })).toBe(
      "name",
    );
  });

  it("falls back to the id when it names none", () => {
    expect(readFieldName({ id: "name", header: "Name" })).toBe("name");
  });
});
