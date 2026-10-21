import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { MarketingLayout } from "./MarketingLayout/index.js";

/** The router wrapper that renders every route grouped under it inside
 * `MarketingLayout`. */
export default wrapper<ReactElement>({
  id: "marketing-layout",
  component: MarketingLayout,
});
