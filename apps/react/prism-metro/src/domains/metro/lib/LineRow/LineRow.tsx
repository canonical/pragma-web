// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityRow, useProjectionLink } from "@canonical/prism-projections";
import type { CSSProperties, ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/LineRow_node.graphql.js";
import type { LineRowChannelStyle, LineRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineRow reads from the Line it renders: its colour, the stops
 * it serves, its name and its compact address.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineRow_node on Line {
    __typename
    colour
    servedBy {
      uri
    }
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds line-row";

/**
 * A line as a 32px list entry: a swatch of the line's colour, its name,
 * linked to the line's page, and the count of the stops it serves muted at
 * the end. The swatch is the row's mark, hidden from assistive technology,
 * so the row's name never depends on the colour.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, a consumer `style` under the line's colour,
 * and the root carries the typename as `data-type`.
 *
 * `import { LineRow } from "./lib/index.js";`
 *
 * @implements metro.component.line_row
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function LineRow({
  node,
  className,
  style,
  ...props
}: LineRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data._meta.curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const channels: LineRowChannelStyle = {
    "--line-row-swatch-color": data.colour,
  };
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<span className="swatch" />}
      meta={t("line.stops.count", { count: data.servedBy.length })}
      // Custom properties pass through React's style to setProperty; the
      // cast admits the channel's name, which CSSProperties does not list.
      style={{ ...style, ...channels } as CSSProperties}
      title={data._meta.title}
    />
  );
}
