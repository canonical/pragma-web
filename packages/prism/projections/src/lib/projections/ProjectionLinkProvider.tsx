import { type ReactElement, useContext, useMemo } from "react";
import ProjectionsContext from "./Context.js";
import type { ProjectionLinkProviderProps } from "./types.js";

/**
 * Provides the link a node's home renders through, the peek a chip shows
 * and the site's five switches to every projection below it. Mount it
 * above the routed content, beside the site's `HomesProvider`.
 *
 * A provider nested in another takes what it is not given from the one
 * above, so a surface that only renders its homes through another link
 * (the command palette's results) keeps the site's peek and switches.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { ProjectionLinkProvider } from "@canonical/prism-projections";`
 *
 * @note Impure: reads the provider above, if any.
 */
export default function ProjectionLinkProvider({
  LinkComponent,
  peek,
  site,
  children,
}: ProjectionLinkProviderProps): ReactElement {
  const outer = useContext(ProjectionsContext);
  const value = useMemo(
    () => ({
      LinkComponent: LinkComponent ?? outer?.LinkComponent ?? "a",
      peek: peek ?? outer?.peek,
      site: site ?? outer?.site,
    }),
    [LinkComponent, peek, site, outer],
  );
  return <ProjectionsContext value={value}>{children}</ProjectionsContext>;
}
