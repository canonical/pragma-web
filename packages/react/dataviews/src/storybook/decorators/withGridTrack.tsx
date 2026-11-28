import type { Decorator } from "@storybook/react-vite";

/**
 * A one-track grid of the given width, and of the given height when one is
 * named, as a page layout's column would be.
 */
export default function withGridTrack(
  width: string,
  height?: string,
): Decorator {
  return (Story) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", width, height }}>
      <Story />
    </div>
  );
}
