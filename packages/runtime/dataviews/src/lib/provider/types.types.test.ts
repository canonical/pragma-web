/**
 * The provider's internal contracts: what moves the query, and what the
 * query path answers a command with.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { QueryCommand } from "../query/index.js";
import type { SourceRefusal } from "../result/index.js";
import type {
  AdoptionCause,
  QueryCommands,
  QueryTransition,
  TransitionCause,
} from "./types.js";

describe("TransitionCause", () => {
  it("adds the moves no policy names to the query transitions", () => {
    expectTypeOf<
      Exclude<TransitionCause, QueryTransition | AdoptionCause>
    >().toEqualTypeOf<"collapse" | "reset">();
  });
});

describe("QueryCommands", () => {
  it("applies one command, and answers with the refusals it incurs", () => {
    expectTypeOf<QueryCommands["command"]>()
      .parameter(0)
      .toEqualTypeOf<QueryCommand>();
    expectTypeOf<QueryCommands["command"]>().returns.toEqualTypeOf<
      readonly SourceRefusal[]
    >();
  });
});
