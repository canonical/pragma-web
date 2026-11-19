import type { DataViewsMessages } from "@canonical/dataviews-core";

/** The arg every story takes beside its part's: the words its roots speak. */
export type StoryWords = {
  /** Messages over the English record; none by default. */
  readonly messages?: Partial<DataViewsMessages>;
};
