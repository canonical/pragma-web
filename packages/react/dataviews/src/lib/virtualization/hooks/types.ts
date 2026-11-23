/**
 * Hook domain types for the virtualization domain. Each hook declares its
 * result type here.
 */

import type { RowModel } from "@canonical/dataviews-core";
import type { DisplayEntry } from "@canonical/dataviews-core/bindings";
import type { MountedRange } from "@canonical/dataviews-core/virtualization";
import type { FocusEvent, RefObject } from "react";
import type { EntryPlacement } from "../types.js";

/** One virtualized body's range, and the handles its elements attach by. */
export type UseVirtualRowsResult = {
  /** The entries to mount, as runs, and the space of the rest. */
  readonly mounted: MountedRange;
  /** A mounted row awaits its first measurement, or a correction is due. */
  readonly measuring: boolean;
  /** The body row group; its parent is the scroll viewport. */
  readonly body: RefObject<HTMLTableSectionElement | null>;
  /**
   * The ref one entry's row attaches by, to be measured and to keep focus.
   * The same function for as long as the row is mounted.
   */
  readonly readRowRef: (id: string) => EntryPlacement["ref"];
  /** Keeps the row focus enters mounted, wherever the viewport goes. */
  readonly onFocus: (event: FocusEvent<HTMLTableSectionElement>) => void;
  /** Lets it go when focus leaves the body, not when it leaves the window. */
  readonly onBlur: (event: FocusEvent<HTMLTableSectionElement>) => void;
};

/** What one virtualized body takes. */
export type UseVirtualRowsProps = readonly [
  entries: readonly DisplayEntry[],
  estimatedRowHeight: number,
  model: RowModel<object>,
  options?: {
    /** The published tracks, whose change re-wraps every row. */
    readonly tracks?: string | undefined;
  },
];
