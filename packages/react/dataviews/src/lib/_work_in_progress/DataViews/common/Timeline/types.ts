import type { SchemaFieldDefinition } from "@canonical/dataviews-core";
import type { TimelineProps } from "../../../Timeline/index.js";

/**
 * Props of the connected timeline: the timeline's own, less the provider and
 * the words, which come from the enclosing root.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export type DataViewsTimelineProps = Omit<
  TimelineProps<readonly SchemaFieldDefinition[]>,
  "provider" | "messages"
>;
