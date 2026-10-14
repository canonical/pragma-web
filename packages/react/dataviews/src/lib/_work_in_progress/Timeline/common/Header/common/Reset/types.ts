import type { HeaderReset } from "../../types.js";

/**
 * Props of the header's reset control.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the reset it offers, not forwarding a caller's native props.
 */
export type ResetProps = {
  readonly reset: HeaderReset;
  readonly hydrated: boolean;
};
