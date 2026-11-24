import { describe, expect, it } from "vitest";
import compileFieldReader from "./compileFieldReader.js";

/** One read of one field, as a pass over a single row makes it. */
const readField = (row: object, field: string): unknown =>
  compileFieldReader(field)(row);

describe("compileFieldReader", () => {
  describe("a flat field", () => {
    it("reads a field the row carries", () => {
      expect(readField({ name: "alpha" }, "name")).toBe("alpha");
    });

    it("reads nothing for a field the row does not carry", () => {
      expect(readField({ name: "alpha" }, "cpu")).toBeUndefined();
    });

    it("reads nothing for an inherited member", () => {
      expect(readField({}, "constructor")).toBeUndefined();
      expect(readField({}, "toString")).toBeUndefined();
    });
  });

  describe("a dot path", () => {
    it("reads one own property per segment", () => {
      expect(readField({ config: { region: "eu" } }, "config.region")).toBe(
        "eu",
      );
      expect(readField({ a: { b: { c: "deep" } } }, "a.b.c")).toBe("deep");
      const handler = Object.assign(() => {}, { label: "x" });
      expect(readField({ handler }, "handler.label")).toBe("x");
    });

    it("reads nothing for an absent segment", () => {
      expect(readField({ config: { region: "eu" } }, "config.zone")).toBe(
        undefined,
      );
      expect(readField({ config: { region: "eu" } }, "net.region")).toBe(
        undefined,
      );
    });

    it("reads nothing through an inherited member or a primitive", () => {
      expect(
        readField({ config: Object.create({ region: "eu" }) }, "config.region"),
      ).toBeUndefined();
      expect(readField({ name: "alpha" }, "name.length")).toBeUndefined();
      expect(readField({ config: null }, "config.region")).toBeUndefined();
    });

    it("does not read an own key holding a literal dot", () => {
      expect(readField({ "config.region": "eu" }, "config.region")).toBe(
        undefined,
      );
    });
  });
});
