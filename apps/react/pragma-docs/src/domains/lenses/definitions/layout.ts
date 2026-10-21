import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { DefinitionsLayout } from "./DefinitionsLayout/index.js";

/** The router wrapper that renders every route grouped under it inside
 * `DefinitionsLayout`. */
export default wrapper<ReactElement>({
  id: "definitions-layout",
  component: DefinitionsLayout,
});
