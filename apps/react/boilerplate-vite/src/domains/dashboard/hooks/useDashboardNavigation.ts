import { useTranslation } from "@canonical/i18n-react";
import { createHelpItem } from "@canonical/react-ds-app";
import type {
  UseDashboardNavigationProps,
  UseDashboardNavigationResult,
} from "./types.js";

/**
 * Builds the dashboard's side navigation, labelled in the active locale.
 *
 * The first group holds the dashboard's three pages. The second shows how an
 * area without pages yet appears: its items are disabled, so they render
 * without a link and nothing leads to a missing page. The last group is the
 * Help item every application's side navigation carries. The footer links to
 * the router guide, a public page outside the dashboard.
 */
export default function useDashboardNavigation({
  legalUrl,
}: UseDashboardNavigationProps): UseDashboardNavigationResult {
  const { t } = useTranslation();

  return {
    root: {
      key: "dashboard",
      items: [
        {
          key: "pages",
          items: [
            {
              url: "/dashboard",
              label: t("dashboard.nav.overview"),
              icon: "switcher-dashboard",
            },
            {
              url: "/dashboard/instances",
              label: t("dashboard.nav.instances"),
              icon: "containers",
            },
            {
              url: "/dashboard/settings",
              label: t("dashboard.nav.settings"),
              icon: "settings",
            },
          ],
        },
        {
          key: "networking",
          label: t("dashboard.nav.networking"),
          items: [
            {
              key: "networks",
              label: t("dashboard.nav.networks"),
              icon: "connected",
              disabled: true,
            },
            {
              key: "storage",
              label: t("dashboard.nav.storage"),
              icon: "pods",
              disabled: true,
            },
          ],
        },
        {
          key: "help-group",
          items: [
            createHelpItem(legalUrl, {
              label: t("dashboard.nav.help"),
              legalLabel: t("dashboard.nav.legal"),
            }),
          ],
        },
      ],
    },
    footerRoot: {
      key: "dashboard-footer",
      items: [
        {
          url: "/guides/router-core",
          label: t("dashboard.nav.guide"),
          icon: "book",
        },
      ],
    },
  };
}
