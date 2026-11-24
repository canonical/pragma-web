import type { ComponentProps, ReactNode } from "react";

/** FilterOptionsGrid's own props. */
type OwnProps = {
  /** The filters, one FilterOptions each, a line apiece. */
  children: ReactNode;
};

/**
 * FilterOptionsGrid's props. The root is a `<div>` and takes its native
 * props.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type FilterOptionsGridProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
