// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityChip, useProjectionLink } from "@canonical/prism-projections";
import type { CSSProperties, ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "#relay/__generated__/LineChip_node.graphql.js";
import type { LineChipChannelStyle, LineChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineChip reads from the Line it renders: its colour, its name
 * and its compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineChip_node on Line {
    __typename
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
 * A line as an inline mention: a swatch of the line's colour, then its
 * name in the chip's pill, linked to the line's page. A passage's own link
 * text, given as `children`, stands in for the name. The swatch is the
 * chip's mark, hidden from assistive technology, so the chip's name never
 * depends on the colour.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, a consumer `style` under the line's
 * colour, and the root carries the typename as `data-type`.
 *
 * `import { LineChip } from "./lib/index.js";`
 *
 * @implements metro.component.line_chip
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function LineChip({
  node,
  children,
  className,
  style,
  ...props
}: LineChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data._meta.curie });
  const LinkComponent = useProjectionLink();
  const channels: LineChipChannelStyle = {
    "--line-chip-swatch-color": data.colour,
  };
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<span className="swatch" />}
      // Custom properties pass through React's style to setProperty; the
      // cast admits the channel's name, which CSSProperties does not list.
      style={{ ...style, ...channels } as CSSProperties}
      value={children ?? data._meta.title}
    />
  );
}
