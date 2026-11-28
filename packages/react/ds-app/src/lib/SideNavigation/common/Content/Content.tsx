import type React from "react";
import { ContextSwitcher } from "../ContextSwitcher/index.js";
import { NavTree } from "../NavTree/index.js";
import type { ContentProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds side-navigation-content";

/**
 * SideNavigation.Content — the scrolling region between Header and Footer.
 * It holds the optional context switcher and, after it, the component's
 * only `<nav>` landmark. The switcher is a `role="menu"` widget, not
 * navigation, so it sits outside the landmark. Navigation rows are links
 * and expandable items exclusively (actions are Footer's job). Data-only —
 * rows render exclusively from the `root` tree (row components are
 * private; there is no children escape hatch into the landmark).
 * `aria-label` names the `<nav>`; with no `root`, the landmark renders
 * empty (the landmark contract stays stable).
 *
 * @implements ds:apps.subcomponent.side_navigation-content
 */
const Content = ({
  className,
  root,
  contextSwitcher,
  LinkComponent = "a",
  currentUrl,
  "aria-label": ariaLabel,
  ...props
}: ContentProps): React.ReactElement => {
  return (
    <div
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      {...props}
    >
      {contextSwitcher ? <ContextSwitcher {...contextSwitcher} /> : null}
      <nav aria-label={ariaLabel}>
        {root ? (
          <NavTree
            root={root}
            currentUrl={currentUrl}
            LinkComponent={LinkComponent}
          />
        ) : null}
      </nav>
    </div>
  );
};

export default Content;
