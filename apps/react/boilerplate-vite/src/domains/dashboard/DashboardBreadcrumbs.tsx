import { Breadcrumbs } from "@canonical/react-ds-global";
import { useRoute } from "@canonical/router-react";
import type { ReactElement } from "react";
import { RouterLink } from "#lib/index.js";
import { LEGAL_URL, PROJECT_NAME } from "./constants.js";
import { useDashboardNavigation } from "./hooks/index.js";
import projectBreadcrumbs from "./projectBreadcrumbs.js";

/**
 * The breadcrumb trail of the current dashboard page: the project, then the
 * page's path in the side navigation's tree. The trail is projected from the
 * same navigation items the side navigation renders, so a page never states
 * its own position and the two cannot disagree.
 */
export default function DashboardBreadcrumbs(): ReactElement {
  const { root } = useDashboardNavigation({ legalUrl: LEGAL_URL });
  const { pathname } = useRoute();

  return (
    <Breadcrumbs
      items={[
        { label: PROJECT_NAME, url: "/dashboard" },
        ...projectBreadcrumbs(root, pathname),
      ]}
      LinkComponent={RouterLink}
    />
  );
}
