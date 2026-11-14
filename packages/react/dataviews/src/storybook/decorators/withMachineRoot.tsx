import type { Decorator } from "@storybook/react-vite";
import type { ReactElement, ReactNode } from "react";
import DataViews from "../../lib/_work_in_progress/DataViews/Provider.js";
import type { MachineProviderConfig } from "../machines/index.js";
import useMachineProvider from "../machines/useMachineProvider.js";

/** The root over one story's machine provider, built once. */
const MachineRoot = ({
  config,
  children,
}: {
  readonly config: MachineProviderConfig;
  readonly children: ReactNode;
}): ReactElement => (
  <DataViews provider={useMachineProvider(config)}>{children}</DataViews>
);

/**
 * Render the story inside a DataViews root over a machine provider set up
 * by `config`, read once when the story mounts.
 */
export default function withMachineRoot(
  config: MachineProviderConfig = {},
): Decorator {
  return (Story) => (
    <MachineRoot config={config}>
      <Story />
    </MachineRoot>
  );
}
