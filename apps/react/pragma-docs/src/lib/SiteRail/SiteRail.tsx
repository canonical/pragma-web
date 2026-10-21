import { useRouter } from "@canonical/router-react";
import { type ReactElement, useMemo } from "react";
import { Rail, type RailBrand } from "#lib/Rail";
import { collectLenses } from "#lib/routeLens";

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
 * importing back would close a cycle. Takes no props: it is site chrome, the
 * same on every lens, and `Rail` owns the rendered element.
 *
 * `import { SiteRail } from "#lib/SiteRail";`
 */
export default function SiteRail(): ReactElement {
  const router = useRouter();
  // Keyed on the route table, a stable reference for the router's lifetime,
  // so the walk and the invariants it enforces run once.
  const lenses = useMemo(() => collectLenses(router.routes), [router.routes]);
  return <Rail brand={SITE_BRAND} entries={lenses} />;
}
