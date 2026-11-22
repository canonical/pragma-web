import { describe, expect, it } from "vitest";
import splitPassage from "./splitPassage.js";

describe("splitPassage", () => {
  it("marks each range and keeps the text around it", () => {
    expect(
      splitPassage("a but b but", [
        { start: 2, length: 3 },
        { start: 8, length: 3 },
      ]),
    ).toEqual([
      { start: 0, text: "a ", matched: false },
      { start: 2, text: "but", matched: true },
      { start: 5, text: " b ", matched: false },
      { start: 8, text: "but", matched: true },
    ]);
  });

  it("returns the passage whole when no range is given", () => {
    expect(splitPassage("plain", [])).toEqual([
      { start: 0, text: "plain", matched: false },
    ]);
  });

  it("clips an overlapping or overlong range and reads ranges in order", () => {
    expect(
      splitPassage("abcdef", [
        { start: 4, length: 9 },
        { start: 0, length: 2 },
        { start: 1, length: 2 },
      ]),
    ).toEqual([
      { start: 0, text: "ab", matched: true },
      { start: 2, text: "c", matched: true },
      { start: 3, text: "d", matched: false },
      { start: 4, text: "ef", matched: true },
    ]);
  });

  it("skips a range that lies inside one already marked", () => {
    expect(
      splitPassage("abcdef", [
        { start: 0, length: 4 },
        { start: 1, length: 2 },
      ]).map(({ text, matched }) => [text, matched]),
    ).toEqual([
      ["abcd", true],
      ["ef", false],
    ]);
  });
});
