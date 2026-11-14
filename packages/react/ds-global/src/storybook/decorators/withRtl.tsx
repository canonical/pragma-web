import type { ElementType, ReactElement } from "react";

/** Renders the story right to left. */
export default function withRtl() {
  return (Story: ElementType): ReactElement => (
    <div dir="rtl">
      <Story />
    </div>
  );
}
