import type React from "react";
import { useCallback, useEffect, useId, useState } from "react";
import { Content, Footer, Header } from "./common/index.js";
import { DEFAULT_MESSAGES } from "./constants.js";
import { useCollapseShortcut } from "./hooks/useCollapseShortcut/index.js";
import type { SideNavigationProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds side-navigation";

/**
 * SideNavigation — full-height application navigation rendered from a WD405
 * Item tree. Owns its expand/collapse (rail) state — uncontrolled, seeded by
 * `defaultExpanded` — and wires the header's collapse toggle to the content
 * region it controls.
 *
 * Three regions: Header (branding, collapse toggle), Content (the
 * optional ContextSwitcher, then the main `<nav>` landmark) and Footer
 * (user profile, settings and non-navigational actions). The context
 * switcher is a `role="menu"` select-like widget — not navigation — so it
 * sits before the landmark, not inside it, and hides with Content when
 * collapsed. The root element is a plain `<div>` and the component's
 * single *navigation* landmark is Content's `<nav>`, so screen readers
 * announce exactly one navigation region; the regions themselves are
 * `<header>`/`<footer>` elements, which additionally expose
 * banner/contentinfo landmarks. The footer always renders, empty without
 * `footerRoot`. `aria-label` is forwarded to the `<nav>` and defaults to
 * `"Main navigation"`.
 *
 * A visually hidden "Skip to main content" link is the first element in the
 * component's DOM order, so keyboard users can bypass the navigation block;
 * target it with `skipTo` (default `"#main-content"`).
 *
 * Routing-agnostic: navigable items render via `LinkComponent` (default `"a"`);
 * pass a router `Link` to integrate client-side navigation. The active item is
 * resolved from `currentUrl`.
 *
 * Consumption pattern: data-driven only. Pass props and all three regions
 * build; row-level and region components are private
 * (`cs:react.component.subcomponent_export_api` — no dot-static exports),
 * and render exclusively from data.
 *
 * @implements ds:apps.component.side_navigation
 */
const SideNavigation = ({
  className,
  brand,
  applicationName,
  root,
  contextSwitcher,
  footerRoot,
  LinkComponent = "a",
  currentUrl,
  skipTo = "#main-content",
  defaultExpanded: defaultExpandedProp,
  keyboardShortcut = true,
  "aria-label": ariaLabel,
  messages: messagesProp,
  ...props
}: SideNavigationProps): React.ReactElement => {
  const contentId = useId();
  const messages = { ...DEFAULT_MESSAGES, ...messagesProp };

  const [expanded, setExpanded] = useState(defaultExpandedProp ?? true);

  // Mobile seed: below the small breakpoint, the
  // expanded state renders as a fullscreen fixed overlay — a takeover, not a
  // rail — so with `defaultExpanded` left unset (desktop default `true`), a
  // small viewport collapses the rail after mount instead. An explicit
  // `defaultExpanded` always wins, on every viewport. Post-mount on purpose:
  // the server cannot know the viewport, so SSR/hydration stay pure — the
  // cost is one frame of the expanded rail on a phone before the flip.
  useEffect(() => {
    if (defaultExpandedProp !== undefined) return;
    if (window.matchMedia("(width < 620px)").matches) setExpanded(false);
  }, [defaultExpandedProp]);

  const handleToggle = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  // Ctrl+B rail-collapse shortcut — on unless
  // `keyboardShortcut` opts out. See hooks/useCollapseShortcut.
  useCollapseShortcut({ condition: keyboardShortcut, onTrigger: handleToggle });

  return (
    <div
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-expanded={expanded}
      {...props}
    >
      {/* Skip navigation, first in DOM order — visually hidden until focused,
          then jumps keyboard users past the navigation block. */}
      <a className="skip-link" href={skipTo}>
        {messages.skipToContent()}
      </a>
      <Header
        brand={brand}
        applicationName={applicationName}
        expanded={expanded}
        onToggle={handleToggle}
        collapseControls={contentId}
        collapseToggleMessages={messages}
      />
      <Content
        id={contentId}
        root={root}
        contextSwitcher={contextSwitcher}
        LinkComponent={LinkComponent}
        currentUrl={currentUrl}
        aria-label={ariaLabel ?? messages.navigation()}
      />
      <Footer
        root={footerRoot}
        LinkComponent={LinkComponent}
        currentUrl={currentUrl}
      />
    </div>
  );
};

export default SideNavigation;
