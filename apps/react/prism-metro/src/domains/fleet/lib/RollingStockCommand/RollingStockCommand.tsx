// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/RollingStockCommand_node.graphql.js";
import { ROLLING_STOCK_MARK_ICON } from "../RollingStockChip/constants.js";
import type { RollingStockCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields RollingStockCommand reads from the RollingStock it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment RollingStockCommand_node on RollingStock {
    __typename
    formations {
      uri
    }
    _meta {
      title
      curie
      type {
        _meta {
          title
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds rolling-stock-command";

/**
 * A rolling stock as a command-palette entry: its mark and its name, linked
 * to its home, then its compact address, its kind and the count of the
 * formations it runs in, its one figure, in the status. The address states
 * its namespace, so it shows no prefix.
 * Its mark is the rolling stock's glyph, a published icon.
 *
 * Native props reach the entry's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { RollingStockCommand } from "#domains/fleet";`
 *
 * @implements metro.component.rolling_stock_command
 * @note Impure: reads its rolling stock from the Relay store, its home from the
 *   site's homes, and its link from the projection providers, and its
 *   words from the translator in scope.
 */
export default function RollingStockCommand({
  node,
  className,
  ...props
}: RollingStockCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityCommand
      {...props}
      address={curie}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      mark={<Icon icon={ROLLING_STOCK_MARK_ICON} />}
      status={t("fleet.formations.count", { count: data.formations.length })}
      title={title}
    />
  );
}
