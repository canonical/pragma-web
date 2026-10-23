// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCard,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import {
  defaultComponents,
  Markdown,
  type MarkdownComponents,
} from "@canonical/react-markdown";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "../../../../relay/__generated__/CodeStandardCard_node.graphql.js";
import findFirstParagraph from "./findFirstParagraph.js";
import type { CodeStandardCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CodeStandardCard reads from the CodeStandard it renders: its
 * title, compact address, class and Markdown description, and its first
 * category's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CodeStandardCard_node on CodeStandard {
    __typename
    description
    _meta {
      title
      curie
      type {
        _meta {
          title
        }
      }
    }
    categories(first: 1) {
      edges {
        node {
          _meta {
            title
          }
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * The elements the summary renders through: the default ones, with a
 * paragraph as a span, since the card's summary is a paragraph already.
 */
const SUMMARY_COMPONENTS: MarkdownComponents = {
  ...defaultComponents,
  p: "span",
};

const componentCssClassName = "ds code-standard-card";

/**
 * A code standard as a card in a grid of entities: its namespace prefix
 * above the title, the title linked to its home when the site has one and
 * inert text when it has none, then its class; the first paragraph of its
 * Markdown description as the summary, rendered inline so its emphasis
 * and code read as they do in the standard; and its first category as its
 * one key value (`Category: React`). The category already says what a
 * footer would, so the card has none. A standard with no description has
 * no summary, and one with no category no key value. A standard has no
 * sidecar.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { CodeStandardCard } from "#domains/standards/lib";`
 *
 * @implements docs.component.code_standard_card
 * @note Impure: reads its standard from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words
 *   from the translator in scope.
 */
export default function CodeStandardCard({
  node,
  className,
  ...props
}: CodeStandardCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const summary = findFirstParagraph(data.description ?? "");
  const category = data.categories.edges.at(0)?.node._meta.title;
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      keyValues={
        category === undefined
          ? []
          : [{ key: t("standard.category"), value: category }]
      }
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      location={findCuriePrefix(curie)}
      summary={
        summary === "" ? undefined : (
          <Markdown components={SUMMARY_COMPONENTS} source={summary} />
        )
      }
      title={title}
    />
  );
}
