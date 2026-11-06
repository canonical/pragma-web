import type {
  DataViewsMessages,
  DisplayStatus,
} from "@canonical/dataviews-core";

/**
 * Props of a list's status line.
 *
 * Exempt from the native-prop extension convention: a tutorial example kept
 * to the props it teaches.
 */
export type ListStatusProps = {
  /** The status the core resolved from the provider's state. */
  readonly status: DisplayStatus;
  /** The words the status is said in. */
  readonly messages: DataViewsMessages;
};
