import { type ReactElement, useMemo } from "react";
import ProjectionsContext from "./Context.js";
import type { ProjectionsProviderProps } from "./types.js";

/**
 * Provides the site's projection maps — which arm renders each type of node
 * in each representation — the link a node's home renders through and the
 * peek a chip shows, to every representation below it. Mount it above the routed content, beside
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
  peek,
  children,
}: ProjectionsProviderProps): ReactElement {
  const value = useMemo(
    () => ({ maps, LinkComponent, peek }),
    [maps, LinkComponent, peek],
  );
  return <ProjectionsContext value={value}>{children}</ProjectionsContext>;
}
