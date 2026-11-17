import {
  PAGE_RENDERER_NAMES,
  SectionedView,
  useRenderers,
} from "@canonical/prism-core";
import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import type { UnitPageQuery } from "#relay/__generated__/UnitPageQuery.graphql.js";
import unitPageQueryNode from "#relay/__generated__/UnitPageQuery.graphql.js";
import {
  FLEET_RENDERERS,
  FLEET_SECTIONS,
  REFERENCE_TRAIN_LENGTH,
} from "../../../../constants.js";
import { useFleetNode } from "../../../../hooks/index.js";
import assertFragment from "../../../assertFragment.js";
import { FormationSideView } from "../../../FormationSideView/index.js";
import findScaleLength from "../../../findScaleLength.js";
import orientCars from "../../../orientCars.js";
import readUnitCars from "../../../readUnitCars.js";
import renderFleetFacts from "../../../renderFleetFacts.js";
import type { UnitDetailProps } from "./types.js";

/**
 * A unit's page, once its data is in the store: its title, then its side
 * view, the unit drawn as a train of its own against a long train's
 * length, front first. An address naming no unit says nothing lives
 * there.
 *
 * It is laid on the sectioned view: the title in the header, the facts,
 * and the side view as the one section. The header and the facts stand
 * whatever the renderer: under the page renderer the view gets the
 * section, under any other (Turtle, for `as=turtle`) what that renderer
 * draws stands in its place.
 *
 * @note Impure: reads the Relay store, the translator and the address.
 */
export default function UnitDetail({ address }: UnitDetailProps): ReactElement {
  const t = useMessages();
  const { active } = useRenderers("page", FLEET_RENDERERS.page);
  const { node } = useFleetNode<UnitPageQuery>({
    query: unitPageQueryNode,
    address,
  });
  if (node?.__typename !== "Unit") {
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
  const cars = orientCars([
    {
      reversed: false,
      cars: readUnitCars(
        assertFragment(node.readUnitCars_unit, "readUnitCars_unit"),
      ),
    },
  ]);
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
                      cars={cars}
                      className="side-view"
                      scale={findScaleLength([
                        REFERENCE_TRAIN_LENGTH,
                        cars.reduce((sum, car) => sum + car.length, 0),
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
