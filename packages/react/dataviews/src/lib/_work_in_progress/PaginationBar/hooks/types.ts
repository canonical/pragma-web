import type {
  DataViewsProvider,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";

/** What the redraw hook takes: the provider whose destinations a render spells. */
export type UseRedrawOnDestinationInputsProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = {
  /** The provider whose open view and location the destinations read. */
  readonly provider: DataViewsProvider<TFields, TRow>;
};

/** What the redraw hook returns: nothing, since it only redraws. */
export type UseRedrawOnDestinationInputsResult = undefined;
