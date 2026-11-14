import type { WithDropdownRenderProps } from "../../../../common/withDropdownButtonStandIn/index.js";

/** The panel's props: what the dropdown hands its render function. */
export type PanelProps = Pick<
  WithDropdownRenderProps,
  "ref" | "id" | "triggerId"
>;
