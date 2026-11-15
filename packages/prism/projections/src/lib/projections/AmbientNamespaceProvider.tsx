import type { ReactElement } from "react";
import AmbientNamespaceContext from "./AmbientNamespaceContext.js";
import type { AmbientNamespaceProviderProps } from "./types.js";

/**
 * Declare the page's ambient namespace once, for every identity below it:
 * a reference shows its namespace prefix only when its namespace differs
 * from this one (heuristic 4.3), which every arm reads through
 * `useForeignPrefix`. A site declares its home namespace once in its
 * shell, and a layout whose pages are of another namespace declares that
 * one. A layout whose pages list the nodes of several namespaces declares
 * none, `null`, so every prefix shows on them. A nearer provider overrides
 * a farther one; where no nearer one is given, the farther one holds.
 *
 * `import { AmbientNamespaceProvider } from "@canonical/prism-projections";`
 *
 * @example
 * <AmbientNamespaceProvider namespace="ds">{page}</AmbientNamespaceProvider>
 */
export default function AmbientNamespaceProvider({
  namespace,
  children,
}: AmbientNamespaceProviderProps): ReactElement {
  return (
    <AmbientNamespaceContext.Provider value={namespace ?? undefined}>
      {children}
    </AmbientNamespaceContext.Provider>
  );
}
