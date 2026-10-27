import { route } from "@canonical/router-core";
import type { ReactElement } from "react";
import { HomePage } from "./lib/index.js";
import warmHome from "./warmHome.js";

// The router hands a route's content its `params` and `search`; the landing
// takes neither, so this adapter keeps them off the page's `<section>`.
const HomeContent = (): ReactElement => <HomePage />;

/**
 * The landing's route: `home`, at `/`, whose data reaches the store through
 * `warm: warmHome`. It declares no lens facet: the landing is not a lens,
 * so the rail and the trail never list it.
 */
export const homeRoutes = {
  home: route({ url: "/", content: HomeContent, warm: warmHome }),
} as const;
