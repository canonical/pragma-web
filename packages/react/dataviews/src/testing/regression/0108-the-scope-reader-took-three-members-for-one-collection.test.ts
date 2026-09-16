/**
 * The reader of columns' scopes took the collection, a function answering
 * whether a field applies to a record, and another naming a record's type —
 * the last two unpacked from the host the collection came with, and each a
 * reading of the collection's own scoping. It was wider than what it reads.
 *
 * It takes the collection and the columns, and answers a scope for a type.
 */

import type { Applicability } from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import type {
  FieldScope,
  ReadFieldScopesConfig,
} from "../../lib/utils/index.js";

describe("the scope reader", () => {
  it("reads the collection and the columns, and answers for a type", () => {
    expectTypeOf<keyof ReadFieldScopesConfig>().toEqualTypeOf<
      "collection" | "fields" | "subject"
    >();
    expectTypeOf<FieldScope["applicability"]>().toEqualTypeOf<
      (type: string | null) => Applicability
    >();
  });
});
