/**
 * The wire grammar's names. Mutation-tested: each expectation fails if the
 * reserved list, the delimiter, an address spelling or key ownership moves.
 */

import { describe, expect, it } from "vitest";
import { HIDDEN_KEY, ORDER_KEY } from "../presentation/index.js";
import { createSchema } from "../schema/index.js";
import {
  HIDDEN_QUERY_KEY,
  OPERATOR_DELIMITER,
  ORDER_QUERY_KEY,
  RESERVED_QUERY_KEYS,
  SUFFIXED_OPERATORS,
} from "./constants.js";
import isOwnedKey from "./isOwnedKey.js";
import readWireField from "./readWireField.js";
import rejectWireName from "./rejectWireName.js";
import spellWireKey from "./spellWireKey.js";

describe("the wire grammar's names", () => {
  it("reserves the written keys and the annotations", () => {
    expect([...RESERVED_QUERY_KEYS]).toEqual([
      "q",
      "sort",
      "group",
      "page",
      "size",
      "cursor",
      "view",
      "item",
      "table.order",
      "table.hidden",
    ]);
    expect(Object.isFrozen(RESERVED_QUERY_KEYS)).toBe(true);
    expect(Object.isFrozen(SUFFIXED_OPERATORS)).toBe(true);
  });

  it("spells the arrangement's parameters as the presentation stores them", () => {
    // A link decodes into the presentation by name, so the two must agree.
    expect(ORDER_QUERY_KEY).toBe(ORDER_KEY);
    expect(HIDDEN_QUERY_KEY).toBe(HIDDEN_KEY);
  });

  it("spells isAny as the bare field name and the rest with the delimiter", () => {
    expect(OPERATOR_DELIMITER).toBe("__");
    expect(spellWireKey("status", "isAny")).toBe("status");
    expect(spellWireKey("cpu", "gte")).toBe("cpu__gte");
    expect(spellWireKey("cpu", "lte")).toBe("cpu__lte");
    expect(spellWireKey("owner", "isSet")).toBe("owner__isSet");
    expect(spellWireKey("name", "contains")).toBe("name__contains");
  });

  it("reads the field a wire key addresses", () => {
    expect(readWireField("status")).toBe("status");
    expect(readWireField("cpu__gte")).toBe("cpu");
    expect(readWireField("a__b__c")).toBe("a");
  });

  it("refuses a field name the grammar cannot spell", () => {
    expect(rejectWireName("status")).toBeNull();
    expect(rejectWireName("cpu__gte")).toBe(
      'field name "cpu__gte" must not contain "__"',
    );
    expect(rejectWireName("sort")).toBe(
      'field name "sort" is a reserved query parameter',
    );
    expect(rejectWireName("cursor")).toBe(
      'field name "cursor" is a reserved query parameter',
    );
    expect(rejectWireName("item")).toBe(
      'field name "item" is a reserved query parameter',
    );
  });

  it("holds each rule to its own part of a dot path", () => {
    // The delimiter rule is every segment's; the reserved rule is the whole
    // path's, so `order` is an ordinary field and `table.order` is not.
    expect(rejectWireName("config.region")).toBeNull();
    expect(rejectWireName("order")).toBeNull();
    expect(rejectWireName("hidden")).toBeNull();
    expect(rejectWireName("config.re__gion")).toBe(
      'field name "config.re__gion" must not contain "__"',
    );
    expect(rejectWireName("table.order")).toBe(
      'field name "table.order" is a reserved query parameter',
    );
    expect(rejectWireName("table.hidden")).toBe(
      'field name "table.hidden" is a reserved query parameter',
    );
  });

  it("refuses a path segment with no name", () => {
    for (const name of [".region", "config.", "config..region"]) {
      expect(rejectWireName(name)).toBe(
        `field name "${name}" has a segment with no name`,
      );
    }
  });

  it("spells and reads a dot path as it is declared", () => {
    // The dot is not the delimiter, so a path needs no escaping and comes
    // back from a key exactly as it went in.
    const nested = createSchema([{ field: "config.region", kind: "text" }]);
    expect(spellWireKey("config.region", "isAny")).toBe("config.region");
    expect(spellWireKey("config.cores", "gte")).toBe("config.cores__gte");
    expect(readWireField("config.region")).toBe("config.region");
    expect(readWireField("config.cores__gte")).toBe("config.cores");
    expect(isOwnedKey("config.region", nested)).toBe(true);
    expect(isOwnedKey("config.region__contains", nested)).toBe(true);
    // A path naming no field of the schema is the host's, as a flat name is.
    expect(isOwnedKey("config.zone", nested)).toBe(false);
  });

  it("owns the written keys and every address of a field, and nothing else", () => {
    const hasField = createSchema([{ field: "cpu", kind: "number" }]);
    // The cursor is written now, so it is the collection's: a write that
    // does not carry one clears the token a previous page left behind.
    for (const key of ["q", "sort", "group", "page", "size", "cursor"]) {
      expect(isOwnedKey(key, hasField)).toBe(true);
    }
    expect(isOwnedKey("cpu", hasField)).toBe(true);
    expect(isOwnedKey("cpu__gte", hasField)).toBe(true);
    // A refused operator is still the field's, so a write clears it.
    expect(isOwnedKey("cpu__near", hasField)).toBe(true);
    // The annotations are reserved but not owned: the host interprets them.
    // A delimited name whose prefix is no field is the host's too.
    expect(isOwnedKey("view", hasField)).toBe(false);
    expect(isOwnedKey("as", hasField)).toBe(false);
    expect(isOwnedKey("utm__source", hasField)).toBe(false);
    expect(isOwnedKey("tab", hasField)).toBe(false);
  });
});
