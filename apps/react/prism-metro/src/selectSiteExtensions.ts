import type { ProviderExtension } from "@canonical/prism-contract";
import { SEARCH_OFF } from "./constants.js";

/**
 * Select the extensions the site's provider serves under the `PRISM_SEARCH`
 * setting: every extension the committed schema declares, without `search`
 * when the setting is `SEARCH_OFF`.
 *
 * @param extensions - The extensions the committed schema declares.
 * @param searchSetting - The `PRISM_SEARCH` setting, if any.
 * @returns The extensions the site offers what reads them for.
 */
export default function selectSiteExtensions<
  const TExtension extends ProviderExtension,
>(
  extensions: readonly TExtension[],
  searchSetting: string | undefined,
): readonly TExtension[] {
  return searchSetting === SEARCH_OFF
    ? extensions.filter((extension) => extension !== "search")
    : extensions;
}
