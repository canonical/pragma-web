import type { ReactNode } from "react";

/** Props accepted by `ErrorBoundary`. */
export interface ErrorBoundaryProps {
  /** Subtree whose render errors this boundary catches. */
  readonly children: ReactNode;
  /** Rendered in place of `children` after an error. */
  readonly fallback: ReactNode;
  /**
   * Identity of what the subtree is showing. When it changes, a boundary that
   * has already caught goes back to rendering `children`.
   *
   * Needed because a param-only navigation does NOT remount the page: the
   * router keys its outlet by route NAME, so `/components/a` → `/components/b`
   * reuses the same component instance, and with it this boundary's state. One
   * failed query would otherwise leave every later entity on the fallback until
   * a full page reload. Pass the thing the subtree is about — the entity's URI,
   * the term — not a counter.
   */
  readonly resetKey?: unknown;
}
