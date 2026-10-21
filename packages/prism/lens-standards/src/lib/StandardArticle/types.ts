import type { ComponentProps } from "react";
import type { StandardArticle_standard$key } from "../../__generated__/StandardArticle_standard.graphql.js";

type OwnProps = {
  /** Fragment ref of the standard this article reads out. */
  readonly standard: StandardArticle_standard$key;
};

/** Props accepted by `StandardArticle`: the standard, and the native props of
 * its root `<article>`. */
export type StandardArticleProps = OwnProps &
  Omit<ComponentProps<"article">, keyof OwnProps>;
