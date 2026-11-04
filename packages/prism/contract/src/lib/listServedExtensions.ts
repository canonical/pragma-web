import { PROVIDER_EXTENSIONS } from "./constants.js";
import { servesExtension } from "./servesExtension.js";
import type { ProviderExtension } from "./types.js";

/**
 * The extensions a provider's schema serves, in the order
 * `PROVIDER_EXTENSIONS` declares them.
 *
 * @param providerSdl - The provider's full SDL.
 * @returns The served extensions; empty for the bare contract or an SDL that
 *   does not build.
 */
export function listServedExtensions(
  providerSdl: string,
): readonly ProviderExtension[] {
  return (Object.keys(PROVIDER_EXTENSIONS) as ProviderExtension[]).filter(
    (extension) => servesExtension(providerSdl, extension),
  );
}
