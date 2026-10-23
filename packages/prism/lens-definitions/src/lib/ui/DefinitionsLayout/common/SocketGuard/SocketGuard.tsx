import { ErrorBoundary } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { Suspense } from "react";
import type { SocketGuardProps } from "./types.js";

/**
 * Keep a strip tenant that reads the store from taking the layout down: it
 * renders the tenant when the store is warm, and nothing at all otherwise.
 *
 * `useLazyLoadQuery` suspends on a cold store, and the strip's tenants render
 * in the layout, outside any page-level boundary. Unguarded, a cold render (a
 * failed prepare step, a graph that did not answer) suspends the whole layout
 * and takes the rail, the strip and the canvas down with it. So each socket
 * carries its own Suspense and error boundary, both falling back to nothing:
 * an empty socket is the honest rendering of "the graph did not answer", and
 * the strip band stays intact either way.
 *
 * `import { SocketGuard } from "./common/SocketGuard/index.js";`
 */
export default function SocketGuard({
  children,
}: SocketGuardProps): ReactElement {
  return (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>{children}</Suspense>
    </ErrorBoundary>
  );
}
