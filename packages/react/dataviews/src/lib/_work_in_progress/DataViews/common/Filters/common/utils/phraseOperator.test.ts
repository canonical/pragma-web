import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import phraseOperator from "./phraseOperator.js";

describe("phraseOperator", () => {
  it("names every operator's control by the field's label, presence by the label alone", () => {
    const messages = resolveMessages({});
    const operators = [
      "isAny",
      "isNone",
      "gte",
      "lte",
      "is",
      "isNot",
      "contains",
      "notContains",
      "startsWith",
      "endsWith",
      "isSet",
    ] as const;
    expect(
      operators.map((operator) => phraseOperator(messages, operator, "Name")),
    ).toEqual([
      "Name is any of",
      "Name is none of",
      "Name from",
      "Name to",
      "Name is",
      "Name is not",
      "Name contains",
      "Name does not contain",
      "Name starts with",
      "Name ends with",
      "Name",
    ]);
  });
});
