import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { FleetLayout } from "./lib/index.js";

/** The router wrapper the site's route table groups the fleet's routes under. */
export const fleetLayout = wrapper<ReactElement>({
  id: "fleet-layout",
  component: FleetLayout,
});
