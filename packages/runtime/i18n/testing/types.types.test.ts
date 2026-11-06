/**
 * Compile-time contract tests for the test-only types in testing/types.ts.
 *
 * `tsc --noEmit` checks this file, so each row fails the check if the type
 * it pins changes shape.
 */

import { describe, expectTypeOf, it } from "vitest";
import type { FakeDocument } from "./types.js";

describe("FakeDocument", () => {
  it("holds the cookie and the root element's lang and dir", () => {
    expectTypeOf<FakeDocument>().toEqualTypeOf<{
      cookie: string;
      documentElement: { lang: string; dir: string };
    }>();
  });
});
