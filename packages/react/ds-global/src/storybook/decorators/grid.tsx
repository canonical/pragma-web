import type { CSSProperties, ElementType, ReactElement } from "react";

/** Wraps the story in the bare `.grid` preset, with auto-fit columns. */
export default function grid() {
  return (Story: ElementType): ReactElement => (
    <div
      className="grid"
      style={
        {
          "--modifier-grid-template": "repeat(auto-fit, minmax(300px, 1fr))",
        } as CSSProperties
      }
    >
      <Story />
    </div>
  );
}
