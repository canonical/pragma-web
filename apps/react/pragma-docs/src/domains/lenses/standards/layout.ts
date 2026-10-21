import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { StandardsLayout } from "./StandardsLayout/index.js";

/** The router wrapper that renders every route grouped under it inside
 * `StandardsLayout`. */
export default wrapper<ReactElement>({
  id: "standards-layout",
  component: StandardsLayout,
});
