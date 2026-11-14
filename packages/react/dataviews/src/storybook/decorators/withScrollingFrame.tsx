import type { Decorator } from "@storybook/react-vite";

/** A frame of the given height that scrolls its content, as a panel would. */
export default function withScrollingFrame(height: string): Decorator {
  return (Story) => (
    <div style={{ maxHeight: height, overflow: "auto" }}>
      <Story />
    </div>
  );
}
