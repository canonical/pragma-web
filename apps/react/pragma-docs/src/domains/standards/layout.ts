import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { SiteStandardsLayout } from "./lib/SiteStandardsLayout/index.js";

/** The router wrapper that renders every route grouped under it inside the
 * Standards lens's layout, with the site's rail and colophon. */
export default wrapper<ReactElement>({
  id: "standards-layout",
  component: SiteStandardsLayout,
});
