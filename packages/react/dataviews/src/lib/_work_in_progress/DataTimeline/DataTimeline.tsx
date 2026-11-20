import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import { Announcer } from "../../common/index.js";
import { useAnnouncer, useMessages } from "../../hooks/index.js";
import { ScopedDataTimeline } from "./common/index.js";
import type { DataTimelineProps } from "./types.js";
import "./styles.css";

/**
 * DataTimeline renders the records of one collection as events in time: one
 * event per record on the page, in the order the query puts them. It does not
 * fetch or sort; it reads what the table reads — the query's rows, the core's
 * status, the pagination and the selection — and its controls edit the
 * collection's query, never the page alone. Once the page shows whole, its
 * show more grows the provider's window past the page.
 *
 * Each record is read through `mapping`, whose `dateTime` must name a `date`
 * field. Every word comes from `messages`, over English, and every outcome is
 * said through the timeline's own announcer.
 *
 * Not exported from the package root: a work-in-progress spike, imported from
 * its own module until it is admitted.
 *
 * @implements ds:global.pattern.timeline
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export default function DataTimeline<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({ messages, ...props }: DataTimelineProps<TFields, TRow>): ReactElement {
  const words = useMessages(messages);
  const { ref, announce } = useAnnouncer();
  return (
    <>
      <ScopedDataTimeline {...props} messages={words} announce={announce} />
      <Announcer ref={ref} />
    </>
  );
}
