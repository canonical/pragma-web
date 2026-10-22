import type { FooterRoot, NavRoot } from "@canonical/react-ds-app";

export interface UseDashboardNavigationProps {
  /** Target of the Help › Legal information item. */
  readonly legalUrl: string;
}

export interface UseDashboardNavigationResult {
  /** The side navigation's tree, labelled in the active locale. */
  readonly root: NavRoot;
  /** The side navigation's footer rows, labelled in the active locale. */
  readonly footerRoot: FooterRoot;
}
