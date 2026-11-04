import { VIEW_PARAMS } from "./constants.js";
import type { ViewSearch, ViewSearchSchema } from "./types.js";

/** The parameter's value when the address carries one as text. */
const readText = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

/**
 * The search schema every route with a strip declares, in the Standard
 * Schema shape the router validates search parameters with: it reads the
 * view's six parameters as text, each absent when the address has none,
 * and never fails. Declaring it names the parameters in a site's route
 * table, so a view can read and write them under the site's register.
 */
const viewSearch: ViewSearchSchema = {
  "~standard": {
    version: 1,
    vendor: "prism-core",
    validate: (value) => {
      const search = value as Readonly<Record<string, unknown>>;
      const read: ViewSearch = {
        as: readText(search[VIEW_PARAMS.renderer]),
        q: readText(search[VIEW_PARAMS.query]),
        sheet: readText(search[VIEW_PARAMS.sheet]),
        graph: readText(search[VIEW_PARAMS.graph]),
        select: readText(search[VIEW_PARAMS.select]),
        expand: readText(search[VIEW_PARAMS.expand]),
      };
      return {
        value: Object.fromEntries(
          Object.entries(read).filter(([, text]) => text !== undefined),
        ) as ViewSearch,
      };
    },
  },
};

export default viewSearch;
