import type { ComponentProps } from "react";
import type { StandardArticle_standard$key } from "../../__generated__/StandardArticle_standard.graphql.js";
import type { StandardProse_body$key } from "../../__generated__/StandardProse_body.graphql.js";

type OwnProps = {
  /** Fragment ref of the standard this article reads out. */
  readonly standard: StandardArticle_standard$key;
  /** Fragment ref of the standard's prose, or null when it has none. */
  readonly body: StandardProse_body$key | null;
};

/** Props accepted by `StandardArticle`: the standard and its prose, and the
 * native props of its root `<article>`. */
export type StandardArticleProps = OwnProps &
  Omit<ComponentProps<"article">, keyof OwnProps>;
