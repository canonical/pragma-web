import { JOURNEY_VIEW_PARAM } from "./constants.js";
import readJourneyView from "./readJourneyView.js";
import type { JourneysSearchSchema } from "./types.js";

/**
 * The journeys routes' search schema, in the Standard Schema shape the
 * router validates search parameters with: it reads the view from
 * `JOURNEY_VIEW_PARAM` and never fails, an unknown value reading as the
 * table. Declaring it on both routes names the parameter in the route
 * table, so the lens reads and writes it under the site's register, and a
 * move from the lens index to a job keeps it. The view never reaches the
 * explorer's operation, so a warm store serves both views.
 */
const journeysSearch: JourneysSearchSchema = {
  "~standard": {
    version: 1,
    vendor: "pragma-docs",
    validate: (value) => ({
      value: {
        view: readJourneyView(
          (value as Readonly<Record<string, unknown>> | undefined)?.[
            JOURNEY_VIEW_PARAM
          ],
        ),
      },
    }),
  },
};

export default journeysSearch;
