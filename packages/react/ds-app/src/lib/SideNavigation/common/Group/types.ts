import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** Group header text, rendered via GroupHeader. Omitted when absent. */
  label?: ReactNode;
  /**
   * Whether the group starts with a divider. The anatomy draws one before
   * every group except the first; the parent laying the groups out decides.
   */
  divider?: boolean;
  /** The group's navigation entries (Item / ItemExpandable / consumer-supplied). */
  children?: ReactNode;
};

export type GroupProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps>;
