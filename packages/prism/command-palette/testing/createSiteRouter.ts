import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { ROUTES } from "./fixtures.js";

/**
 * Create the router of the site the palette opens homes in: the fixture
 * routes over an in-memory history at `url`, so a test reads where a choice
 * took the reader from the router's own location.
 *
 * @param url - The address the router starts at. Defaults to the root.
 * @returns The router.
 */
export default function createSiteRouter(url = "/") {
  return createRouter(ROUTES, { adapter: createMemoryAdapter(url) });
}
