import {
  PAGE_RENDERER_NAMES,
  SectionedView,
  useRenderers,
} from "@canonical/prism-core";
import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import { MetroChipProjection, MetroRowProjection } from "#lib/ui";
import type { StockPageQuery } from "#relay/__generated__/StockPageQuery.graphql.js";
import stockPageQueryNode from "#relay/__generated__/StockPageQuery.graphql.js";
import { FLEET_RENDERERS, FLEET_SECTIONS } from "../../../../constants.js";
import { useFleetNode } from "../../../../hooks/index.js";
import { FormationStack } from "../../../FormationStack/index.js";
import formatLength from "../../../formatLength.js";
import orientCars from "../../../orientCars.js";
import readFormationTrain from "../../../readFormationTrain.js";
import renderFleetFacts from "../../../renderFleetFacts.js";
import type { StockDetailProps } from "./types.js";

/**
 * A rolling stock's page, once its data is in the store, laid on the
 * sectioned view: its title in the header, its facts, then its formations
 * drawn at one scale, each captioned by its chip and its length, then the
 * car types its units are made of, each once, as its row. A stock with no
 * formation says so, and has no car types section. An address naming no
 * rolling stock says nothing lives there.
 *
 * The header and the facts stand whatever the renderer: under the page
 * renderer the view gets these sections, under any other (Turtle, for
 * `as=turtle`) what that renderer draws stands in their place.
 *
 * @note Impure: reads the Relay store, the translator and the address.
 */
export default function StockDetail({
  address,
}: StockDetailProps): ReactElement {
  const t = useMessages();
  const { active } = useRenderers("page", FLEET_RENDERERS.page);
  const { node } = useFleetNode<StockPageQuery>({
    query: stockPageQueryNode,
    address,
  });
  if (node?.__typename !== "RollingStock") {
    const message = t("fleet.notFound", { address });
    return (
      <>
        <Head title={message} />
        <p className="not-found" role="status">
          {message}
        </p>
      </>
    );
  }
  const carTypes = [
    ...new Map(
      node.formations
        .flatMap(({ units }) => units)
        .flatMap(({ unit }) => unit.cars)
        .map(({ carType }) => [carType.uri, carType] as const),
    ).values(),
  ];
  const isPage = active.name === PAGE_RENDERER_NAMES.page;
  return (
    <>
      <Head title={node._meta.title} />
      <SectionedView
        facts={renderFleetFacts(node, t)}
        header={
          <header className="masthead">
            <h1 className="title">{node._meta.title}</h1>
          </header>
        }
        sections={
          isPage
            ? [
                {
                  id: FLEET_SECTIONS.formations,
                  title: t("fleet.formations"),
                  content:
                    node.formations.length === 0 ? (
                      <p className="empty">{t("fleet.formations.none")}</p>
                    ) : (
                      <FormationStack
                        className="formations"
                        trains={node.formations.map((formation) => ({
                          key: formation.uri,
                          cars: orientCars(readFormationTrain(formation)),
                          caption: (
                            <>
                              <MetroChipProjection node={formation} />
                              <span className="vital">
                                {formatLength(formation.length)}
                              </span>
                            </>
                          ),
                        }))}
                      />
                    ),
                },
                ...(carTypes.length === 0
                  ? []
                  : [
                      {
                        id: FLEET_SECTIONS.carTypes,
                        title: t("fleet.carTypes"),
                        content: (
                          <ul className="rows">
                            {carTypes.map((carType) => (
                              <MetroRowProjection
                                key={carType.uri}
                                node={carType}
                              />
                            ))}
                          </ul>
                        ),
                      },
                    ]),
              ]
            : []
        }
      >
        {isPage
          ? null
          : active.render({
              uri: node.uri,
              title: node._meta.title,
              children: null,
            })}
      </SectionedView>
    </>
  );
}
