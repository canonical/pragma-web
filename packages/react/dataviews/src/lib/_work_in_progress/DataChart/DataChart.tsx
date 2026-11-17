import type {
  DisplayStatus,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import {
  areDisplayStatusesEqual,
  isDataViewsProvider,
  resolveDisplayStatus,
} from "@canonical/dataviews-core/bindings";
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
} from "react";
import { MessagesContext, StatusItem } from "../../common/index.js";
import {
  useAnsweredFacets,
  useDataViewsValue,
  useMessages,
  useStableValue,
} from "../../hooks/index.js";
import { describeStatus, isSameFacet } from "../../utils/index.js";
import { BarDrawing, RangeDrawing } from "./common/index.js";
import type { DataChartProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-chart";

/**
 * A prototype chart of one field, counted or measured by the source over
 * every record matching the query, never over the rows on screen.
 *
 * Of type "bar", it draws each value the field holds as a bar as long as the
 * number of records holding it. A count the source gives as a lower bound
 * says "at least"; one it did not count draws no bar.
 *
 * Of type "range", it draws a number field's lowest and highest values as a
 * band on a labelled axis. The axis reaches the field's declared bounds where
 * the schema gives them, and round numbers past the range otherwise.
 *
 * Either drawing is an image named for what it shows, and the numbers are in
 * the native table that follows it, so nothing is carried by the drawing
 * alone. While no result answers the query, the core's status is shown in
 * place of the drawing, never one made for another query. The server draws
 * it from the facets of the page it renders, so it needs no script.
 *
 * Not exported from the package root: a work-in-progress prototype, imported
 * from its own module to find out what a chart needs.
 *
 * @experimental Pre-release: a work-in-progress prototype, not admitted to
 * the package root; its shape may change or it may be withdrawn.
 */
export default function DataChart<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({
  provider,
  type,
  field,
  label,
  renderStatus,
  messages,
  className,
  ...rest
}: DataChartProps<TFields, TRow>): ReactElement {
  if (!isDataViewsProvider(provider)) {
    throw new Error(
      "DataChart requires a provider created by createDataViewsProvider",
    );
  }
  // The declared number field a range is drawn against; a bar chart reads
  // no declaration, since the source's values are what it draws.
  const declared = provider.collection.schema.fields.find(
    (definition) => definition.field === field,
  );
  const bounds = declared?.kind === "number" ? declared : undefined;
  if (type === "range" && bounds === undefined) {
    throw new Error(
      `DataChart of type "range" draws a number field, and "${field}" is not one`,
    );
  }
  if (!provider.capabilities.facets.includes(field)) {
    throw new Error(
      `DataChart names "${field}", which the source does not facet`,
    );
  }
  const words = useMessages(messages);
  useEffect(() => provider.observe(), [provider]);
  const answered = useAnsweredFacets({ provider });
  const state = useDataViewsValue(provider.state);
  const status = useStableValue(
    resolveDisplayStatus(state),
    areDisplayStatusesEqual,
  );
  const captionId = useId();
  // Held at one reference while it claims the same, so a result that moved
  // another field's facet redraws nothing here: the source mints a fresh
  // facet for every request, and the provider keeps the whole record only
  // while every field's facet is unchanged.
  const facet = useStableValue(
    answered === null ? null : answered[field],
    isSameFacet,
  );
  if (type === "bar" && facet?.kind === "range") {
    throw new Error(
      `DataChart of type "bar" draws values, and "${field}" is a range`,
    );
  }
  if (type === "range" && facet?.kind === "values") {
    throw new Error(
      `DataChart of type "range" draws a range, and "${field}" holds values`,
    );
  }
  // The words' own text for a status, unless the caller renders its own.
  const describe = useCallback(
    (shown: DisplayStatus) => describeStatus(shown, words),
    [words],
  );
  const showStatus = renderStatus ?? describe;
  // Three states, read apart: null while no result answers the query, when
  // the figure says only that it is busy; undefined where a result answered
  // without this field's facet, which is said rather than thrown, since the
  // answer carries it and no mounting check could have caught it; and a
  // facet of its own, which may list no value, or have no ends, at all.
  let drawing: ReactNode = null;
  if (facet === undefined) {
    drawing = (
      <p>{type === "bar" ? words.facetCountsAbsent : words.facetRangeAbsent}</p>
    );
  } else if (facet?.kind === "values") {
    drawing =
      facet.values.length === 0 ? (
        <p>{words.facetValuesNone}</p>
      ) : (
        <BarDrawing label={label} values={facet.values} />
      );
  } else if (facet?.kind === "range") {
    // Ends that are numbers and finite: a range of NaN or of infinities has
    // no length to scale against, so it says what a range of nothing says
    // rather than drawing an axis no coordinate lands on.
    drawing =
      Number.isFinite(facet.min) && Number.isFinite(facet.max) ? (
        <RangeDrawing
          label={label}
          min={facet.min as number}
          max={facet.max as number}
          lowerBound={bounds?.min}
          upperBound={bounds?.max}
        />
      ) : (
        <p>{words.facetValuesNone}</p>
      );
  }
  return (
    <MessagesContext value={words}>
      <figure
        {...rest}
        className={[componentCssClassName, className].filter(Boolean).join(" ")}
        aria-labelledby={captionId}
        aria-busy={state.pendingRequestId !== null}
      >
        <figcaption id={captionId}>{label}</figcaption>
        {status === null ? null : (
          <StatusItem status={status} renderStatus={showStatus} />
        )}
        {drawing}
      </figure>
    </MessagesContext>
  );
}
