import { createContext } from "react";
import type { RenderersValue } from "./types.js";

/**
 * The site's renderers and facts; outside a `RenderersProvider`, a site
 * with no renderers and no provider extensions.
 */
const RenderersContext = createContext<RenderersValue>({
  defaults: { list: [], page: [] },
  facts: { extensions: new Set() },
});

export default RenderersContext;
