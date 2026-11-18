import {
  PAGE_RENDERER_NAMES,
  SectionedView,
  useRenderers,
} from "@canonical/prism-core";
import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import type { CarTypePageQuery } from "#relay/__generated__/CarTypePageQuery.graphql.js";
import carTypePageQueryNode from "#relay/__generated__/CarTypePageQuery.graphql.js";
import {
  FLEET_RENDERERS,
  FLEET_SECTIONS,
  REFERENCE_TRAIN_LENGTH,
} from "../../../../constants.js";
import { useFleetNode } from "../../../../hooks/index.js";
import { FormationSideView } from "../../../FormationSideView/index.js";
import findScaleLength from "../../../findScaleLength.js";
import orientCars from "../../../orientCars.js";
import renderFleetFacts from "../../../renderFleetFacts.js";
import type { CarTypeDetailProps } from "./types.js";

/**
 * A car type's page, once its data is in the store: its title, then its
 * side view, the car drawn alone against a long train's length, its cab
 * at the front when it has one. An address naming no car type says
 * nothing lives there.
 *
 * It is laid on the sectioned view: the title in the header, the facts,
 * and the side view as the one section. The header and the facts stand
 * whatever the renderer: under the page renderer the view gets the
 * section, under any other (Turtle, for `as=turtle`) what that renderer
 * draws stands in its place.
 *
 * @note Impure: reads the Relay store, the translator and the address.
 */
export default function CarTypeDetail({
  address,
}: CarTypeDetailProps): ReactElement {
  const t = useMessages();
  const { active } = useRenderers("page", FLEET_RENDERERS.page);
  const { node } = useFleetNode<CarTypePageQuery>({
    query: carTypePageQueryNode,
    address,
  });
  if (node?.__typename !== "CarType") {
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
  const car = {
    code: node.code,
    title: node._meta.title,
    length: node.length,
    hasCab: node.hasCab,
    reversed: false,
  };
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
                  id: FLEET_SECTIONS.sideView,
                  title: t("fleet.sideView"),
                  content: (
                    <FormationSideView
                      cars={orientCars([{ reversed: false, cars: [car] }])}
                      className="side-view"
                      scale={findScaleLength([
                        REFERENCE_TRAIN_LENGTH,
                        car.length,
                      ])}
                    />
                  ),
                },
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
