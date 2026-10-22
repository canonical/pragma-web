import { DefinitionsLayout } from "@canonical/prism-lens-definitions";
import type { ReactElement } from "react";
import { MetroRail } from "../MetroRail/index.js";
import type { MetroDefinitionsLayoutProps } from "./types.js";

/**
 * The Definitions lens's layout with the metro rail bound to it. It renders
 * no element of its own: `DefinitionsLayout` renders the root, so it takes
 * no native props.
 *
 * `import { MetroDefinitionsLayout } from "./MetroDefinitionsLayout/index.js";`
 */
export default function MetroDefinitionsLayout({
  children,
}: MetroDefinitionsLayoutProps): ReactElement {
  return <DefinitionsLayout rail={<MetroRail />}>{children}</DefinitionsLayout>;
}
