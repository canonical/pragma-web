import type { ReactNode } from "react";

/** Props accepted by `SocketGuard`. */
export interface SocketGuardProps {
  /** The strip tenant that reads the store. */
  readonly children: ReactNode;
}
