import {
  collectLenses,
  Rail,
  type RailBrand,
  ThemeSelector,
} from "@canonical/prism-core";
import { Link, useRouter } from "@canonical/router-react";
import { type ReactElement, useMemo } from "react";
import { PlaygroundIcon, SignInIcon } from "./icons.js";
import type { SiteRailProps } from "./types.js";

const SITE_BRAND: RailBrand = {
  label: "Pragma",
  caption: "design system docs",
  to: "home",
};

/**
 * The docs site's rail: the site brand, every lens the running router's
 * table declares, in rail order, and the site's utility cluster — the
 * playground, the demo sign-in and the theme control, kept out of the lens
 * switcher.
 *
 * It reads the table off the router rather than importing the app's routes,
 * because the route table imports the lens layouts that render this rail;
 * importing back would close a cycle. The brand, the lenses and the cluster
 * are the site's own; every other prop reaches the rail's `<nav>` root. The
 * cluster uses the class contract `Rail`'s stylesheet styles.
 *
 * `import { SiteRail } from "#lib/SiteRail";`
 */
export default function SiteRail(props: SiteRailProps): ReactElement {
  const router = useRouter();
  // Keyed on the route table, a stable reference for the router's lifetime,
  // so the walk and the invariants it enforces run once.
  const lenses = useMemo(() => collectLenses(router.routes), [router.routes]);
  return (
    <Rail {...props} brand={SITE_BRAND} entries={lenses}>
      <p className="utilities-label" id="rail-utilities-label">
        Utilities
      </p>
      <ul aria-labelledby="rail-utilities-label" className="utilities">
        <li>
          {/* The SSR-certified demo canvas keeps a door. */}
          <Link className="item" title="Playground" to="playground">
            <span aria-hidden="true" className="icon">
              <PlaygroundIcon />
            </span>
            <span className="label">Playground</span>
          </Link>
        </li>
        <li>
          <Link
            className="item"
            search={{ auth: "1" }}
            title="Demo sign-in"
            to="account"
          >
            <span aria-hidden="true" className="icon">
              <SignInIcon />
            </span>
            <span className="label">Demo sign-in</span>
          </Link>
        </li>
        <li className="theme">
          {/* Chrome preference — cookie-backed via usePreferredTheme. */}
          <ThemeSelector />
        </li>
      </ul>
    </Rail>
  );
}
