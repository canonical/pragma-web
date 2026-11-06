import { useTranslation } from "@canonical/i18n-react";
import type { ReactElement, ReactNode } from "react";
import { ApplicationShell } from "#lib/index.js";
import { LEGAL_URL } from "./constants.js";
import { useDashboardNavigation } from "./hooks/index.js";

/**
 * The frame of every dashboard page: the application shell, with the
 * dashboard's side navigation. `src/routes.tsx` applies it to the dashboard's
 * routes as a router wrapper, beneath the top bar.
 */
export default function DashboardLayout({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  const { t } = useTranslation();
  const { root, footerRoot } = useDashboardNavigation({ legalUrl: LEGAL_URL });

  return (
    <ApplicationShell
      footerRoot={footerRoot}
      label={t("dashboard.nav.label")}
      root={root}
    >
      {children}
    </ApplicationShell>
  );
}
