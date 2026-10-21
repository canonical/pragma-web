import type { ReactElement } from "react";

/**
 * The docs site's colophon, the footer every lens layout renders.
 *
 * Takes no props: it is site chrome, the same on every lens.
 *
 * `import { SiteColophon } from "#lib/SiteColophon";`
 */
export default function SiteColophon(): ReactElement {
  return (
    <p>Pragma — the design system, documented from its knowledge graph.</p>
  );
}
