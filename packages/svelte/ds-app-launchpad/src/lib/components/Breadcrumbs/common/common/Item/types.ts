import type { BreadcrumbsSegment } from "../../../types.js";

export type ItemProps = BreadcrumbsSegment & {
  /** Indicates whether this segment represents the current page */
  current?: boolean;
};
