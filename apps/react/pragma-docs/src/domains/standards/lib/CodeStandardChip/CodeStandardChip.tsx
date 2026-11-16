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
import nodeFragment from "../../../../relay/__generated__/CodeStandardChip_node.graphql.js";
import { CODE_STANDARD_MARK_ICON } from "./constants.js";
import type { CodeStandardChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CodeStandardChip reads from the CodeStandard it renders: its absolute
 * IRI, which its peek reads the standard at, its title and compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CodeStandardChip_node on CodeStandard {
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

const componentCssClassName = "ds code-standard-chip";

/**
 * A code standard as an inline mention: the standard's mark, its prefix when
 * the standard is off the page's namespace, and its title, linked to its
 * home when the site has one and inert text when it has none; a linked
 * chip peeks at the standard's card, the peek the site's provider gives. A
 * passage's own link text, given as `children`, stands in for the title;
 * `linked={false}` sets the chip as inert text.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { CodeStandardChip } from "#domains/standards/lib";`
 *
 * @implements docs.component.code_standard_chip
 * @note Impure: reads its standard from the Relay store, its home from the
 *   site's homes, and its link, its peek and the page's namespace from the
 *   projection providers.
 */
export default function CodeStandardChip({
  node,
  children,
  className,
  ...props
}: CodeStandardChipProps): ReactElement {
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
      mark={<Icon icon={CODE_STANDARD_MARK_ICON} />}
      peek={peek}
      prefix={prefix}
      title={children ?? title}
    />
  );
}
