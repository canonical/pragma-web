import type { Decorator } from "@storybook/react-vite";
import type { ReactElement } from "react";

/**
 * Render the story inside the `.app` scope, which the table and its bars
 * assume: primary text there takes the application sizes, and the density
 * channel its application values.
 */
export default function withAppScope(
  Story: Parameters<Decorator>[0],
): ReactElement {
  return (
    <div className="app">
      <Story />
    </div>
  );
}
