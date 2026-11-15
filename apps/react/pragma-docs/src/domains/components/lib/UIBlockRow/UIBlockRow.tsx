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
import { findFirstParagraph, SUMMARY_COMPONENTS } from "#lib/markdown";
import nodeFragment from "../../../../relay/__generated__/UIBlockRow_node.graphql.js";
import { UI_BLOCK_MARK_ICON } from "../UIBlockChip/constants.js";
import type { UIBlockRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields UIBlockRow reads from the UIBlock it renders: its title and
 * compact address, and its first documentation stage's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment UIBlockRow_node on UIBlock {
    __typename
    summary
    _meta {
      title
      curie
    }
    documentationStages(first: 1) {
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

const componentCssClassName = "ds ui-block-row";

/**
 * A UI block as a 32px list entry: its mark, its prefix (`ds:`) when it
 * is off the page's namespace, and its title, linked to its home when the
 * site has one and inert text when it has none; its first documentation
 * stage at the end as its status (`experimental`). Where an index opts
 * into two lines (`lines="two"`, 56px), the first paragraph of its
 * summary goes under the title. A block with no stage ends in its title.
 *
 * Native props reach the row's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { UIBlockRow } from "#domains/components/lib";`
 *
 * @implements docs.component.ui_block_row
 * @note Impure: reads its block from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function UIBlockRow({
  node,
  className,
  ...props
}: UIBlockRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  // The summary is the row's one second line: a paragraph's line breaks,
  // which the site's Markdown renders as breaks, join into spaces.
  const summary = findFirstParagraph(data.summary ?? "").replaceAll("\n", " ");
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={UI_BLOCK_MARK_ICON} />}
      prefix={prefix}
      status={data.documentationStages.edges.at(0)?.node._meta.title}
      summary={
        summary === "" ? undefined : (
          <Markdown components={SUMMARY_COMPONENTS} source={summary} />
        )
      }
      title={title}
    />
  );
}
