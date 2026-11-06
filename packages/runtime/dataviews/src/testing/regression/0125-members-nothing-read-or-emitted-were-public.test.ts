/**
 * Regression: the surface carries no member that nothing reads or emits.
 *
 * Before the fix, a source had to declare and answer a collection `total`
 * that nothing displayed, a refusal code `query-targets-unsupported` and a
 * part `targets` existed that nothing emitted, and the display status had
 * a `regrouping` kind no state produced, which every `renderStatus` had to
 * word. Each is removed until its reader or emitter lands with it.
 */

import { describe, expect, expectTypeOf, it } from "vitest";
import type { DisplayStatus } from "../../lib/display/index.js";
import { DISPLAY_STATUS_PHASES } from "../../lib/display/index.js";
import { resolveMessages } from "../../lib/messages/index.js";
import type {
  SourceCounts,
  SourceRefusalCode,
  SourceRefusalPart,
} from "../../lib/result/index.js";
import type { CountCapabilities } from "../../lib/source/index.js";
import { createPage } from "../../lib/source/index.js";

describe("regression 0125 — members nothing read or emitted were public", () => {
  it("counts no collection total a source must answer", () => {
    expect(Object.keys(createPage({ rows: [] }).counts).sort()).toEqual([
      "matched",
      "pageable",
    ]);
    expectTypeOf<keyof SourceCounts>().toEqualTypeOf<"pageable" | "matched">();
    expectTypeOf<keyof CountCapabilities>().toEqualTypeOf<
      "pageable" | "matched"
    >();
  });

  it("names no refusal and no status nothing emits", () => {
    expectTypeOf<"targets">().not.toExtend<SourceRefusalPart>();
    expectTypeOf<"query-targets-unsupported">().not.toExtend<SourceRefusalCode>();
    expectTypeOf<"regrouping">().not.toExtend<DisplayStatus["status"]>();
    expect(Object.keys(DISPLAY_STATUS_PHASES)).not.toContain("regrouping");
    expect(Object.keys(resolveMessages())).not.toContain("statusRegrouping");
  });
});
