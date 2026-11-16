import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import { RendererSwitch } from "../../common/index.js";
import { useMessages } from "../../hooks/index.js";
import { DataChart } from "../DataChart/index.js";
import { DataTable } from "../DataTable/index.js";
import type { DataChartWithTableProps } from "./types.js";

const componentCssClassName = "ds data-chart-with-table";

/**
 * A chart and the table of its records, behind one switch: the chart shown
 * first, the table a press away. Both read one provider, so choosing asks
 * the source for nothing, and a selection made in the table holds when the
 * chart is shown and the table comes back.
 *
 * The switch is the renderer switch's segmented choice, after the drawing at
 * the inline end: a "Chart" and a "Table" button, the chosen one pressed, in
 * a group named by `label` or the words' own `renderer`. Each is a region
 * named for it, and the chart keeps its caption and its own numbers table as
 * its text alternative. The choice is held while it is mounted, and written
 * to neither the URL nor a saved view. Without scripting the chart, the
 * default, is drawn alone in its named region, with no choice to make.
 *
 * @experimental Pre-release: a work-in-progress prototype, internal to the
 * package and not exported; its shape may change or it may be withdrawn.
 *
 * @implements ds:apps.pattern.data_chart_with_table
 */
export default function DataChartWithTable<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
  chartProps,
  tableProps,
  label,
  messages,
  className,
  ...rest
}: DataChartWithTableProps<TFields, TRow>): ReactElement {
  // Resolved once here and handed down whole, so the chart, the table and
  // the switch speak one set of words.
  const words = useMessages(messages);
  return (
    <RendererSwitch
      {...rest}
      label={label ?? words.renderer}
      messages={words}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      renderers={[
        {
          id: "chart",
          label: words.chartRenderer,
          content: (
            <DataChart {...chartProps} provider={provider} messages={words} />
          ),
        },
        {
          id: "table",
          label: words.tableRenderer,
          content: (
            <DataTable {...tableProps} provider={provider} messages={words} />
          ),
        },
      ]}
    />
  );
}
