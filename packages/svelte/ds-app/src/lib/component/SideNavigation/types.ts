// Ported from @canonical/react-ds-app SideNavigation

import type { IconName } from "@canonical/ds-assets";
import type { Snippet } from "svelte";
import type {
  ClassValue,
  HTMLAnchorAttributes,
  SvelteHTMLElements,
} from "svelte/elements";
import type { CollapseToggleMessages } from "./common/CollapseToggle/types.js";
import type { ContextSwitcherProps } from "./common/ContextSwitcher/types.js";

/**
 * The attributes SideNavigation puts on a navigable row's link. Spread them
 * onto the anchor your `link` snippet renders.
 */
export interface LinkAttributes extends HTMLAnchorAttributes {
  /** Always `"row"`: the row's styling hook. */
  class: string;
  /** The item's `url`, or `undefined` when the item is disabled. */
  href?: string;
  /** `"page"` on the row for the current location. */
  "aria-current"?: "page";
}

/**
 * Renders a navigable row's link: spread `attributes` onto an anchor and
 * render `content` inside it. A plain `<a>` is the default, and SvelteKit
 * already routes plain anchors on the client, so most applications never
 * pass one.
 */
export type LinkSnippet = Snippet<
  [attributes: LinkAttributes, content: Snippet]
>;

/**
 * A single navigable, non-expandable row — the leaf of the content tree.
 * Renders as a link (via `link`) when `url` is set, otherwise a plain
 * non-navigable label. The content tree carries links and labels only —
 * interactive rows are Footer-only, so a leaf has no `onclick`.
 */
export interface LeafNavItem {
  /** Unique identifier when no `url` is present (e.g. a non-navigable label). */
  key?: string;
  /** Navigation target. Renders as a link; omitted renders a plain label. */
  url?: string;
  /** Display text. Text only, matching the base WD405 `Item` contract. */
  label?: string;
  /** Whether the item is interactive. A disabled item's `url` is not rendered as a link. */
  disabled?: boolean;
  /** Leading icon (start slot), by ds-assets icon name. */
  icon?: IconName;
  /** Trailing content (end slot): a badge, count, etc. */
  slot?: Snippet;
  /** CSS class applied to this item's row, in addition to the base classes. */
  class?: ClassValue;
}

/**
 * A collapsible row that discloses its own children instead of navigating.
 * Cannot have a `url` and depth is exactly one level — children are always
 * `LeafNavItem` and cannot themselves expand. No `slot` either: the end slot
 * is always the disclosure caret.
 */
export type ExpandableNavItem = Omit<LeafNavItem, "url" | "slot"> & {
  /** Children revealed on expand. Always leaves — see the depth-1 note above. */
  items: LeafNavItem[];
};

/**
 * A single content-tree entry: either a plain/navigable row or one that
 * discloses further (leaf-only) children.
 */
export type NavItem = LeafNavItem | ExpandableNavItem;

/**
 * A named collection of `NavItem` entries with an optional header — the
 * shape of `root`'s direct children.
 */
export interface NavGroup {
  /**
   * Required identity: the navigation tree indexes every node by `key` or
   * `url`, and a group never has a `url`.
   */
  key: string;
  /** Group header text. Omitted when absent. */
  label?: string;
  /** The group's navigation entries. */
  items?: NavItem[];
}

/**
 * The root passed to `root`: itself never rendered, only its `NavGroup`
 * children are. (The footer's data shape is `FooterRoot` — a flat
 * `FooterItem` list, no groups.)
 */
export interface NavRoot {
  /** Required — see `NavGroup.key`: every tree node needs an identity. */
  key: string;
  items?: NavGroup[];
}

/**
 * A single footer-tree leaf row. The Footer is the one place a navigation
 * row may render as a button: `control` picks between the link (default
 * when `url` is set) and the `"button"` action row. Items are free-form —
 * the component supplies no closed vocabulary or defaults.
 */
export interface LeafFooterItem {
  /** Display text. Required — the component supplies no default labels. */
  label: string;
  /** Leading icon (start slot), by ds-assets icon name. */
  icon?: IconName;
  /** Navigable footer items render as a link when this is set. */
  url?: string;
  /** Selects the rendered row: `"link"` (default when `url` is set) or `"button"` (an action row). */
  control?: "link" | "button";
  /** `control: "button"` (the default without a `url`) — called when activated. */
  onclick?: () => void;
  /** Trailing content (e.g. an unread-count badge). */
  slot?: Snippet;
}

/**
 * A collapsible footer row that discloses its own (always-leaf) children —
 * the footer's flavour of `ExpandableNavItem`: no `url`/`control`/`onclick`
 * and no `slot` (the end slot is the caret). Depth is one level.
 */
export type ExpandableFooterItem = Omit<
  LeafFooterItem,
  "url" | "control" | "onclick" | "slot"
> & {
  /** Children revealed on expand — always `LeafFooterItem` leaves. */
  items: LeafFooterItem[];
};

/**
 * A single footer-tree entry: a leaf row (link or action) or one that
 * discloses further (leaf-only) children.
 */
export type FooterItem = LeafFooterItem | ExpandableFooterItem;

/** The footer's data root. Its direct `items` render as the footer's rows. */
export interface FooterRoot {
  key: string;
  items?: FooterItem[];
}

/**
 * Internal: the one item shape the navigation tree helpers
 * (`@canonical/ds-utils`) work over — the union of every field any tier can
 * carry, with the WD405 key-or-url identity. Not part of the public API.
 */
type _AnyNavNodeFields = {
  label?: string;
  disabled?: boolean;
  icon?: IconName;
  slot?: Snippet;
  class?: ClassValue;
  items?: _AnyNavNode[];
};

export type _AnyNavNode = _AnyNavNodeFields &
  ({ key: string; url?: undefined } | { key?: string; url: string });

/**
 * SideNavigation's built-in text, one function per string, so an application
 * can supply translations. Each defaults to its English text.
 */
export interface SideNavigationMessages extends CollapseToggleMessages {
  /** The visually hidden link that skips past the navigation. */
  skipToContent: () => string;
  /** The navigation landmark's name when no `aria-label` is given. */
  navigation: () => string;
}

type OwnProps = {
  /** Brand content (logo/wordmark) rendered in the header. */
  brand?: Snippet;
  /** Optional application name shown beside the brand in the header. */
  applicationName?: string | Snippet;
  /**
   * Skip-link target: the `href` the visually hidden "Skip to main content"
   * link points at. Defaults to `"#main-content"`. The link always renders.
   */
  skipTo?: string;
  /** Main navigation, as a root. Its direct children (groups) are rendered. */
  root?: NavRoot;
  /**
   * The footer's only data surface: free-form leaves (`LeafFooterItem`) and
   * depth-1 expandables (`ExpandableFooterItem`), rendered as the footer's
   * rows in the order given. The footer region always renders; omitted, it
   * holds no rows.
   */
  footerRoot?: FooterRoot;
  /**
   * Renders navigable items (those with a `url`). Defaults to a plain `<a>`;
   * pass a snippet to add router attributes or swap the element.
   */
  link?: LinkSnippet;
  /**
   * Live current location, used to resolve which item is active (marked
   * `aria-current`, ancestors expanded). Keep it in sync with the router so
   * the active state updates on navigation.
   */
  currentUrl?: string;
  /** Initial expanded (rail) state. Defaults to `true`. */
  defaultExpanded?: boolean;
  /** Binds the Ctrl+B rail-collapse shortcut. Defaults to `true`. */
  keyboardShortcut?: boolean;
  /**
   * The context switcher's props. It renders at the top of the content
   * region, before the `<nav>` landmark — a `role="menu"` select-like widget
   * is not navigation. Omitted renders no switcher.
   */
  contextSwitcher?: ContextSwitcherProps;
  /**
   * The navigation's built-in text, for translation: the skip link, the
   * landmark's default name and the collapse toggle's labels. Any message
   * left out keeps its English default.
   */
  messages?: Partial<SideNavigationMessages>;
  /** The `<nav>` landmark's name. Defaults to `messages.navigation()`. */
  "aria-label"?: string;
};

/**
 * SideNavigation's root is a plain `<div>` layout container — Header, the
 * content region (the optional context switcher, then the `<nav>`
 * landmark), and Footer. `aria-label` is forwarded to the `<nav>`. The other
 * native `<div>` attributes pass through to the root.
 */
export type SideNavigationProps = OwnProps &
  Omit<SvelteHTMLElements["div"], keyof OwnProps | "children">;
