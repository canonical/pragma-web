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
import nodeFragment from "#relay/__generated__/RollingStockChip_node.graphql.js";
import { ROLLING_STOCK_MARK_ICON } from "./constants.js";
import type { RollingStockChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields RollingStockChip reads from the RollingStock it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment RollingStockChip_node on RollingStock {
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

const componentCssClassName = "ds rolling-stock-chip";

/**
 * A rolling stock as an inline mention: its mark, its prefix when the rolling stock
 * is off the page's namespace, and its name, linked to its home; a linked
 * chip peeks at the rolling stock's card, the peek the site's provider gives. A
 * passage's own link text, given as `children`, stands in for the name;
 * `linked={false}` sets the chip as inert text.
 * Its mark is the rolling stock's glyph, a published icon.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { RollingStockChip } from "#domains/fleet";`
 *
 * @implements metro.component.rolling_stock_chip
 * @note Impure: reads its rolling stock from the Relay store, its home from the
 *   site's homes, and its link, its peek and the page's namespace from the
 *   projection providers.
 */
export default function RollingStockChip({
  node,
  children,
  className,
  ...props
}: RollingStockChipProps): ReactElement {
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
      mark={<Icon icon={ROLLING_STOCK_MARK_ICON} />}
      peek={peek}
      prefix={prefix}
      title={children ?? title}
    />
  );
}
