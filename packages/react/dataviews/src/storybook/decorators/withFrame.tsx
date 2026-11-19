import type { Decorator } from "@storybook/react-vite";

/** Render the story inside a frame of the given width, as a layout would. */
export default function withFrame(maxWidth: string): Decorator {
  return (Story) => (
    <div style={{ maxWidth }}>
      <Story />
    </div>
  );
}
