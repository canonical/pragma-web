import type { Decorator } from "@storybook/react-vite";

/** A column flex box of the given height, as a full-height panel would be. */
export default function withFlexColumn(height: string): Decorator {
  return (Story) => (
    <div style={{ display: "flex", flexDirection: "column", height }}>
      <Story />
    </div>
  );
}
