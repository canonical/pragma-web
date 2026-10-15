import type {
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactElement } from "react";
import { Announcer } from "../../common/index.js";
import { useAnnouncer, useMessages } from "../../hooks/index.js";
import { ScopedTimeline } from "./common/index.js";
import type { TimelineProps } from "./types.js";
import "./styles.css";

/**
 * A timeline renders the records of one collection as events in time: one
 * event per record on the page, in the order the query puts them. It does not
 * fetch, sort or page; it reads what the table reads — the query's rows, the
 * core's status and the selection — and its controls edit the collection's
 * query, never the page alone.
 *
 * Each record is read through `mapping`, whose `dateTime` must name a `date`
 * field. Every word comes from `messages`, over English, and every outcome is
 * said through the timeline's own announcer.
 *
 * Not exported from the package root: a work-in-progress spike, imported from
 * its own module until it is admitted.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export default function Timeline<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
>({ messages, ...props }: TimelineProps<TFields, TRow>): ReactElement {
  const words = useMessages(messages);
  const { ref, announce } = useAnnouncer();
  return (
    <>
      <ScopedTimeline {...props} messages={words} announce={announce} />
      <Announcer ref={ref} />
    </>
  );
}
