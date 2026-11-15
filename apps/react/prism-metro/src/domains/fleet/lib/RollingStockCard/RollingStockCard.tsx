// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityCard,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/RollingStockCard_node.graphql.js";
import buildStockFacts from "../buildStockFacts.js";
import { FormationStack } from "../FormationStack/index.js";
import formatLength from "../formatLength.js";
import orientCars from "../orientCars.js";
import { ROLLING_STOCK_MARK_ICON } from "../RollingStockChip/constants.js";
import readFormationTrain from "../readFormationTrain.js";
import type { RollingStockCardProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields RollingStockCard reads from the RollingStock it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment RollingStockCard_node on RollingStock {
    __typename
    _meta {
      title
      curie
      definition
    }
    formations {
      uri
      length
      capacity
      _meta {
        title
      }
      ...readFormationTrain_formation
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds rolling-stock-card";

/**
 * A rolling stock as a card: its mark, its prefix off the page's namespace,
 * its name linked to its home, its definition, and how many formations it
 * runs in and the range of their lengths and capacities as facts; its
 * formations drawn at one scale in the specimen, each captioned by its
 * title and its length. A stock with no formation shows its count alone and
 * draws no specimen. It states no address and no kind: the peek's line
 * carries the address, and its mark says the type.
 * Its mark is the rolling stock's glyph, a published icon.
 *
 * Native props reach the card's `<div>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { RollingStockCard } from "#domains/fleet";`
 *
 * @implements metro.component.rolling_stock_card
 * @note Impure: reads its rolling stock from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function RollingStockCard({
  node,
  className,
  ...props
}: RollingStockCardProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  return (
    <EntityCard
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={buildStockFacts(data.formations, t)}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={ROLLING_STOCK_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    >
      {data.formations.length === 0 ? undefined : (
        <EntityCard.Specimen
          kind="drawing"
          label={t("fleet.stock.specimen", { title })}
        >
          <FormationStack
            trains={data.formations.map((formation) => ({
              key: formation.uri,
              cars: orientCars(readFormationTrain(formation)),
              caption: t("fleet.formation.caption", {
                title: formation._meta.title,
                length: formatLength(formation.length),
              }),
            }))}
          />
        </EntityCard.Specimen>
      )}
    </EntityCard>
  );
}
