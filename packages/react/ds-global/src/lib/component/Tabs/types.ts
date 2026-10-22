import type { _DistributiveOmit, Item } from "@canonical/ds-types";
import type { ComponentProps, ReactNode } from "react";
import type { LinkComponent } from "../../types/link.js";

/**
 * A tab, as a WD405 navigation `Item`. A tab strip is flat, so only the
 * top-level fields are used: `url` (destination — a tab without one is inert),
 * `label` (visible text), `key` (identity when there is no url), and
 * `disabled`. Nested `items` are ignored (tabs cannot nest).
 */
export type TabItem = _DistributiveOmit<Item, "items"> & {
  /** CSS class name applied to this tab's `<li>`, in addition to the base classes. */
  className?: string;
  /**
   * Noninteractive trailing content displayed beside the label, such as a
   * Badge or static Chip. It remains part of the tab's single link or inert
   * label and must not contain an independent action.
   */
  slot?: ReactNode;
  /**
   * Child tabs when this item is used as `navigationRoot`. Tabs renders only
   * the root's direct children; items nested below those children are ignored.
   */
  items?: TabItem[];
};

type OwnProps = {
  /**
   * The tab strip, as a root navigation `Item`. Its **direct children**
   * (`navigationRoot.items`) are rendered as tabs; the root node itself is a
   * container and is not rendered.
   */
  navigationRoot: TabItem;
  /**
   * Component used to render navigable tabs (those with a `url`). Receives
   * `LinkComponentProps`. Defaults to `"a"`. Pass a router `Link` (e.g.
   * `@canonical/router-react`) to integrate with client-side navigation.
   */
  LinkComponent?: LinkComponent;
  /**
   * Live current location, used to resolve which tab is active. The tab whose
   * `url` matches is marked `aria-current`. Keep it in sync with the consumer's
   * router (e.g. `useRoute().pathname`) so the active tab updates on navigation.
   */
  currentUrl?: string;
  /** Class applied to the `<ul>` tab list. */
  listClassName?: string;
  /**
   * Accessible name for the navigation landmark. Required so assistive tech can
   * distinguish this tab strip from other navigation regions.
   */
  "aria-label": string;
};

/**
 * Props for the Tabs component, extending the native props of its `<nav>` root.
 *
 * @implements ds:global.component.tabs
 */
export type TabsProps = OwnProps & Omit<ComponentProps<"nav">, keyof OwnProps>;
