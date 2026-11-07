import type { RequestHandler } from "msw";
import { describe, expectTypeOf, it } from "vitest";
import type { MswGlobals, MswParameter } from "./types.js";

describe("MswParameter", () => {
  it("takes optional handlers and an optional opt-out", () => {
    expectTypeOf<MswParameter>().toEqualTypeOf<{
      handlers?: RequestHandler[];
      disable?: boolean;
    }>();
    expectTypeOf<{ handlers: [] }>().toExtend<MswParameter>();
    expectTypeOf<{ disable: true }>().toExtend<MswParameter>();
  });
});

describe("MswGlobals", () => {
  it("holds whether MSW is on", () => {
    expectTypeOf<MswGlobals>().toEqualTypeOf<{ enabled: boolean }>();
  });
});
