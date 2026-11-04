import type { SchemaFieldDefinition } from "@canonical/dataviews-core";
import { describe, expectTypeOf, it } from "vitest";
import type { DataCardsProps } from "../../../DataCards/index.js";
import type { DataViewsDataCardsProps } from "./types.js";

describe("DataViewsDataCardsProps", () => {
  it("takes the cards' own props over the widest records", () => {
    expectTypeOf<DataViewsDataCardsProps>().toEqualTypeOf<
      Omit<
        DataCardsProps<readonly SchemaFieldDefinition[]>,
        "provider" | "messages"
      >
    >();
    expectTypeOf<DataViewsDataCardsProps["title"]>().toEqualTypeOf<string>();
  });

  it("takes no provider and no words, which come from the root", () => {
    expectTypeOf<DataViewsDataCardsProps>().not.toHaveProperty("provider");
    expectTypeOf<DataViewsDataCardsProps>().not.toHaveProperty("messages");
  });
});
