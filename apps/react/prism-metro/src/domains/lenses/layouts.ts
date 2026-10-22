import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { LINES_BINDING, STATIONS_BINDING } from "./bindings.js";
import { LINES_LENS, STATIONS_LENS } from "./constants.js";
import createEntityLayout from "./createEntityLayout.js";
import { MetroDefinitionsLayout } from "./MetroDefinitionsLayout/index.js";

// The router wrappers the site's route table groups each lens's routes
// under, one per lens, each rendering that lens's own layout with the metro
// rail bound to it.

/** The Definitions lens's wrapper. */
export const definitionsLayout = wrapper<ReactElement>({
  id: "definitions-layout",
  component: MetroDefinitionsLayout,
});

/** The stations lens's wrapper. */
export const stationsLayout = createEntityLayout(
  STATIONS_BINDING,
  STATIONS_LENS,
);

/** The lines lens's wrapper. */
export const linesLayout = createEntityLayout(LINES_BINDING, LINES_LENS);
