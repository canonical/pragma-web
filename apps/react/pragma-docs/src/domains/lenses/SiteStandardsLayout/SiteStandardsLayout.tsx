import { StandardsLayout } from "@canonical/prism-lens-standards";
import type { ReactElement } from "react";
import { SiteRail } from "#lib/SiteRail";
import { SiteColophon } from "#lib/ui/SiteColophon";
import type { SiteStandardsLayoutProps } from "./types.js";

/**
 * The Standards lens's layout with the site's rail and colophon bound to
 * it. It renders no element of its own: `StandardsLayout` renders the root,
 * so it takes no native props.
 *
 * `import { SiteStandardsLayout } from "./SiteStandardsLayout/index.js";`
 */
export default function SiteStandardsLayout({
  children,
}: SiteStandardsLayoutProps): ReactElement {
  return (
    <StandardsLayout colophon={<SiteColophon />} rail={<SiteRail />}>
      {children}
    </StandardsLayout>
  );
}
