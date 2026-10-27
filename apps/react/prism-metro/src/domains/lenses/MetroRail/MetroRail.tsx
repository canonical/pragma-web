import {
  collectLenses,
  Rail,
  type RailBrand,
  ThemeSelector,
} from "@canonical/prism-core";
import { useRouter } from "@canonical/router-react";
import { type ReactElement, useMemo } from "react";
import { MESSAGES } from "#i18n";
import type { MetroRailProps } from "./types.js";

const METRO_BRAND: RailBrand = {
  label: MESSAGES["site.name"],
  caption: MESSAGES["site.caption"],
  to: "home",
};

/**
 * The metro site's rail: the site brand, linked to the landing, every
 * lens the running router's table declares, in rail order, and the site's
 * utility cluster, which holds the theme control.
 *
 * It reads the table off the router rather than importing the app's routes,
 * because the route table imports the lens layouts that render this rail;
 * importing back would close a cycle. Every prop reaches the rail's `<nav>`
 * root. The cluster uses the class contract `Rail`'s stylesheet styles.
 *
 * `import { MetroRail } from "./MetroRail/index.js";`
 */
export default function MetroRail(props: MetroRailProps): ReactElement {
  const router = useRouter();
  // Keyed on the route table, a stable reference for the router's lifetime,
  // so the walk and the invariants it enforces run once.
  const entries = useMemo(() => collectLenses(router.routes), [router.routes]);
  return (
    <Rail {...props} brand={METRO_BRAND} entries={entries}>
      <p className="utilities-label" id="rail-utilities-label">
        {MESSAGES["rail.utilities"]}
      </p>
      <ul aria-labelledby="rail-utilities-label" className="utilities">
        <li className="theme">
          <ThemeSelector />
        </li>
      </ul>
    </Rail>
  );
}
