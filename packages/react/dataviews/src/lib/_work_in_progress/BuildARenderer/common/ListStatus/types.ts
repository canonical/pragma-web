import type {
  DataViewsMessages,
  DisplayStatus,
} from "@canonical/dataviews-core";
import type { ComponentProps } from "react";

type OwnProps = {
  /** The status the core resolved from the provider's state. */
  readonly status: DisplayStatus;
  /** The words the status is said in. */
  readonly messages: DataViewsMessages;
};

/**
 * Props of a list's status line: its own, and the native props of the `p`
 * it renders as its root, less the role and contents it derives.
 */
export type ListStatusProps = OwnProps &
  Omit<ComponentProps<"p">, keyof OwnProps | "children" | "role">;
