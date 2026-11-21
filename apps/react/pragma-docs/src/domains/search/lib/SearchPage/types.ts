import type { ComponentProps } from "react";

type OwnProps = {
  /** The search text, as the address holds it. */
  readonly text: string;
};

/**
 * Props accepted by `SearchPage`: its text, then the native props of its
 * `<section>` root. The native `children` are excluded because the page
 * renders its own content.
 */
export type SearchPageProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps | "children">;
