import type { DisplayStatus } from "@canonical/dataviews-core";
import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** The status, as the core decided it. */
  readonly status: DisplayStatus;
  /** The text or content shown for it. */
  readonly renderStatus: (status: DisplayStatus) => ReactNode;
};

/**
 * Props of a renderer's status. Its root is a `div`, so it extends native
 * div props, less those it owns: `children`, the status shown, and
 * `data-status`, the status it carries.
 */
export type StatusItemProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children" | "data-status">;
