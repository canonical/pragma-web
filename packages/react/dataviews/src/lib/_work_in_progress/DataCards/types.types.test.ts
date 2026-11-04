import type {
  DataViewsMessages,
  DataViewsProvider,
  DisplayStatus,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactNode } from "react";
import { describe, expectTypeOf, it } from "vitest";
import type { DisplayField } from "../../common/index.js";
import type { DataCardsProps } from "./types.js";

type Props = DataCardsProps<readonly SchemaFieldDefinition[]>;

describe("DataCardsProps", () => {
  it("requires the provider, the fields, the title and the name", () => {
    expectTypeOf<Props["provider"]>().toEqualTypeOf<
      DataViewsProvider<readonly SchemaFieldDefinition[], RowRecord>
    >();
    expectTypeOf<Props["fields"]>().toEqualTypeOf<readonly DisplayField[]>();
    expectTypeOf<Props["title"]>().toEqualTypeOf<string>();
    expectTypeOf<Props["label"]>().toEqualTypeOf<string>();
    expectTypeOf<
      Pick<Props, "provider" | "fields" | "title" | "label">
    >().toEqualTypeOf<
      Required<Pick<Props, "provider" | "fields" | "title" | "label">>
    >();
  });

  it("leaves the selection, the record names, the status and the words optional", () => {
    expectTypeOf<Props["selectable"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Props["rowLabel"]>().toEqualTypeOf<
      ((row: RowRecord, rowId: string) => string) | undefined
    >();
    expectTypeOf<Props["renderStatus"]>().toEqualTypeOf<
      ((status: DisplayStatus) => ReactNode) | undefined
    >();
    expectTypeOf<Props["messages"]>().toEqualTypeOf<
      Partial<DataViewsMessages> | undefined
    >();
  });

  it("extends native section props, less the ones the cards set themselves", () => {
    expectTypeOf<Props>().toHaveProperty("className");
    expectTypeOf<Props>().toHaveProperty("id");
    expectTypeOf<Props>().not.toHaveProperty("children");
    expectTypeOf<Props>().not.toHaveProperty("aria-label");
    expectTypeOf<Props>().not.toHaveProperty("aria-labelledby");
    expectTypeOf<Props>().not.toHaveProperty("aria-busy");
  });
});
