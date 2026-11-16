// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCard,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import { Markdown } from "@canonical/react-markdown";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import { findFirstParagraph, SUMMARY_COMPONENTS } from "#lib/markdown";
import nodeFragment from "../../../../relay/__generated__/CodeStandardCard_node.graphql.js";
import { CODE_STANDARD_MARK_ICON } from "../CodeStandardChip/constants.js";
import type { CodeStandardCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CodeStandardCard reads from the CodeStandard it renders: its
 * title and compact address, its Markdown description, and the title of
 * its first category.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CodeStandardCard_node on CodeStandard {
    __typename
    description
    _meta {
      title
      curie
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

const componentCssClassName = "ds code-standard-card";

/**
 * A code standard as a card in a grid of entities: the standard's mark, its
 * prefix when the standard is off the page's namespace, its title, linked
 * to its home when the site has one and inert text when it has none, the
 * first paragraph of its Markdown description, rendered inline so its
 * emphasis, code and links read as they do in the standard's
 * documentation, and its category as its one fact, when it has one. A
 * description with no paragraph is no summary. A standard has no
 * depiction, so its card draws no specimen.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { CodeStandardCard } from "#domains/standards/lib";`
 *
 * @implements docs.component.code_standard_card
 * @note Impure: reads its standard from the Relay store, its home from the
 *   site's homes, its words from the site's catalog, and its link and the
 *   page's namespace from the projection providers.
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
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const category = data.categories.edges.at(0)?.node._meta.title;
  const summary = findFirstParagraph(data.description ?? "");
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={
        category === undefined
          ? undefined
          : [
              {
                property: "category",
                label: t("standard.category"),
                value: category,
              },
            ]
      }
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={CODE_STANDARD_MARK_ICON} />}
      prefix={prefix}
      summary={
        summary === "" ? undefined : (
          <Markdown components={SUMMARY_COMPONENTS} source={summary} />
        )
      }
      title={title}
    />
  );
}
