import type { ReactElement } from "react";
import RenderersContext from "./Context.js";
import useProviderState from "./hooks/useProviderState.js";
import type { RenderersProviderProps } from "./types.js";

/**
 * Provides the site's renderers, and the provider extensions it serves, to
 * every `useRenderers` below it. Mount it above the routed content, inside
 * the router.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { RenderersProvider } from "@canonical/prism-core";`
 */
export default function RenderersProvider({
  defaults,
  extensions,
  children,
}: RenderersProviderProps): ReactElement {
  const value = useProviderState({ defaults, extensions });
  return <RenderersContext value={value}>{children}</RenderersContext>;
}
