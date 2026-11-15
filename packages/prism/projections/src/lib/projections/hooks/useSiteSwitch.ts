import { useContext } from "react";
import ProjectionsContext from "../Context.js";
import type { SiteSwitches } from "../types.js";

/**
 * Read the site's switch for one form from the nearest
 * `ProjectionLinkProvider`: the package's switch of that form renders a
 * node through it when the site gives one.
 *
 * @param form - The form whose switch to read.
 * @returns The site's switch, or `undefined` when the site gives none.
 * @throws When no `ProjectionLinkProvider` is mounted above: that is a
 *   wiring bug, not a site without switches.
 * @note Impure: reads the projection provider in scope.
 */
export default function useSiteSwitch<TForm extends keyof SiteSwitches>(
  form: TForm,
): SiteSwitches[TForm] | undefined {
  const projections = useContext(ProjectionsContext);
  if (projections === undefined) {
    throw new Error("useSiteSwitch: no ProjectionLinkProvider above");
  }
  return projections.site?.[form];
}
