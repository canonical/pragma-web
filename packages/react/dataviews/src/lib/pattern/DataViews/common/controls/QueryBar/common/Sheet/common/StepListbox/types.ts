import type { ComponentProps } from "react";
import type { QueryInputOption } from "../../../../../../../../../component/QueryInput/index.js";

/** StepListbox's own props. */
type OwnProps = {
  /** The step's name, which names the listbox: "Choose a field". */
  readonly label: string;
  /** The step's options, as the bar's suggestions are read. */
  readonly options: readonly QueryInputOption[];
  /** The ids of the options chosen. */
  readonly selected: ReadonlySet<string>;
  /** What the step says while it has no option to offer. */
  readonly emptyText: string;
  /** Whether several options are chosen at once, each toggled. */
  readonly multiple?: boolean;
  /**
   * Called with an option a reader chooses: Enter, Space or a click on
   * one that can be chosen. With several, it toggles the option.
   */
  readonly onChoose: (option: QueryInputOption) => void;
};

/**
 * Props of one step of "Add filter" as a listbox. The rest reach its
 * `div`, apart from `children`, which it renders itself, `role` and the
 * name and selection attributes it sets.
 */
export type StepListboxProps = OwnProps &
  Omit<
    ComponentProps<"div">,
    | keyof OwnProps
    | "children"
    | "role"
    | "aria-label"
    | "aria-labelledby"
    | "aria-multiselectable"
  >;
