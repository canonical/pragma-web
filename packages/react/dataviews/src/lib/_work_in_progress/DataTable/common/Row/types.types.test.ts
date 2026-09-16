/** A row reads its header from its columns, so it is handed none beside them. */
import { describe, expectTypeOf, it } from "vitest";
import type { Machine } from "../../../../../../testing/machines.js";
import type { RowProps } from "./types.js";

describe("RowProps", () => {
  it("carries no row header beside the columns", () => {
    expectTypeOf<RowProps<Machine>>().not.toHaveProperty("rowHeader");
  });
});
