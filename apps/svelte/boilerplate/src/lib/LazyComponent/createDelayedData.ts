import type { MessageKey } from "../../i18n/index.js";

/**
 * Synthetic data source: resolves after `delayMs` to simulate a slow fetch. It
 * resolves to a catalog key, so the streamed text renders in the active
 * locale. Replace it with a real data source in your own routes.
 */
export default function createDelayedData(delayMs = 1000): Promise<MessageKey> {
  return new Promise((resolve) => {
    setTimeout(() => resolve("home.streamed"), delayMs);
  });
}
