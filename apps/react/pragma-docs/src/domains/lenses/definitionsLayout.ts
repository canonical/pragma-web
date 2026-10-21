import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { SiteDefinitionsLayout } from "./SiteDefinitionsLayout/index.js";

/** The router wrapper that renders every route grouped under it inside the
 * Definitions lens's layout, with the site's rail and colophon. */
export default wrapper<ReactElement>({
  id: "definitions-layout",
  component: SiteDefinitionsLayout,
});
