import type { EntityBinding } from "@canonical/prism-core";

/** Props accepted by `Trail`. It renders the core breadcrumb trail, which
 * takes no native props from it. */
export interface TrailProps {
  /** The binding whose index route the first crumb links to. */
  readonly binding: EntityBinding;
  /** The lens's name, the first crumb's text. */
  readonly label: string;
}
