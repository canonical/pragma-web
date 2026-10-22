import { useTranslation } from "@canonical/i18n-react";
import { Link } from "@canonical/router-react";
import type { ReactElement } from "react";
import Navigation from "../Navigation/index.js";
import type { TopBarProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds top-bar";

/**
 * The bar across the top of every page: the application's name, then the
 * demo navigation — one link per area of the boilerplate, followed by the
 * theme and language selectors. It is scaffolding for exploring what the
 * boilerplate ships; an application replaces the links with its own.
 *
 * It sits above both page layouts: the public pages' constrained column and
 * the dashboard's application layout, whose side navigation lives one level
 * below it.
 *
 * `import { TopBar } from "#lib/index.js";`
 */
export default function TopBar({
  className,
  ...props
}: TopBarProps): ReactElement {
  const { t } = useTranslation();

  return (
    <header
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <Link className="name" to="home">
        {t("app.name")}
      </Link>
      <Navigation />
    </header>
  );
}
