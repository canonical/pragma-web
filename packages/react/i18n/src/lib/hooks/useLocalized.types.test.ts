/**
 * Compile-time contract tests for useLocalized's inference.
 *
 * Runtime behaviour lives in the sibling test files; this file pins the
 * result type the hook infers for a typed and for an unannotated per-locale
 * set, and that a misspelled member read through either fails to compile.
 * `tsc --noEmit` checks it, so a `@ts-expect-error` row fails the check once
 * its error goes away. The hooks below are declared and never called.
 */

import { describe, expectTypeOf, it } from "vitest";
import { greetings } from "../../../testing/fixtures.js";
import type { Greetings } from "../../../testing/types.js";
import useLocalized from "./useLocalized.js";

const headings = { en: { heading: "Welcome" }, fr: { heading: "Bienvenue" } };

function useGreetings() {
  return useLocalized(greetings);
}

function useHeadings() {
  return useLocalized(headings);
}

describe("useLocalized", () => {
  it("returns the record type of a typed per-locale set", () => {
    expectTypeOf<ReturnType<typeof useGreetings>>().toEqualTypeOf<Greetings>();
  });

  it("infers the record type of an unannotated per-locale set", () => {
    expectTypeOf<ReturnType<typeof useHeadings>>().toEqualTypeOf<{
      heading: string;
    }>();
  });

  it("fails to compile a misspelled member read through a typed set", () => {
    function useMisspelled() {
      // @ts-expect-error `headin` is not a member of Greetings
      return useGreetings().headin;
    }
    expectTypeOf(useMisspelled).toBeFunction();
  });

  it("fails to compile a misspelled member read through an unannotated set", () => {
    function useMisspelled() {
      // @ts-expect-error `headin` is not a member of the inferred record
      return useHeadings().headin;
    }
    expectTypeOf(useMisspelled).toBeFunction();
  });
});
