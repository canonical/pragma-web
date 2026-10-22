import { useTranslation } from "@canonical/i18n-react";
import { ApplicationLayout, SideNavigation } from "@canonical/react-ds-app";
import { useRoute } from "@canonical/router-react";
import type { ReactElement } from "react";
import CanonicalLogo from "../CanonicalLogo/index.js";
import RouterLink from "../RouterLink/index.js";
import type { ApplicationShellProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds application-shell";

/**
 * An application's frame: the design system's `ApplicationLayout`, with its
 * `SideNavigation` in the navigation slot and the page in `<main>`.
 *
 * The side navigation follows the router: the current pathname marks the
 * active item, and `RouterLink` turns its links into client-side navigation.
 * `<main id="main-content">` is the side navigation's skip-link target.
 *
 * The shell is a `.surface`: the design system's components read their
 * colours from the surface channels it sets, and the side panels and modals
 * opened inside it paint from them.
 *
 * `import { ApplicationShell } from "#lib/index.js";`
 */
export default function ApplicationShell({
  root,
  footerRoot,
  label,
  children,
  className,
  ...props
}: ApplicationShellProps): ReactElement {
  const { t } = useTranslation();
  const { pathname } = useRoute();

  return (
    <div
      {...props}
      className={[componentCssClassName, "surface", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ApplicationLayout
        navigation={
          <SideNavigation
            aria-label={label}
            applicationName={t("app.name")}
            brand={<CanonicalLogo />}
            currentUrl={pathname}
            footerRoot={footerRoot}
            LinkComponent={RouterLink}
            messages={{
              skipToContent: () => t("shell.skipToContent"),
              collapseNavigation: () => t("shell.collapseNavigation"),
              expandNavigation: () => t("shell.expandNavigation"),
              collapse: () => t("shell.collapse"),
              expand: () => t("shell.expand"),
              openMenu: () => t("shell.openMenu"),
              closeMenu: () => t("shell.closeMenu"),
            }}
            root={root}
          />
        }
      >
        <main className="main" id="main-content">
          {children}
        </main>
      </ApplicationLayout>
    </div>
  );
}
