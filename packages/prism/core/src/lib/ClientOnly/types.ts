import type { ReactNode } from "react";

/** Props accepted by `ClientOnly`. */
export interface ClientOnlyProps {
  /** Content rendered only after the component mounts in the browser. */
  readonly children: ReactNode;
  /** Rendered during SSR and the initial hydration pass. Defaults to nothing. */
  readonly fallback?: ReactNode;
}
