import type {
  DataViewsMessages,
  DataViewsProvider,
  DisplayStatus,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ComponentProps, ReactNode } from "react";

/**
 * What a chart draws: "bar", each value a field holds, as a bar as long as
 * its count; "range", the lowest and highest values of a number field, as a
 * band on an axis.
 *
 * @experimental Pre-release: a work-in-progress prototype, not admitted to
 * the package root; its shape may change or it may be withdrawn.
 */
export type DataChartType = "bar" | "range";

type OwnProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
> = {
  /** The provider whose source counts or measures the field. */
  readonly provider: DataViewsProvider<TFields, TRow>;
  /**
   * What the chart draws, and so what it needs of the field. "bar" needs a
   * field the source facets as values — a `choices` or presence field.
   * "range" needs a number field the source facets as a range; its axis
   * reaches the schema's declared bounds where the schema gives them.
   * Required, so a field is never drawn as bars by accident.
   */
  readonly type: DataChartType;
  /** The field the chart draws, one the provider asks the source to facet. */
  readonly field: string;
  /** The chart's caption and the stem of its accessible name. */
  readonly label: string;
  /**
   * Replaces the default text of a status shown in place of the drawing while
   * no result answers the query. The status is the core's, as the table's is.
   */
  readonly renderStatus?: (status: DisplayStatus) => ReactNode;
  /**
   * The words the chart renders, over English. A standalone chart is its own
   * root and takes them here; the connected chart takes its root's.
   */
  readonly messages?: Partial<DataViewsMessages>;
};

/**
 * DataChart props. The root is a `figure` captioned by `label`, so it
 * extends native figure props, less `children`, since what it holds is drawn
 * from the facet, and `aria-labelledby`, which the caption sets.
 *
 * @experimental Pre-release: a work-in-progress prototype, not admitted to
 * the package root; its shape may change or it may be withdrawn.
 */
export type DataChartProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = OwnProps<TFields, TRow> &
  Omit<
    ComponentProps<"figure">,
    | keyof OwnProps<TFields, TRow>
    | "children"
    | "aria-busy"
    | "aria-label"
    | "aria-labelledby"
  >;
