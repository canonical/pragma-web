import type { ReactElement } from "react";
import BarMachines from "./BarMachines.js";
import type { BarConfig, BarStoryArgs } from "./types.js";

/** Render a story's machines as configured. Story-only. */
export default function renderBarWith(
  config: BarConfig = {},
): (args: BarStoryArgs) => ReactElement {
  return (args) => <BarMachines {...args} {...config} />;
}
