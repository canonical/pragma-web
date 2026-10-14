import type { ReadonlyChannel, Selection } from "@canonical/dataviews-core";

/**
 * Props of the checkbox selecting every event on the page.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the selection and the page's identities, not forwarding a caller's
 * native props.
 */
export type SelectAllOnPageProps = {
  readonly selection: Selection;
  /** The page's identities, as a channel, so the events never re-render for a selection. */
  readonly ids: ReadonlyChannel<readonly string[]>;
};
