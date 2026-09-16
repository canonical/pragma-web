/**
 * Reading one field of a record, by name and by dot path. Mutation-tested:
 * each expectation fails if the own-property rule, the path walk or the
 * answer for an unreadable segment moves.
 */

import { describe, expect, it } from "vitest";
import readField from "./readField.js";

describe("readField", () => {
  describe("a flat field", () => {
    it("reads an own property", () => {
      expect(readField({ name: "web-1" }, "name")).toBe("web-1");
    });

    it("reads a field the record does not carry as empty", () => {
      expect(readField({ name: "web-1" }, "owner")).toBeUndefined();
    });

    it("keeps a present value that is null, which is not the same as absent", () => {
      expect(readField({ owner: null }, "owner")).toBeNull();
    });

    it("reads an inherited member as empty", () => {
      // A field named after a prototype member reads nothing, rather than a
      // function the record never carried.
      expect(readField({ name: "web-1" }, "toString")).toBeUndefined();
      expect(
        readField(Object.create({ owner: "ubuntu" }), "owner"),
      ).toBeUndefined();
    });
  });

  describe("a dot path", () => {
    it("reads one own property at a time", () => {
      expect(readField({ config: { region: "eu" } }, "config.region")).toBe(
        "eu",
      );
    });

    it("walks further than one level", () => {
      expect(readField({ a: { b: { c: { d: "deep" } } } }, "a.b.c.d")).toBe(
        "deep",
      );
    });

    it("reads a missing leaf as empty", () => {
      expect(
        readField({ config: { region: "eu" } }, "config.zone"),
      ).toBeUndefined();
    });

    it("reads a missing segment on the way as empty", () => {
      expect(
        readField({ config: { region: "eu" } }, "network.region"),
      ).toBeUndefined();
    });

    it("reads an inherited member at any segment as empty", () => {
      expect(
        readField({ config: Object.create({ region: "eu" }) }, "config.region"),
      ).toBeUndefined();
      expect(
        readField({ config: { region: "eu" } }, "config.constructor"),
      ).toBeUndefined();
    });

    it("reads through a value no property can be read from as empty", () => {
      // A primitive answers no own property of its own, and null and
      // undefined answer nothing at all: each is a segment the path cannot
      // pass, and the field is empty rather than a thrown read.
      expect(readField({ name: "web-1" }, "name.length")).toBeUndefined();
      expect(readField({ config: null }, "config.region")).toBeUndefined();
      expect(readField({ config: undefined }, "config.region")).toBeUndefined();
      expect(readField({ cores: 4 }, "cores.toFixed")).toBeUndefined();
    });

    it("does not address an own key that holds a literal dot", () => {
      // The path is the name, so a key spelled with a dot is reached by no
      // path; an adapter maps such a key to a stable name of its own.
      expect(
        readField({ "config.region": "eu" }, "config.region"),
      ).toBeUndefined();
    });
  });
});
