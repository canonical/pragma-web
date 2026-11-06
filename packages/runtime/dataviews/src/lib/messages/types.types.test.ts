/**
 * The message record's contracts: the facts a worded message is handed,
 * and the words a translation writes for each status, hint and list.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import type { SortDirection } from "../query/index.js";
import type {
  DataViewsMessages,
  FacetCountWords,
  SortTermWords,
} from "./types.js";

describe("SortTermWords", () => {
  it("words one ordering term by its name and direction", () => {
    expectTypeOf<SortTermWords>().toEqualTypeOf<{
      readonly name: string;
      readonly direction: SortDirection;
    }>();
  });
});

describe("FacetCountWords", () => {
  it("words a count of something, never an unknown one", () => {
    const exact: FacetCountWords = { kind: "exact", value: 3 };
    // @ts-expect-error a count of nothing is not worded
    const unknown: FacetCountWords = { kind: "unknown" };
    expect([exact, unknown]).toHaveLength(2);
  });
});

describe("DataViewsMessages", () => {
  it("names the column a placed edge ends", () => {
    expectTypeOf<DataViewsMessages["columnEndPlacement"]>().toEqualTypeOf<
      (name: string) => string
    >();
  });

  it("says why a link was refused, and lists each refused clause by name", () => {
    expectTypeOf<DataViewsMessages["statusRefused"]>().toEqualTypeOf<
      (reason: string) => string
    >();
    expectTypeOf<DataViewsMessages["linkRefusals"]>().toEqualTypeOf<string>();
    expectTypeOf<DataViewsMessages["clauseRefused"]>().toEqualTypeOf<
      (name: string, reason: string) => string
    >();
  });

  it("says no access in words of its own, handed nothing of the server's", () => {
    expectTypeOf<DataViewsMessages["statusNoAccess"]>().toEqualTypeOf<string>();
  });
});
