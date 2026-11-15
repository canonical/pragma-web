// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityRow,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import { Markdown } from "@canonical/react-markdown";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import { findFirstParagraph, SUMMARY_COMPONENTS } from "#lib/markdown";
import nodeFragment from "../../../../relay/__generated__/CodeStandardRow_node.graphql.js";
import { CODE_STANDARD_MARK_ICON } from "../CodeStandardChip/constants.js";
import type { CodeStandardRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CodeStandardRow reads from the CodeStandard it renders: its title and
 * compact address, its Markdown description, and the title of its first
 * category.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CodeStandardRow_node on CodeStandard {
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

const componentCssClassName = "ds code-standard-row";

/**
 * A code standard as a 32px list entry, or a 56px two-line one where an index
 * opts in: the standard's mark, its prefix when the standard is off the
 * page's namespace, its title, linked to its home when the site has one
 * and inert text when it has none, and its category as its one fact,
 * when it has one. A two-line row puts the first paragraph of the
 * standard's description on its second line.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { CodeStandardRow } from "#domains/standards/lib";`
 *
 * @implements docs.component.code_standard_row
 * @note Impure: reads its standard from the Relay store, its home from the
 *   site's homes, its words from the site's catalog, and its link and the
 *   page's namespace from the projection providers.
 */
export default function CodeStandardRow({
  node,
  className,
  ...props
}: CodeStandardRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const category = data.categories.edges.at(0)?.node._meta.title;
  // The summary is the row's one second line: a paragraph's line breaks,
  // which the site's Markdown renders as breaks, join into spaces.
  const summary = findFirstParagraph(data.description ?? "").replaceAll(
    "\n",
    " ",
  );
  return (
    <EntityRow
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
