/* @canonical/generator-ds 0.9.0-experimental.12 */
import type { ComponentProps } from "react";

type OwnProps = {
  /** Formatted count of additions to show. */
  added?: string;
  /** Formatted count of deletions to show. */
  deleted?: string;
  /** Formatted count of modified lines to show. */
  modified?: string;
};

export type DetailedChangeMarkerProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
