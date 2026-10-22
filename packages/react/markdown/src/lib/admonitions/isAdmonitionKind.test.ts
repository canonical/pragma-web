import { describe, expect, it } from "vitest";
import isAdmonitionKind from "./isAdmonitionKind.js";

describe("isAdmonitionKind", () => {
  it.each(["note", "tip", "important", "warning", "caution"])(
    "accepts %s",
    (value) => {
      expect(isAdmonitionKind(value)).toBe(true);
    },
  );

  it.each([["NOTE"], ["danger"], [""], [undefined], [1]])(
    "rejects %s",
    (value) => {
      expect(isAdmonitionKind(value)).toBe(false);
    },
  );
});
