import { createEnvironment } from "@canonical/prism-core";
import type { Environment, FetchFunction } from "relay-runtime";
import type { Mock } from "vitest";
import createRecordedFetch, {
  type RecordedFetchOptions,
} from "./createRecordedFetch.js";
import warmRoute from "./warmRoute.js";

/** A warmed environment and the recorded fetch behind it. */
export interface WarmEnvironment {
  /** The environment, its store holding what the route's warm fetched. */
  readonly environment: Environment;
  /** The fetch function, its call log cleared after the warm. */
  readonly fetchFn: Mock<FetchFunction>;
}

/**
 * Create an environment over the metro graph's recorded responses and warm
 * it for `url` the way a site's server does, so a render that follows reads
 * every operation from the store. The fetch's call log is cleared after the warm: any call it
 * records afterwards is a request the render made.
 *
 * @param url - The page's path.
 * @param options - The recorded fetch's options.
 * @returns The warmed environment and its fetch function.
 * @note Impure: runs the route's warm, which answers its operations from
 *   the recorded responses.
 */
export default async function createWarmEnvironment(
  url: string,
  options?: RecordedFetchOptions,
): Promise<WarmEnvironment> {
  const fetchFn = createRecordedFetch(options);
  const environment = createEnvironment({ fetchFn });
  await warmRoute(environment, url);
  fetchFn.mockClear();
  return { environment, fetchFn };
}
