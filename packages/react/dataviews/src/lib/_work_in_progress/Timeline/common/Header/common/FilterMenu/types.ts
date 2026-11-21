import type { HeaderFilter } from "../../types.js";

/**
 * Props of one header filter's menu.
 *
 * Exempt from the native-prop extension convention: an internal part drawn
 * from the filter it offers, not forwarding a caller's native props.
 */
export type FilterMenuProps = {
  readonly filter: HeaderFilter;
  /** Whether scripts have taken over: a menu, rather than a disclosure of links. */
  readonly hydrated: boolean;
};
