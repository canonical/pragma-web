import type { CSSProperties, ElementType, ReactNode } from "react";

/** Renders the story right-to-left. */
export const rtl = () => (Story: ElementType) => (
  <div dir="rtl">
    <Story />
  </div>
);

/** Paints the story on a `.surface`. */
export const surface = () => (Story: ElementType) => (
  <div
    className="surface"
    style={{
      background: "var(--surface-color-background)",
      color: "var(--surface-color-text, var(--color-text))",
      padding: "var(--dimension-300, 24px)",
    }}
  >
    <Story />
  </div>
);

/** Paints the story on a `.contrasted` surface. */
export const contrasted = () => (Story: ElementType) => (
  <div
    className="contrasted"
    style={{
      background: "var(--surface-color-background)",
      color: "var(--surface-color-text, var(--color-text))",
      padding: "var(--dimension-200, 16px)",
    }}
  >
    <Story />
  </div>
);

/** Wraps the story in a bare `.grid` with auto-fit columns. */
export const grid = () => (Story: ElementType) => (
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

/**
 * Places the story before a `<main>`, such as a skip link.
 * @param id - The id of the main element
 * @param children - Content to be rendered inside the main element
 */
export const beforeMain =
  ({ id = "main", children }: { id?: string; children?: ReactNode }) =>
  (Story: ElementType) => (
    <>
      <Story />
      <main id={id} tabIndex={-1}>
        {children}
      </main>
    </>
  );
