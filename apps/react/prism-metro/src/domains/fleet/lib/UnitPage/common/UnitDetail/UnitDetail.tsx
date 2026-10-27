import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import type { UnitPageQuery } from "#relay/__generated__/UnitPageQuery.graphql.js";
import unitPageQueryNode from "#relay/__generated__/UnitPageQuery.graphql.js";
import { REFERENCE_TRAIN_LENGTH } from "../../../../constants.js";
import { useFleetNode } from "../../../../hooks/index.js";
import assertFragment from "../../../assertFragment.js";
import { FormationSideView } from "../../../FormationSideView/index.js";
import findScaleLength from "../../../findScaleLength.js";
import orientCars from "../../../orientCars.js";
import readUnitCars from "../../../readUnitCars.js";
import type { UnitDetailProps } from "./types.js";

/**
 * A unit's page, once its data is in the store: its title, then its side
 * view, the unit drawn as a train of its own against a long train's
 * length, front first. An address naming no unit says nothing lives
 * there.
 */
export default function UnitDetail({ address }: UnitDetailProps): ReactElement {
  const t = useMessages();
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
  return (
    <>
      <Head title={node._meta.title} />
      <h1 className="title">{node._meta.title}</h1>
      <FormationSideView
        cars={cars}
        className="side-view"
        scale={findScaleLength([
          REFERENCE_TRAIN_LENGTH,
          cars.reduce((sum, car) => sum + car.length, 0),
        ])}
      />
    </>
  );
}
