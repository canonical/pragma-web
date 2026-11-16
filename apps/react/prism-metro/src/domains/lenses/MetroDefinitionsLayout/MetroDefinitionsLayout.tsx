import { DefinitionsLayout } from "@canonical/prism-lens-definitions";
import { AmbientNamespaceProvider } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { MetroRail } from "../MetroRail/index.js";
import type { MetroDefinitionsLayoutProps } from "./types.js";

/**
 * The Definitions lens's layout with the metro rail bound to it. It renders
 * no element of its own: `DefinitionsLayout` renders the root, so it takes
 * no native props.
 *
 * Its pages list the terms of several namespaces, so it declares none
 * over the site's: every identity on them shows its prefix.
 *
 * `import { MetroDefinitionsLayout } from "./MetroDefinitionsLayout/index.js";`
 */
export default function MetroDefinitionsLayout({
  children,
}: MetroDefinitionsLayoutProps): ReactElement {
  return (
    <AmbientNamespaceProvider namespace={null}>
      <DefinitionsLayout rail={<MetroRail />}>{children}</DefinitionsLayout>
    </AmbientNamespaceProvider>
  );
}
