import type { SchemaFieldDefinition } from "@canonical/dataviews-core";
import { describe, expect, it } from "vitest";
import chooseArrangement from "./chooseArrangement.js";

const choices = (
  count: number,
  extra: Partial<SchemaFieldDefinition> = {},
): SchemaFieldDefinition =>
  ({
    field: "status",
    kind: "choices",
    options: Array.from({ length: count }, (_, index) => `s${index}`),
    ...extra,
  }) as SchemaFieldDefinition;

/** What a source offers on a choice: both sets. */
const ANY = ["isAny", "isNone"] as const;

describe("chooseArrangement", () => {
  it("shows a choice of one value among two to five declared as words", () => {
    expect(chooseArrangement(choices(2), undefined, ANY)).toBe("words");
    expect(chooseArrangement(choices(5), undefined, ANY)).toBe("words");
  });

  it("shows any other field as a filter button", () => {
    expect(chooseArrangement(choices(1), undefined, ANY)).toBe("button");
    expect(chooseArrangement(choices(6), undefined, ANY)).toBe("button");
    expect(
      chooseArrangement(choices(3, { multiple: true }), undefined, ANY),
    ).toBe("button");
    expect(
      chooseArrangement({ field: "pool", kind: "choices" }, undefined, ANY),
    ).toBe("button");
    expect(
      chooseArrangement({ field: "memory", kind: "number" }, undefined, ANY),
    ).toBe("button");
  });

  it("takes the arrangement asked for", () => {
    expect(chooseArrangement(choices(3), "button", ANY)).toBe("button");
    expect(
      chooseArrangement(choices(9, { multiple: true }), "words", ANY),
    ).toBe("words");
  });

  it("shows a choice whose source offers no any-of as a button, and refuses words for it", () => {
    expect(chooseArrangement(choices(3), undefined, ["isNone"])).toBe("button");
    expect(() => chooseArrangement(choices(3), "words", ["isNone"])).toThrow(
      /"status" can show as words only where its source offers any-of/,
    );
  });

  it("refuses words for a field without declared values", () => {
    expect(() =>
      chooseArrangement({ field: "owner", kind: "presence" }, "words", ANY),
    ).toThrow(/"owner" can show as words only/);
    expect(() =>
      chooseArrangement({ field: "pool", kind: "choices" }, "words", ANY),
    ).toThrow(/"pool"/);
  });
});
