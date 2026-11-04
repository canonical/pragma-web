import type {
  DataViewsProvider,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { RowChannels } from "@canonical/dataviews-core/bindings";
import { describe, expectTypeOf, it } from "vitest";
import type { DisplayField } from "../../../../common/index.js";
import type { FieldValueProps } from "./types.js";

type Props = FieldValueProps<RowRecord>;

describe("FieldValueProps", () => {
  it("takes the card's channels and the field it shows, all required", () => {
    expectTypeOf<Props>().toEqualTypeOf<{
      readonly provider: DataViewsProvider<
        readonly SchemaFieldDefinition[],
        RowRecord
      >;
      readonly channels: RowChannels<RowRecord>;
      readonly field: DisplayField;
    }>();
  });

  it("forwards no native props", () => {
    expectTypeOf<Props>().not.toHaveProperty("className");
  });
});
