import type { ComponentProps } from "react";

type OwnProps = {
  /** The group's accessible name. Defaults to the messages' `savedViews`. */
  readonly label?: string;
};

/**
 * Props of the connected saved-views control. The root is a `div` grouping
 * the collection's saved-view controls, so it extends native div props.
 * `children` and `role` are the control's own; `aria-busy` would hide its
 * statuses; `aria-label` and `aria-labelledby` would override the name from
 * `label`.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DataViewsSavedViewsProps = OwnProps &
  Omit<
    ComponentProps<"div">,
    | keyof OwnProps
    | "children"
    | "role"
    | "aria-busy"
    | "aria-label"
    | "aria-labelledby"
  >;
