import type { RefObject } from "react";

/** The props of {@link StopClaim}. */
export type StopClaimProps = {
  /** QueryInput's root, which focus leaves. */
  rootRef: RefObject<HTMLElement | null>;
  /** True while the claim runs, so QueryInput does not report it back. */
  isClaimingRef: RefObject<boolean>;
};
