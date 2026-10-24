import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { JourneysLayout } from "./lib/JourneysLayout/index.js";

/** The router wrapper that renders every route grouped under it inside
 * `JourneysLayout`. */
export default wrapper<ReactElement>({
  id: "journeys-layout",
  component: JourneysLayout,
});
