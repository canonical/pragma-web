import type { DataViewsProvider } from "@canonical/dataviews-core";
import type { DataViewsQueryBarProps } from "../../lib/pattern/DataViews/common/controls/QueryBar/types.js";
import type { BarMachine, barMachineCollection } from "../machines/index.js";
import type { StoryWords } from "../types.js";

/** A query bar story's args: the part's props, and the words its root speaks. */
export type BarStoryArgs = DataViewsQueryBarProps & StoryWords;

/** The machines' provider, as an application builds one. */
export type BarProvider = DataViewsProvider<
  typeof barMachineCollection.schema.fields,
  BarMachine
>;

/** How one story's machines start. */
export type BarConfig = {
  /** The query the provider starts on, as canonical text. */
  readonly query?: string;
  /** A width that makes the chips overflow. */
  readonly inlineSize?: string;
  /** Renders a button that changes the status from outside the bar. */
  readonly withOutsideChange?: boolean;
  /** Keeps the query in the frame's address, so Back and Forward move it. */
  readonly withHistory?: boolean;
  /** A location at this address, which spells addresses for links. */
  readonly href?: string;
  /** Rows selected as the story starts, with the action bar over them. */
  readonly selected?: readonly string[];
  /** Puts each machine in one of twelve pools, a field to search in a panel. */
  readonly withPools?: boolean;
};

/** Props of the bar's server markup: at an address, or in memory. */
export type ServerRenderedBarProps = BarStoryArgs & {
  /** The address the markup is rendered at; in memory without one. */
  readonly href?: string;
  /** The width the markup stands at. */
  readonly inlineSize?: string;
};
