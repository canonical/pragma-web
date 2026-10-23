import { wrapper } from "@canonical/router-core";
import type { ReactElement } from "react";
import { HomeLayout } from "./lib/index.js";

/**
 * The landing's wrapper: the document archetype with the metro rail,
 * identified `home-layout`.
 */
export const homeLayout = wrapper<ReactElement>({
  id: "home-layout",
  component: HomeLayout,
});
