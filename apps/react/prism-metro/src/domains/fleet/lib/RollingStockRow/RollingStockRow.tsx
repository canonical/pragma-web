// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityRow,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/RollingStockRow_node.graphql.js";
import { ROLLING_STOCK_MARK_ICON } from "../RollingStockChip/constants.js";
import type { RollingStockRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields RollingStockRow reads from the RollingStock it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment RollingStockRow_node on RollingStock {
    __typename
    _meta {
      title
      curie
      definition
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
 * A rolling stock as a list entry: its mark, its prefix off the page's
 * namespace, its name linked to its home, and how many formations it runs
 * in as a fact; a two-line row (`lines="two"`) puts its definition under
 * the name.
 * Its mark is the rolling stock's glyph, a published icon.
 *
 * Native props reach the row's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { RollingStockRow } from "#domains/fleet";`
 *
 * @implements metro.component.rolling_stock_row
 * @note Impure: reads its rolling stock from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function RollingStockRow({
  node,
  className,
  ...props
}: RollingStockRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={[
        {
          property: "formations",
          label: t("fleet.fact.formations"),
          value: data.formations.length,
        },
      ]}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={ROLLING_STOCK_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
