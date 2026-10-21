import type { ReactElement } from "react";
import ProjectionsContext from "./Context.js";
import type { ProjectionsProviderProps } from "./types.js";

/**
 * Provides the site's projection maps — which arm renders each type of node
 * in each representation — to every representation below it. Mount it above
 * the routed content, beside the site's `HomesProvider`.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { ProjectionsProvider } from "@canonical/prism-projections";`
 */
export default function ProjectionsProvider({
  maps,
  children,
}: ProjectionsProviderProps): ReactElement {
  return <ProjectionsContext value={maps}>{children}</ProjectionsContext>;
}
