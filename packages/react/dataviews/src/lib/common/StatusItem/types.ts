import type { DisplayStatus } from "@canonical/dataviews-core";
import type { ComponentProps, ReactNode } from "react";

/** A status a renderer shows: named by one of the core's statuses. */
export type StatusItemStatus = {
  readonly status: DisplayStatus["status"];
};

type OwnProps<TStatus extends StatusItemStatus> = {
  /** The status, as the core or the renderer decided it. */
  readonly status: TStatus;
  /** The text or content shown for it. */
  readonly renderStatus: (status: TStatus) => ReactNode;
};

/**
 * Props of a renderer's status. Its root is a `div`, so it extends native
 * div props, less those it owns: `children`, the status shown, and
 * `data-status`, the status it carries.
 */
export type StatusItemProps<TStatus extends StatusItemStatus = DisplayStatus> =
  OwnProps<TStatus> &
    Omit<
      ComponentProps<"div">,
      keyof OwnProps<TStatus> | "children" | "data-status"
    >;
