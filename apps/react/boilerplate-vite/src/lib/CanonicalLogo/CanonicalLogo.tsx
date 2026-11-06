import { useTranslation } from "@canonical/i18n-react";
import { Link } from "@canonical/router-react";
import type { ReactElement } from "react";
import type { CanonicalLogoProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds canonical-logo";

/**
 * The brand of the dashboard's side navigation: the brand-orange rectangle
 * with the circle-of-friends mark, linking to the dashboard's overview.
 *
 * It mirrors the `CanonicalLogo` story helper of `@canonical/react-ds-app`,
 * which the package does not export. The mark is inline SVG rather than an
 * image URL, so it renders on the server and needs no asset route.
 *
 * `import { CanonicalLogo } from "#lib/index.js";`
 */
export default function CanonicalLogo({
  className,
  ...props
}: CanonicalLogoProps): ReactElement {
  const { t } = useTranslation();

  return (
    <Link
      {...props}
      aria-label={t("dashboard.nav.home")}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      to="dashboard"
    >
      <svg
        aria-hidden="true"
        className="mark"
        focusable="false"
        viewBox="0 0 60.45 57.87"
      >
        <circle cx="9.66" cy="27.41" r="8.12" />
        <circle cx="43.48" cy="9.61" r="8.12" />
        <path d="M7.34,38.71A26.67,26.67,0,0,0,32.58,55.55a11.47,11.47,0,0,1-2.49-7Q29,48.4,28,48.19A19.62,19.62,0,0,1,14.55,37.83,11.49,11.49,0,0,1,7.34,38.71Z" />
        <circle cx="41.65" cy="48.35" r="8.12" />
        <path d="M48.9,39.31a11.58,11.58,0,0,1,4,6.25,26.64,26.64,0,0,0,1.36-31.63,11.47,11.47,0,0,1-4.7,5.54A19.73,19.73,0,0,1,48.9,39.31Z" />
        <path d="M9.68,15.85a11.44,11.44,0,0,1,2.4.25,11.72,11.72,0,0,1,3.77,1.54,19.73,19.73,0,0,1,16-8.56,12.15,12.15,0,0,1,.22-1.9h0a11.75,11.75,0,0,1,2.34-4.89A26.9,26.9,0,0,0,8.82,15.88C9.11,15.86,9.39,15.85,9.68,15.85Z" />
      </svg>
    </Link>
  );
}
