import type { ReadonlyChannel, Selection } from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import type { SelectAllOnPageProps } from "./types.js";

describe("SelectAllOnPageProps", () => {
  it("takes the selection and the displayed identities as a channel", () => {
    expectTypeOf<SelectAllOnPageProps>().toEqualTypeOf<{
      readonly selection: Selection;
      readonly ids: ReadonlyChannel<readonly string[]>;
    }>();
  });

  it("forwards no native props", () => {
    expectTypeOf<SelectAllOnPageProps>().not.toHaveProperty("className");
  });
});
