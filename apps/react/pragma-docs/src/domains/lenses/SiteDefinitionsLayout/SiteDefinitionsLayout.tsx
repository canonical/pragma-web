import { DefinitionsLayout } from "@canonical/prism-lens-definitions";
import type { ReactElement } from "react";
import { SiteColophon } from "#lib/SiteColophon";
import { SiteRail } from "#lib/SiteRail";
import type { SiteDefinitionsLayoutProps } from "./types.js";

/**
 * The Definitions lens's layout with the site's rail and colophon bound to
 * it. It renders no element of its own: `DefinitionsLayout` renders the
 * root, so it takes no native props.
 *
 * `import { SiteDefinitionsLayout } from "./SiteDefinitionsLayout/index.js";`
 */
export default function SiteDefinitionsLayout({
  children,
}: SiteDefinitionsLayoutProps): ReactElement {
  return (
    <DefinitionsLayout colophon={<SiteColophon />} rail={<SiteRail />}>
      {children}
    </DefinitionsLayout>
  );
}
