import type { ReactElement } from "react";
import { ScopedDataTimeline } from "../../../DataTimeline/index.js";
import { useDataViewsRoot } from "../../hooks/index.js";
import type { DataViewsDataTimelineProps } from "./types.js";

/**
 * The collection's records as a timeline, bound to the enclosing root's
 * provider, words and announcer, so a timeline and a table in one root share
 * one query, one set of rows and one selection. Throws outside a root.
 *
 * Not exported from the package root, nor placed on `DataViews`: a
 * work-in-progress spike, imported from its own module until it is admitted.
 *
 * @experimental Pre-release: a work-in-progress spike, not admitted to the
 * package root; its shape may change or it may be withdrawn.
 */
export default function DataTimeline(
  props: DataViewsDataTimelineProps,
): ReactElement {
  const { provider, messages, announce } = useDataViewsRoot("DataTimeline");
  return (
    <ScopedDataTimeline
      {...props}
      provider={provider}
      messages={messages}
      announce={announce}
    />
  );
}
