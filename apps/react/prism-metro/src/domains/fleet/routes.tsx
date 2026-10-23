import { routeLensFacet } from "@canonical/prism-core";
import { readUriParam } from "@canonical/prism-lens-entity";
import { route } from "@canonical/router-core";
import type { ReactElement } from "react";
import carTypePageQueryNode from "#relay/__generated__/CarTypePageQuery.graphql.js";
import formationPageQueryNode from "#relay/__generated__/FormationPageQuery.graphql.js";
import stockPageQueryNode from "#relay/__generated__/StockPageQuery.graphql.js";
import unitPageQueryNode from "#relay/__generated__/UnitPageQuery.graphql.js";
import { FLEET_LENS } from "./constants.js";
import {
  CarTypePage,
  FleetIcon,
  FleetIndex,
  FormationPage,
  StockPage,
  UnitPage,
} from "./lib/index.js";
import warmFleetIndex from "./warmFleetIndex.js";
import warmFleetNode from "./warmFleetNode.js";

/** The route params a node's page receives: its percent-decoded address. */
type NodeRouteProps = {
  readonly params: Readonly<Record<string, unknown>>;
};

/**
 * The fleet lens's routes, under the names the site's route table keeps
 * them by:
 *
 * - `fleet`, at `/fleet`: every rolling stock, the lens's index, which
 *   declares the lens (`routeLensFacet`) so the rail and the trail link to
 *   it;
 * - `fleetStock`, at `/fleet/:uri`: one rolling stock and its formations;
 * - `fleetFormation`, at `/fleet/formations/:uri`: one formation;
 * - `fleetUnit`, at `/fleet/units/:uri`: one unit;
 * - `fleetCarType`, at `/fleet/car-types/:uri`: one car type.
 *
 * A node's address is compact (`metro%3Aseries-90`, the form the site's
 * homes build) or absolute. Each route reaches the store through its
 * `warm`, the one seam between the router and the data layer.
 */
export const fleetRoutes = {
  fleet: route({
    url: "/fleet",
    content: (): ReactElement => <FleetIndex />,
    warm: () => warmFleetIndex(),
    meta: routeLensFacet.of({ ...FLEET_LENS, icon: FleetIcon, tier: 2 }),
  }),
  fleetStock: route({
    url: "/fleet/:uri",
    content: ({ params }: NodeRouteProps): ReactElement => (
      <StockPage address={readUriParam(params)} />
    ),
    warm: (params) => warmFleetNode(stockPageQueryNode, params),
  }),
  fleetFormation: route({
    url: "/fleet/formations/:uri",
    content: ({ params }: NodeRouteProps): ReactElement => (
      <FormationPage address={readUriParam(params)} />
    ),
    warm: (params) => warmFleetNode(formationPageQueryNode, params),
  }),
  fleetUnit: route({
    url: "/fleet/units/:uri",
    content: ({ params }: NodeRouteProps): ReactElement => (
      <UnitPage address={readUriParam(params)} />
    ),
    warm: (params) => warmFleetNode(unitPageQueryNode, params),
  }),
  fleetCarType: route({
    url: "/fleet/car-types/:uri",
    content: ({ params }: NodeRouteProps): ReactElement => (
      <CarTypePage address={readUriParam(params)} />
    ),
    warm: (params) => warmFleetNode(carTypePageQueryNode, params),
  }),
} as const;
