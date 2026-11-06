/**
 * Compile-time contract tests for the test-only types in testing/types.ts.
 *
 * `tsc --noEmit` checks this file, so each row fails the check if the type
 * it pins stops being a message record or changes shape.
 */

import type { MessageRecord } from "@canonical/i18n-core";
import { describe, expectTypeOf, it } from "vitest";
import type { Greetings, Rows } from "./types.js";

describe("Greetings", () => {
  it("is a message record with text, a one-fact and a plural message", () => {
    expectTypeOf<Greetings>().toExtend<MessageRecord>();
    expectTypeOf<Greetings["heading"]>().toEqualTypeOf<string>();
    expectTypeOf<Greetings["greeting"]>().toEqualTypeOf<
      (name: string) => string
    >();
    expectTypeOf<Greetings["items"]>().toEqualTypeOf<
      (count: number) => string
    >();
  });

  it("has exactly those three read-only messages", () => {
    expectTypeOf<Greetings>().toEqualTypeOf<{
      readonly heading: string;
      readonly greeting: (name: string) => string;
      readonly items: (count: number) => string;
    }>();
  });
});

describe("Rows", () => {
  it("is a message record with one plural message", () => {
    expectTypeOf<Rows>().toExtend<MessageRecord>();
    expectTypeOf<Rows["rowsSelected"]>().toEqualTypeOf<
      (count: number) => string
    >();
  });

  it("has exactly that one read-only message", () => {
    expectTypeOf<Rows>().toEqualTypeOf<{
      readonly rowsSelected: (count: number) => string;
    }>();
  });
});
