import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import { NO_RECORDS, PHRASE_MESSAGES } from "./constants.js";

describe("NO_RECORDS", () => {
  it("counts no record, exactly", () => {
    expect(NO_RECORDS).toEqual({ kind: "exact", value: 0 });
    expect(Object.isFrozen(NO_RECORDS)).toBe(true);
  });
});

describe("PHRASE_MESSAGES", () => {
  it("names every operator by a message taking the field's label, presence by none", () => {
    const messages = resolveMessages({});
    const phrases = Object.entries(PHRASE_MESSAGES).map(([operator, key]) => [
      operator,
      key === null ? null : messages[key]("Name"),
    ]);
    expect(phrases).toEqual([
      ["isAny", "Name is any of"],
      ["isNone", "Name is none of"],
      ["gte", "Name from"],
      ["lte", "Name to"],
      ["is", "Name is"],
      ["isNot", "Name is not"],
      ["contains", "Name contains"],
      ["notContains", "Name does not contain"],
      ["startsWith", "Name starts with"],
      ["endsWith", "Name ends with"],
      ["isSet", null],
    ]);
    expect(Object.isFrozen(PHRASE_MESSAGES)).toBe(true);
  });
});
