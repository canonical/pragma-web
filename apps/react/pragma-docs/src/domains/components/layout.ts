import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { ComponentsLayout } from "./ComponentsLayout/index.js";

/** The router wrapper that renders every route grouped under it inside
 * `ComponentsLayout`. */
export default wrapper<ReactElement>({
  id: "components-layout",
  component: ComponentsLayout,
});
