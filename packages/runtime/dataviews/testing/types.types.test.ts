/**
 * The test-only shapes the shared helpers hand a suite.
 */
import { describe, expectTypeOf, it } from "vitest";
import type { HistoryMode } from "../src/lib/location/index.js";
import type { SourceDelivery } from "../src/lib/result/index.js";
import type { RowRecord } from "../src/lib/rows/index.js";
import type {
  CountedField,
  Deferred,
  ManualCall,
  RecordedWrite,
  SettledRow,
} from "./types.js";

describe("ManualCall", () => {
  it("answers its request with a delivery, and counts its releases", () => {
    expectTypeOf<ManualCall["deliver"]>().toEqualTypeOf<
      (delivery: SourceDelivery<RowRecord>) => void
    >();
    expectTypeOf<ManualCall["releases"]>().toEqualTypeOf<number>();
  });
});

describe("RecordedWrite", () => {
  it("is the spelling written and the history mode it entered with", () => {
    expectTypeOf<RecordedWrite>().toEqualTypeOf<
      readonly [string, HistoryMode | null]
    >();
  });
});

describe("Deferred", () => {
  it("is a promise a test settles on cue", () => {
    expectTypeOf<Deferred<number>["resolve"]>().toEqualTypeOf<
      (value: number) => void
    >();
  });
});

describe("CountedField", () => {
  it("names the fields counted rows count reads of", () => {
    expectTypeOf<CountedField>().toEqualTypeOf<"name" | "status">();
  });
});

describe("SettledRow", () => {
  it("carries an identity and nothing else", () => {
    expectTypeOf<SettledRow>().toEqualTypeOf<{ readonly id: string }>();
  });
});
