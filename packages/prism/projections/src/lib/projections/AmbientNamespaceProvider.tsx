import type { ReactElement } from "react";
import AmbientNamespaceContext from "./AmbientNamespaceContext.js";
import type { AmbientNamespaceProviderProps } from "./types.js";

/**
 * Declare the page's ambient namespace once, for every identity below it:
 * a reference shows its namespace prefix only when its namespace differs
 * from this one (heuristic 4.3), which every arm reads through
 * `useForeignPrefix`. A site declares it where it knows it: once in its
 * shell when the whole site is one namespace, or in each layout whose
 * pages are. A nearer provider overrides a farther one.
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
    <AmbientNamespaceContext.Provider value={namespace}>
      {children}
    </AmbientNamespaceContext.Provider>
  );
}
