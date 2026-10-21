// @vitest-environment node

/**
 * The lens's query contract: the variables every seam shares, and the two
 * pagination facts that are load-bearing rather than cosmetic.
 *
 * Both page sizes exist because the schema's DEFAULTS silently truncate
 * this model, and both numbers were measured against the live backend
 * rather than guessed:
 *
 *   - `pairings` defaults are irrelevant; `first:` hard-caps at 100 and
 *     the model holds 133. One window reaches 38 of the 51 paired jobs,
 *     so 13 would vanish with nothing on screen saying so.
 *   - `jobs` defaults to FIFTY of the 52 jobs, with `hasNextPage: true`.
 *
 * A regression in either would show up as journeys quietly missing — the
 * exact failure this lens exists to expose — so both are pinned here.
 */

import { describe, expect, it } from "vitest";
import {
  JOB_PAGE_SIZE,
  journeysExplorerQueryNode,
  journeysExplorerVariables,
  PAIRING_PAGE_SIZE,
  readJobParam,
} from "./journeysQuery.js";

const JOB = "sem://design-system-docs#job.l3";

describe("journeysExplorerVariables", () => {
  it("asks for both pages explicitly — the schema's defaults truncate", () => {
    const variables = journeysExplorerVariables(undefined);
    // 100: the connection cap, and the window size the union is built on.
    expect(variables.pairings).toBe(PAIRING_PAGE_SIZE);
    expect(PAIRING_PAGE_SIZE).toBe(100);
    // 100 again, but for a different reason: the jobs root defaults to 50.
    expect(variables.jobs).toBe(JOB_PAGE_SIZE);
    expect(JOB_PAGE_SIZE).toBeGreaterThanOrEqual(52);
  });

  it("carries the degenerate empty uri behind hasJob:false on the index", () => {
    expect(journeysExplorerVariables(undefined)).toEqual({
      jobs: JOB_PAGE_SIZE,
      pairings: PAIRING_PAGE_SIZE,
      hasJob: false,
      uri: "",
    });
  });

  it("carries the selected job's uri behind hasJob:true", () => {
    expect(journeysExplorerVariables(JOB)).toEqual({
      jobs: JOB_PAGE_SIZE,
      pairings: PAIRING_PAGE_SIZE,
      hasJob: true,
      uri: JOB,
    });
  });
});

describe("readJobParam", () => {
  it("reads a present job param", () => {
    expect(readJobParam({ job: JOB })).toBe(JOB);
  });

  it("is undefined on the index route", () => {
    expect(readJobParam({})).toBeUndefined();
  });

  it("throws on a malformed param rather than guessing", () => {
    expect(() => readJobParam({ job: "" })).toThrow(/non-empty string/);
    expect(() => readJobParam({ job: 7 })).toThrow(/non-empty string/);
  });
});

describe("journeysExplorerQueryNode", () => {
  it("carries a compiled operation with real text", () => {
    expect(typeof journeysExplorerQueryNode.params.text).toBe("string");
    expect(journeysExplorerQueryNode.params.text?.length).toBeGreaterThan(0);
    expect(journeysExplorerQueryNode.params.name).toBe("JourneysExplorerQuery");
  });

  it("roots at pairings and reads composes through the Surface interface", () => {
    // The R2 finding, pinned in the shipped operation text: a `views` root
    // structurally cannot see the composes edges that hang off lenses.
    const text = journeysExplorerQueryNode.params.text ?? "";
    expect(text).toContain("head: pairings(first:");
    expect(text).toContain("tail: pairings(last:");
    expect(text).toContain("pairsSurface");
    expect(text).toContain("composes");
  });
});
