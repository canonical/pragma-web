/**
 * The shared fixtures every suite builds from: each one means what its name
 * says, so a suite that reads one is not misled by it.
 */
import { describe, expect, it } from "vitest";
import {
  BY_NUMBER,
  FACETED_ROWS,
  FACETED_SCHEMA,
  FORWARD_CURSORS,
  LINKS_CAPABILITIES,
  LINKS_COLLECTION,
  LINKS_VALID_TODAY,
  NOTHING_DECLARED,
} from "./fixtures.js";
import readId from "./readId.js";

describe("fixtures", () => {
  describe("NOTHING_DECLARED", () => {
    it("can filter, search and sort by nothing", () => {
      expect(NOTHING_DECLARED.filter).toEqual({});
      expect(NOTHING_DECLARED.search).toBeNull();
      expect(NOTHING_DECLARED.sort.fields).toEqual([]);
    });
  });

  describe("BY_NUMBER and FORWARD_CURSORS", () => {
    it("reach pages by number, or forward by token alone", () => {
      expect(BY_NUMBER).toEqual({ kind: "offset" });
      expect(FORWARD_CURSORS).toEqual({
        kind: "cursor",
        backward: false,
        durable: false,
      });
    });
  });

  describe("FACETED_SCHEMA and FACETED_ROWS", () => {
    it("hold a field of every kind, and records meeting each one every way", () => {
      expect(FACETED_SCHEMA.fieldNames).toEqual([
        "status",
        "cpu",
        "owner",
        "updated",
        "name",
      ]);
      expect(new Set(FACETED_ROWS.map(readId)).size).toBe(FACETED_ROWS.length);
    });
  });

  describe("LINKS_COLLECTION and LINKS_CAPABILITIES", () => {
    it("declare a field of every kind, narrowing tags and the host name", () => {
      expect(LINKS_COLLECTION.schema.fieldNames).toEqual([
        "status",
        "tags",
        "cpu",
        "memory",
        "updated",
        "owner",
        "hostname",
        "config.region",
        "config.cores",
      ]);
      expect(LINKS_CAPABILITIES.filter["tags"]).toEqual(["isAny"]);
      expect(LINKS_CAPABILITIES.filter["hostname"]).toEqual(["contains"]);
      expect(LINKS_CAPABILITIES.search).toEqual({ fields: ["hostname"] });
    });
  });

  describe("LINKS_VALID_TODAY", () => {
    it("holds each link once", () => {
      const params = LINKS_VALID_TODAY.map((link) => link.params);
      expect(new Set(params).size).toBe(params.length);
    });
  });
});
