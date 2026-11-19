import type { _DistributiveOmit, Item } from "@canonical/ds-types";
import type { ComponentProps, ReactNode } from "react";
import type { LinkComponent } from "../../types/link.js";

/**
 * A tab, as a WD405 navigation `Item`. A tab strip is flat, so only the
 * top-level fields are used: `url` (destination — a tab without one is inert),
 * `label` (visible text), `key` (identity when there is no url),
 * `disabled`, and `slot` (trailing content after the label). Only the root's direct `items` are rendered (tabs cannot nest).
 */
export type TabItem = _DistributiveOmit<Item, "items"> & {
  /** CSS class name applied to this tab's `<li>`, in addition to the base classes. */
  className?: string;
  /**
   * Trailing content (end slot) rendered after the `label`, inside the tab's
   * link or inert text: a count badge, a loading spinner, etc. `label` stays
   * the plain-text name of the tab. The slot is part of the link, so it adds to
   * the tab's accessible name; mark purely decorative content `aria-hidden`.
   */
  slot?: ReactNode;
  /** Child tabs. Only the navigation root's direct children are rendered. */
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
