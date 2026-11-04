import type {
  DataViewsProvider,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type {
  DisplayEntry,
  RowChannels,
} from "@canonical/dataviews-core/bindings";
import { describe, expectTypeOf, it } from "vitest";
import type { DisplayField } from "../../../../common/index.js";
import type { CardListProps } from "./types.js";

type Props = CardListProps<RowRecord>;

describe("CardListProps", () => {
  it("takes the record entries and what each card needs, all required", () => {
    expectTypeOf<Props>().toEqualTypeOf<{
      readonly provider: DataViewsProvider<
        readonly SchemaFieldDefinition[],
        RowRecord
      >;
      readonly records: readonly Extract<
        DisplayEntry,
        { readonly kind: "record" }
      >[];
      readonly readRow: (rowId: string) => RowChannels<RowRecord>;
      readonly title: DisplayField;
      readonly details: readonly DisplayField[];
      readonly selectable: boolean;
      readonly nameRecord: (row: RowRecord, rowId: string) => string | null;
    }>();
  });

  it("forwards no native props", () => {
    expectTypeOf<Props>().not.toHaveProperty("className");
  });
});
