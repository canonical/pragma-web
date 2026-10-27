import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { useMessages } from "#i18n";
import type { CarTypePageQuery } from "#relay/__generated__/CarTypePageQuery.graphql.js";
import carTypePageQueryNode from "#relay/__generated__/CarTypePageQuery.graphql.js";
import { useFleetNode } from "../../../../hooks/index.js";
import { FormationSideView } from "../../../FormationSideView/index.js";
import orientCars from "../../../orientCars.js";
import type { CarTypeDetailProps } from "./types.js";

/**
 * A car type's page, once its data is in the store: its title, then its
 * side view, the car drawn alone, its cab at the front when it has one. An
 * address naming no car type says nothing lives there.
 */
export default function CarTypeDetail({
  address,
}: CarTypeDetailProps): ReactElement {
  const t = useMessages();
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
  return (
    <>
      <Head title={node._meta.title} />
      <h1 className="title">{node._meta.title}</h1>
      <FormationSideView
        cars={orientCars([{ reversed: false, cars: [car] }])}
        className="side-view"
      />
    </>
  );
}
