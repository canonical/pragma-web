import { describe, expect, it } from "vitest";
import type { QueryIssue } from "../result/index.js";
import isNarrowingIssue from "./isNarrowingIssue.js";

const buildIssue = (parameter: string, field: string | null): QueryIssue => ({
  parameter,
  field,
  code: "malformed",
  reason: "x",
});

describe("isNarrowingIssue", () => {
  it("reads a refused filter, declared or not, and the search as narrowing", () => {
    expect(isNarrowingIssue(buildIssue("status", "status"))).toBe(true);
    expect(isNarrowingIssue(buildIssue("gone__isAny", "gone"))).toBe(true);
    expect(isNarrowingIssue(buildIssue("q", null))).toBe(true);
  });

  it("reads every other refused parameter as narrowing nothing", () => {
    for (const parameter of ["sort", "page", "size", "cursor", "group"]) {
      expect(isNarrowingIssue(buildIssue(parameter, null))).toBe(false);
    }
  });
});
