import { route } from "@canonical/router-core";
import InstancesPage from "./InstancesPage.js";
import OverviewPage from "./OverviewPage.js";
import SettingsPage from "./SettingsPage.js";

const routes = {
  dashboard: route({
    url: "/dashboard",
    content: OverviewPage,
  }),
  dashboardInstances: route({
    url: "/dashboard/instances",
    content: InstancesPage,
  }),
  dashboardSettings: route({
    url: "/dashboard/settings",
    content: SettingsPage,
  }),
} as const;

export default routes;
