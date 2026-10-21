import { type ReactElement, useMemo } from "react";
import ProjectionsContext from "./Context.js";
import type { ProjectionsProviderProps } from "./types.js";

/**
 * Provides the site's projection maps — which arm renders each type of node
 * in each representation — and the link a node's home renders through to
 * every representation below it. Mount it above the routed content, beside
 * the site's `HomesProvider`.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { ProjectionsProvider } from "@canonical/prism-projections";`
 */
export default function ProjectionsProvider({
  maps,
  LinkComponent = "a",
  children,
}: ProjectionsProviderProps): ReactElement {
  const value = useMemo(() => ({ maps, LinkComponent }), [maps, LinkComponent]);
  return <ProjectionsContext value={value}>{children}</ProjectionsContext>;
}
