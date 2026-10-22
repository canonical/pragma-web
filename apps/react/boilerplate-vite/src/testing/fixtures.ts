import { route } from "@canonical/router-core";

/**
 * The app's route names and URL shapes, with no page content: chrome and page
 * tests render under a router that knows every name the app links to, without
 * importing the real route map and, with it, every domain page.
 */
export const stubRoutes = {
  home: route({ url: "/", content: () => null }),
  guide: route({ url: "/guides/:slug", content: () => null }),
  catalog: route({ url: "/catalog", content: () => null }),
  contact: route({ url: "/contact", content: () => null }),
  account: route({ url: "/account", content: () => null }),
  dashboard: route({ url: "/dashboard", content: () => null }),
  dashboardInstances: route({
    url: "/dashboard/instances",
    content: () => null,
  }),
  dashboardSettings: route({
    url: "/dashboard/settings",
    content: () => null,
  }),
} as const;
