// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityChip,
  useForeignPrefix,
  useProjectionLink,
  useProjectionPeek,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/UIBlockChip_node.graphql.js";
import { UI_BLOCK_MARK_ICON } from "./constants.js";
import type { UIBlockChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields UIBlockChip reads from the UIBlock it renders: its absolute
 * IRI, which its peek reads the block at, its title and compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment UIBlockChip_node on UIBlock {
    __typename
    uri
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ui-block-chip";

/**
 * A UI block (a component, a pattern or a layout) as an inline mention:
 * the block's mark, its prefix when the block is off the page's namespace,
 * and its title, linked to its home when the site has one and inert text
 * when it has none; a linked chip peeks at the block's card, the peek the
 * site's provider gives. A passage's own link text, given as `children`,
 * stands in for the title; `linked={false}` sets the chip as inert text. It reads only what the
 * `UIBlock` interface declares, so one projection serves every UI-block
 * type.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { UIBlockChip } from "#domains/components/lib";`
 *
 * @implements docs.component.ui_block_chip
 * @note Impure: reads its block from the Relay store, its home from the
 *   site's homes, and its link, its peek and the page's namespace from the
 *   projection providers.
 */
export default function UIBlockChip({
  node,
  children,
  className,
  ...props
}: UIBlockChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const peek = useProjectionPeek(data.uri);
  const prefix = useForeignPrefix(curie);
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={UI_BLOCK_MARK_ICON} />}
      peek={peek}
      prefix={prefix}
      title={children ?? title}
    />
  );
}
