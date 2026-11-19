import type { ElementType, ReactElement } from "react";

/** Paints the story on one surface, as it would sit in an app. */
export default function withSurface() {
  return (Story: ElementType): ReactElement => (
    <div
      className="surface"
      style={{
        background: "var(--surface-color-background)",
        color: "var(--surface-color-text)",
        padding: "var(--dimension-300, 24px)",
      }}
    >
      <Story />
    </div>
  );
}
