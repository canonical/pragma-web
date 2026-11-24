import type { ReactNode } from "react";

/**
 * Props accepted by `Outlet`.
 *
 * Exempt from the native-prop extension convention: `Outlet` renders a
 * `Suspense` around whatever route content matches, so it has no root tag
 * whose native props these could extend.
 */
export interface OutletProps {
  /** Content shown while suspended route output is pending. */
  readonly fallback?: ReactNode;
}
