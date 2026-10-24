// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCard, useProjectionLink } from "@canonical/prism-projections";
import { Markdown } from "@canonical/react-markdown";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import { findFirstParagraph, SUMMARY_COMPONENTS } from "#lib/markdown";
import nodeFragment from "../../../../relay/__generated__/UIBlockCard_node.graphql.js";
import { BLOCK_EXAMPLES, UIBlockExample } from "../UIBlockExample/index.js";
import type { UIBlockCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields UIBlockCard reads from the UIBlock it renders: its title,
 * compact address, class, version and summary, its tier's title, and the
 * titles of the first block it inherits from and of its first
 * documentation stage.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment UIBlockCard_node on UIBlock {
    __typename
    version
    summary
    _meta {
      title
      curie
      type {
        _meta {
          title
        }
      }
    }
    tier {
      _meta {
        title
      }
    }
    inheritsFroms(first: 1) {
      edges {
        node {
          _meta {
            title
          }
        }
      }
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

const componentCssClassName = "ds ui-block-card";

/**
 * A UI block as a card in a grid of entities: its tier above the title,
 * the title linked to its home when the site has one and inert text when
 * it has none, after it the first block it inherits from (`IconButton ∈
 * Button`), then its class and the first paragraph of its Markdown
 * summary, rendered inline so its emphasis and code read as they do in
 * the block's documentation; the footer holds its version
 * (`v2.1`), when it has one, then its first documentation stage. A block
 * the published package renders has that component beside the body, in
 * the card's sidecar, server-rendered; any other block has no sidecar,
 * and its card lays out as any card without one. An empty summary is no
 * summary.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { UIBlockCard } from "#domains/components/lib";`
 *
 * @implements docs.component.ui_block_card
 * @note Impure: reads its block from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words
 *   from the translator in scope.
 */
export default function UIBlockCard({
  node,
  className,
  ...props
}: UIBlockCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const stage = data.documentationStages.edges.at(0)?.node._meta.title;
  const vitals = [
    data.version ? t("block.version", { version: data.version }) : undefined,
    stage,
  ].filter((vital): vital is string => vital !== undefined);
  const example = BLOCK_EXAMPLES.get(curie);
  const summary = findFirstParagraph(data.summary ?? "");
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      location={data.tier?._meta.title}
      parent={data.inheritsFroms.edges.at(0)?.node._meta.title}
      sidecar={
        example === undefined ? undefined : <UIBlockExample example={example} />
      }
      summary={
        summary === "" ? undefined : (
          <Markdown components={SUMMARY_COMPONENTS} source={summary} />
        )
      }
      title={title}
      vitals={vitals}
    />
  );
}
