import { describe, expect, it } from "vitest";
import validateFileConstraints from "./validateFileConstraints.js";

const file = (name: string, size: number) =>
  new File([new Uint8Array(size)], name);

describe("validateFileConstraints", () => {
  it("accepts a selection within the limits or without limits", () => {
    expect(validateFileConstraints([file("a", 10)], 1, 100)).toBeUndefined();
    expect(
      validateFileConstraints([file("a", 10)], undefined, undefined),
    ).toBeUndefined();
  });

  it("reports too many files", () => {
    expect(
      validateFileConstraints([file("a", 1), file("b", 1)], 1, undefined),
    ).toBe("You can upload at most 1 file.");
    expect(
      validateFileConstraints(
        [file("a", 1), file("b", 1), file("c", 1)],
        2,
        undefined,
      ),
    ).toBe("You can upload at most 2 files.");
  });

  it("reports the first oversized file in bytes, KB or MB", () => {
    expect(validateFileConstraints([file("big", 600)], undefined, 500)).toBe(
      "big exceeds 500 B.",
    );
    expect(validateFileConstraints([file("big", 3000)], undefined, 2048)).toBe(
      "big exceeds 2 KB.",
    );
    expect(
      validateFileConstraints(
        [file("big", 2 * 1024 * 1024)],
        undefined,
        1572864,
      ),
    ).toBe("big exceeds 1.5 MB.");
  });
});
