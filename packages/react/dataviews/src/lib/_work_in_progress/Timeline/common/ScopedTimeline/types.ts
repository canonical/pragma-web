import type {
  DataViewsMessages,
  RowRecord,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import type { ReactNode } from "react";
import type { AnnouncerTopic } from "../../../../common/index.js";
import type { TimelineProps } from "../../types.js";

/**
 * Props of the scoped timeline: the timeline's own, with the words resolved
 * and the announcer of the UI scope it speaks through.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type ScopedTimelineProps<
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object = RowRecord,
> = Omit<TimelineProps<TFields, TRow>, "messages"> & {
  /** Every message the timeline renders and announces, resolved. */
  readonly messages: DataViewsMessages;
  /** Say an outcome through the announcer of the timeline's UI scope. */
  readonly announce: (message: ReactNode, topic?: AnnouncerTopic) => void;
};
