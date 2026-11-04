/**
 * Compile-time contract tests for the test-only types in testing/types.ts.
 *
 * `tsc --noEmit` checks this file, so each row fails the check if the type
 * it pins changes shape.
 */

import { describe, expectTypeOf, it } from "vitest";
import type { MessageRecord } from "../src/lib/index.js";
import type { FakeDocument, ItemMessages, TwoLocales } from "./types.js";

describe("FakeDocument", () => {
  it("holds the cookie and the root element's lang and dir", () => {
    expectTypeOf<FakeDocument>().toEqualTypeOf<{
      cookie: string;
      documentElement: { lang: string; dir: string };
    }>();
  });
});

describe("TwoLocales", () => {
  it("is English and French", () => {
    expectTypeOf<TwoLocales>().toEqualTypeOf<"en" | "fr">();
  });
});

describe("ItemMessages", () => {
  it("is a message record with one plural message", () => {
    expectTypeOf<ItemMessages>().toExtend<MessageRecord>();
    expectTypeOf<ItemMessages["items"]>().toEqualTypeOf<
      (count: number) => string
    >();
  });

  it("has exactly that one read-only message", () => {
    expectTypeOf<ItemMessages>().toEqualTypeOf<{
      readonly items: (count: number) => string;
    }>();
  });
});
