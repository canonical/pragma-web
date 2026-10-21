import { useRouter } from "@canonical/router-react";
import { type ReactElement, useMemo } from "react";
import { Rail, type RailBrand } from "#lib/Rail";
import { collectLenses } from "#lib/routeLens";
import type { SiteRailProps } from "./types.js";

const SITE_BRAND: RailBrand = {
  label: "Pragma",
  caption: "design system docs",
  to: "home",
};

/**
 * The docs site's rail: the site brand, and every lens the running router's
 * table declares, in rail order.
 *
 * It reads the table off the router rather than importing the app's routes,
 * because the route table imports the lens layouts that render this rail;
 * importing back would close a cycle. The brand and the lenses are the
 * site's own; every other prop reaches the rail's `<nav>` root.
 *
 * `import { SiteRail } from "#lib/SiteRail";`
 */
export default function SiteRail(props: SiteRailProps): ReactElement {
  const router = useRouter();
  // Keyed on the route table, a stable reference for the router's lifetime,
  // so the walk and the invariants it enforces run once.
  const lenses = useMemo(() => collectLenses(router.routes), [router.routes]);
  return <Rail {...props} brand={SITE_BRAND} entries={lenses} />;
}
