// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityRow, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/RollingStockRow_node.graphql.js";
import type { RollingStockRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** The fields RollingStockRow reads from the RollingStock it renders. */
const declareNodeFragment = (): unknown => graphql`
  fragment RollingStockRow_node on RollingStock {
    __typename
    _meta {
      title
      curie
    }
    formations {
      uri
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds rolling-stock-row";

/**
 * A rolling stock as a 32px list entry: its name, linked to the stock's
 * page, and how many formations it runs in.
 *
 * Native props reach the root the EntityRow renders; a consumer
 * `className` merges after the projection's own, and the root carries the
 * typename as `data-type`.
 *
 * `import { RollingStockRow } from "./RollingStockRow/index.js";`
 *
 * @implements metro.component.rolling_stock_row
 * @note Impure: reads its rolling stock from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function RollingStockRow({
  node,
  className,
  ...props
}: RollingStockRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      meta={t("fleet.formations.count", { count: data.formations.length })}
      title={title}
    />
  );
}
