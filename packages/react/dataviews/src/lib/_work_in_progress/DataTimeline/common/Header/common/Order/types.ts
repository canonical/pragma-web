import type { HeaderOrder } from "../../types.js";

/**
 * Props of the header's order control.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the order in force, not forwarding a caller's native props.
 */
export type OrderProps = {
  readonly order: HeaderOrder;
  readonly hydrated: boolean;
};
