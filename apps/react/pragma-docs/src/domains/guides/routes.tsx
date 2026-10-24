import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { GuidePage } from "./lib/GuidePage/index.js";
import { GuidesIcon } from "./lib/GuidesIcon/index.js";
import { GuidesPage } from "./lib/GuidesPage/index.js";

/**
 * The Guides lens's routes: the guides index (`/guides`), which declares
 * the lens (`routeLensFacet`) and its digit, and a guide's reading page
 * (`/guides/:slug`). Neither reads the graph yet, so neither warms the
 * store. Both render inside `GuidesLayout`, whose strip carries the trail.
 */
const routes = {
  guides: route({
    url: "/guides",
    meta: {
      ...routeShortcutFacet.of("6"),
      ...routeLensFacet.of({
        label: "Guides",
        icon: GuidesIcon,
        order: 6,
        tier: 1,
      }),
    },
    content: () => <GuidesPage />,
  }),
  guide: route({
    url: "/guides/:slug",
    content: ({ params }) => <GuidePage params={params} />,
  }),
} as const;

export default routes;
