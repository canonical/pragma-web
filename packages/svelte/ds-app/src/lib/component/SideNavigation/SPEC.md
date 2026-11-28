# SideNavigation — Svelte port

A port of `@canonical/react-ds-app` SideNavigation. Markup, classes, ARIA,
IDs and behaviour match React, except where the design-system anatomy says
otherwise (see [Differences from React](#differences-from-react)). The
stylesheets are React's, unchanged apart from their header comment and one
rule the anatomy needs.

## Anatomy

The anatomy comes from the knowledge graph (`pragma block_lookup
SideNavigation*`). It names five blocks:

| Block | URI | Implemented by |
|-------|-----|----------------|
| SideNavigation | `apps.component.side_navigation` | `SideNavigation.svelte` |
| SideNavigation.Content | `apps.subcomponent.side_navigation-content` | `common/Content` |
| SideNavigation.ContextSwitcher | `apps.subcomponent.side_navigation-context_switcher` | `common/ContextSwitcher` |
| SideNavigation.ItemGroup | `apps.subcomponent.side_navigation-item_group` | `common/Group` |
| SideNavigation.Item | `apps.subcomponent.side_navigation-item` | `common/Item`, `common/ItemExpandable`, `common/ItemButton` |

Header, Footer, GroupHeader and CollapseToggle are referenced by the
anatomy but have no anatomy of their own; they follow React.

```
div.ds.side-navigation[data-expanded]        root (also the primary pane)
├── a.skip-link                               first in DOM order
├── header.ds.side-navigation-header          brand, application name, collapse toggle
├── div.ds.side-navigation-content[id]        scrolls; hidden when collapsed
│   ├── div.ds.side-navigation-context-switcher   optional, outside the landmark
│   └── nav[aria-label]                       the only navigation landmark
│       └── div.ds.nav-tree
│           └── section.ds.side-navigation-group  repeatable
│               ├── hr.divider                every group but the first
│               ├── span.ds.side-navigation-group-header   optional
│               └── ul.list > li rows         Item / ItemExpandable
└── footer.ds.side-navigation-footer          always rendered; rows optional
```

## Properties

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `root` | `NavRoot` | — | Its direct children (groups) render as the item list. |
| `contextSwitcher` | `ContextSwitcherProps` | — | Rendered at the top of the content region, before the `<nav>`. |
| `brand` | `Snippet` | — | Logo/wordmark in the Header. |
| `applicationName` | `string \| Snippet` | — | Shown beside the brand. |
| `footerRoot` | `FooterRoot` | — | The footer's rows: leaves and depth-1 expandables. |
| `link` | `Snippet<[LinkAttributes, Snippet]>` | plain `<a>` | Renders navigable rows. Spread the attributes onto your anchor and render the content inside it. |
| `currentUrl` | `string` | — | Resolves the active item (`aria-current="page"`) and opens its branch. |
| `defaultExpanded` | `boolean` | `true` | Initial rail state. Unset, a viewport under 620px starts collapsed after mount. |
| `keyboardShortcut` | `boolean` | `true` | Binds Ctrl+B to the collapse toggle. |
| `skipTo` | `string` | `"#main-content"` | Skip-link target. |
| `aria-label` | `string` | `messages.navigation()` | The `<nav>` landmark's name. |
| `messages` | `Partial<SideNavigationMessages>` | English | `skipToContent`, `navigation`, `collapseNavigation`, `expandNavigation`, `collapse`, `expand`, `openMenu`, `closeMenu`. |

Other `<div>` attributes pass through to the root.

Content rows (`LeafNavItem`, `ExpandableNavItem`) and footer rows
(`LeafFooterItem`, `ExpandableFooterItem`) have React's fields, with Svelte
names: `class` for `className`, `onclick` for `onClick`, and a `Snippet`
for `slot`. A footer leaf renders as a link when it has a `url` (and
`control` is not `"button"`), as a button when `control` is `"button"` or it
has an `onclick` and no `url`, and as a plain label otherwise.

`ContextSwitcherProps`: `title` (`string | Snippet`), `currentContext`,
`contexts`, `oncontextchange`, `oncreatecontext`, `createContextLabel`
(`string | Snippet`), `open` (bindable), `onopenchange`, `maxWidth`. A
`ContextSwitcherItem` has `key`, `name`, `description` (required), and
optional `url` and `badge` (`Snippet`).

## State and keyboard

- The rail is uncontrolled: `defaultExpanded` seeds it and the collapse
  toggle or Ctrl+B flips it. The root's `data-expanded` drives all collapsed
  styling.
- Collapsed, the content region is hidden and the footer shows icons only;
  a footer expandable opens as a popover beside the rail.
- Expandable rows are native `<details>`: they open and close without
  JavaScript. A branch holding the current location opens, and re-opens
  when navigation moves into it.
- The context switcher's list opens with a click or ArrowDown; ArrowUp,
  ArrowDown, Home and End move between rows; Enter, Space or a click
  selects; Escape closes it and returns focus to the trigger; Tab or a click
  outside closes it.

## Without JavaScript

Links, the skip link and the `<details>` disclosures work in server-rendered
markup. The collapse toggle, the Ctrl+B shortcut, the context switcher and
the small-viewport collapsed start need JavaScript.

## Differences from React

1. **The context switcher is inside Content.** The anatomy puts it in
   SideNavigation.Content, before the Nav. Content is now a `<div>` region
   (it keeps the `ds side-navigation-content` class, the scrolling and the
   collapse toggle's `aria-controls` id) holding the switcher and then the
   `<nav>`. The switcher stays outside the landmark, and now scrolls with the
   navigation. One rule is added to Content's stylesheet so the `<nav>` lays
   out its groups as the region did.
2. **Groups after the first start with a divider** (`hr.divider`), per
   SideNavigation.ItemGroup. The anatomy gives it no styles, so it has none.
3. **The footer always renders**, per the anatomy's footer cardinality of 1.
   Without `footerRoot` it is an empty `<footer>`.
4. **A context needs a `description`**, which the anatomy marks required.
5. **The collapse toggle has no tooltip.** It keeps the Tooltip's wrapper
   markup, and a hidden element gives the button the tooltip's text as its
   description.
6. **The context switcher uses a stand-in menu** with ContextualMenu's
   markup and the keyboard basics above, without viewport fitment, the
   portal, type-ahead or hover highlighting. Its `preferredDirections`,
   `distance`, `gutter` and `autoFit` props are not ported.
7. **Icons** render React's Icon markup through a private component that
   carries the Icon stylesheet.

## Gaps

- Tooltips: the collapse toggle's 1s "Collapse"/"Expand" tooltip.
- ContextualMenu: viewport fitment, the portal, type-ahead, hover highlight.
- Shared with React: footer labels as tooltips on the collapsed rail, the
  collapsed-rail notification indicator for footer badges, the secondary
  navigation pane, and drill-down navigation on small screens.
