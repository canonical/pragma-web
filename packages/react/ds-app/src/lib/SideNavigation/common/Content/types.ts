import type { ComponentProps, ComponentType } from "react";
import type { LinkComponentProps, NavRoot } from "../../types.js";
import type { ContextSwitcherProps } from "../ContextSwitcher/types.js";

type OwnProps = {
  /** Root whose direct children render as groups — see NavRoot. */
  root?: NavRoot;
  /** The context switcher, rendered before the `<nav>` landmark. Omitted renders none. */
  contextSwitcher?: ContextSwitcherProps;
  /** Component used to render navigable items. Defaults to `"a"`. */
  LinkComponent?: ComponentType<LinkComponentProps> | "a";
  /** Live current location; resolves and keeps the active item in sync. */
  currentUrl?: string;
  /** The `<nav>` landmark's name. */
  "aria-label"?: string;
};

/** The native attributes go to the region's root `<div>`; `aria-label` to the `<nav>`. */
export type ContentProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps | "children">;
