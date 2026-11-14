import type { Decorator } from "@storybook/react-vite";
import type { ReactElement } from "react";

/** Render the story in a right-to-left context. */
export default function withRightToLeft(
  Story: Parameters<Decorator>[0],
): ReactElement {
  return (
    <div dir="rtl">
      <Story />
    </div>
  );
}
