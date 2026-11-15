import type { Decorator } from "@storybook/react-vite";
import type { ReactElement, ReactNode } from "react";
import DataViews from "../../lib/_work_in_progress/DataViews/Provider.js";
import type { MachineProviderConfig } from "../machines/index.js";
import useMachineProvider from "../machines/useMachineProvider.js";
import pickStoryWords from "../pickStoryWords.js";
import type { StoryWords } from "../types.js";

/** The root over one story's machine provider, built once. */
const MachineRoot = ({
  config,
  words,
  children,
}: {
  readonly config: MachineProviderConfig;
  readonly words: StoryWords;
  readonly children: ReactNode;
}): ReactElement => (
  <DataViews provider={useMachineProvider(config)} {...words}>
    {children}
  </DataViews>
);

/**
 * Render the story inside a DataViews root over a machine provider set up
 * by `config`, read once when the story mounts, speaking the story's
 * `messages` arg when set.
 */
export default function withMachineRoot(
  config: MachineProviderConfig = {},
): Decorator {
  return (Story, { args }) => (
    <MachineRoot config={config} words={pickStoryWords(args)}>
      <Story />
    </MachineRoot>
  );
}
