import { describe, expect, it } from "vitest";
import { buildSearchPassage } from "./buildSearchPassage.js";

describe("buildSearchPassage", () => {
  it("keeps a value that fits whole, with every occurrence", () => {
    expect(buildSearchPassage("Line on line", "line")).toEqual({
      passage: "Line on line",
      ranges: [
        { start: 0, length: 4 },
        { start: 8, length: 4 },
      ],
    });
  });

  it("centres the first occurrence in 160 characters of a long value", () => {
    const value = `${"a".repeat(200)}needle${"b".repeat(200)}`;
    const { passage, ranges } = buildSearchPassage(value, "needle");
    expect(passage).toHaveLength(160);
    expect(ranges).toEqual([{ start: 77, length: 6 }]);
  });

  it("clamps the passage to the value's start and end", () => {
    const head = `needle${"a".repeat(300)}`;
    expect(buildSearchPassage(head, "needle").ranges).toEqual([
      { start: 0, length: 6 },
    ]);
    const tail = `${"a".repeat(300)}needle`;
    expect(buildSearchPassage(tail, "needle")).toEqual({
      passage: tail.slice(-160),
      ranges: [{ start: 154, length: 6 }],
    });
  });

  it("moves each edge off a split surrogate pair", () => {
    const tail = `needle${"a".repeat(153)}😀${"b".repeat(100)}`;
    expect(buildSearchPassage(tail, "needle").passage).toBe(
      `needle${"a".repeat(153)}`,
    );
    const head = `${"b".repeat(100)}😀${"a".repeat(76)}needle${"c".repeat(200)}`;
    expect(buildSearchPassage(head, "needle")).toEqual({
      passage: `${"a".repeat(76)}needle${"c".repeat(77)}`,
      ranges: [{ start: 76, length: 6 }],
    });
  });

  it("places the ranges on the value as written when lowercasing lengthens it", () => {
    expect(buildSearchPassage("İstanbul line", "line")).toEqual({
      passage: "İstanbul line",
      ranges: [{ start: 9, length: 4 }],
    });
  });

  it("gives the head of a value without an occurrence, with no ranges", () => {
    expect(buildSearchPassage("a".repeat(200), "needle")).toEqual({
      passage: "a".repeat(160),
      ranges: [],
    });
  });
});
