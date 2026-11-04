import type {
  DataViewsProvider,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import { describe, expectTypeOf, it } from "vitest";
import type { DisplayField } from "../../../../common/index.js";
import type { CardItemProps } from "./types.js";

type Props = CardItemProps<RowRecord>;

describe("CardItemProps", () => {
  it("takes one record's channels, its fields and how to name it, all required", () => {
    expectTypeOf<Props>().toEqualTypeOf<{
      readonly provider: DataViewsProvider<
        readonly SchemaFieldDefinition[],
        RowRecord
      >;
      readonly channels: RowChannels<RowRecord>;
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
