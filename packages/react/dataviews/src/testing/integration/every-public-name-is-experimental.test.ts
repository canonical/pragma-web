import { readFileSync } from "node:fs";
import path from "node:path";
import { listUnmarkedNames } from "@canonical/dataviews-core/testing";
import { describe, expect, it } from "vitest";

/** The names one entry point's barrel exports without the tag. */
const listUnmarked = (barrel: string): readonly string[] =>
  listUnmarkedNames(path.resolve(barrel), path.resolve("src/lib"));

/** Each DataViews member's assignment, with its TSDoc. */
const listMembers = (): readonly (readonly [string, string])[] =>
  [
    ...readFileSync(
      path.resolve("src/lib/_work_in_progress/DataViews/Provider.tsx"),
      "utf8",
    ).matchAll(/(\/\*\*(?:(?!\*\/)[\s\S])*\*\/)\s*DataViews\.(\w+) =/g),
  ].map(([, doc = "", member = ""]) => [member, doc] as const);

describe("every public name is experimental", () => {
  it("tags every name the root and ./virtualization export", () => {
    expect(listUnmarked("src/lib/index.ts")).toEqual([]);
    expect(listUnmarked("src/lib/virtualization/index.ts")).toEqual([]);
  });

  it("finds each DataViews member's documentation", () => {
    expect(listMembers()).toHaveLength(8);
  });

  it("tags every DataViews member", () => {
    expect(
      listMembers().filter(([, doc]) => !doc.includes("@experimental")),
    ).toEqual([]);
  });
});
