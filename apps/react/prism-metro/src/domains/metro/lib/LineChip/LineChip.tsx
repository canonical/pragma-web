// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityChip,
  SwatchMark,
  useForeignPrefix,
  useProjectionLink,
  useProjectionPeek,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/LineChip_node.graphql.js";
import type { LineChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineChip reads from the Line it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineChip_node on Line {
    __typename
    uri
    colour
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds line-chip";

/**
 * A line as an inline mention: its mark, its prefix when the line
 * is off the page's namespace, and its name, linked to its home; a linked
 * chip peeks at the line's card, the peek the site's provider gives. A
 * passage's own link text, given as `children`, stands in for the name;
 * `linked={false}` sets the chip as inert text.
 * Its mark is a disc of the line's colour (`SwatchMark`), which the
 * package paints only with a plain colour value.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { LineChip } from "#domains/metro";`
 *
 * @implements metro.component.line_chip
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes, and its link, its peek and the page's namespace from the
 *   projection providers.
 */
export default function LineChip({
  node,
  children,
  className,
  ...props
}: LineChipProps): ReactElement {
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
      mark={<SwatchMark colour={data.colour} />}
      peek={peek}
      prefix={prefix}
      title={children ?? title}
    />
  );
}
