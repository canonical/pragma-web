import type { ComponentProps, ReactNode } from "react";

type OwnProps = {
  /** The group's accessible name. Defaults to the messages' `actionBar`. */
  readonly label?: string;
  /**
   * The selection indicator: the count of selected rows by default. A
   * caller's own indicator — a menu opening the selection, say — replaces it;
   * `null` shows none.
   */
  readonly indicator?: ReactNode;
  /**
   * The actions that apply to the selection. Each reads the selection when it
   * is activated, through `useDataViews`, so the bar takes no second copy of
   * it.
   */
  readonly children?: ReactNode;
};

/**
 * Props of the connected action bar. The root is a `fieldset` grouping the
 * selection's commands, so it extends native fieldset props. `role` is
 * excluded, since the group role is the fieldset's own, and so are
 * `aria-label` and `aria-labelledby`, which would override the name it takes
 * from `label`.
 * `ref` is merged with the bar's own, which it holds to hand the focus back
 * when it leaves.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataViewsActionBarProps = OwnProps &
  Omit<
    ComponentProps<"fieldset">,
    keyof OwnProps | "role" | "aria-label" | "aria-labelledby"
  >;
