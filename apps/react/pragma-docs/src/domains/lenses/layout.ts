import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { GuidesLayout } from "./GuidesLayout/index.js";

/** The router wrapper that renders every route grouped under it inside
 * `GuidesLayout`. */
export default wrapper<ReactElement>({
  id: "guides-layout",
  component: GuidesLayout,
});
