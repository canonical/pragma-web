import type { ComponentProps } from "react";

type OwnProps = {
  /** The search text, as the address holds it. */
  readonly text: string;
  /** The applied type's class IRI, when one is applied. */
  readonly type?: string;
  /** The cursor the page's results start after, past the first page. */
  readonly after?: string;
  /** The page's number, from 1; the first page when absent. */
  readonly page?: number;
};

/**
 * Props accepted by `SearchPage`: its text and page state, then the native
 * props of its `<section>` root. The native `children` are excluded
 * because the page renders its own content.
 */
export type SearchPageProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps | "children">;
