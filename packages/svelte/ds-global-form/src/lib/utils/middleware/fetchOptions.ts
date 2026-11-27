import type { Option } from "../../subcomponent/types.js";
import type { OptionsFetchOptions } from "./types.js";

/**
 * Fetches a field's options from a REST endpoint. Use it in a SvelteKit
 * `load`, passing its `fetch`, so the options render on the server, or through
 * `createRemoteOptions` to fetch them in the browser.
 *
 * ```ts
 * export const load = async ({ fetch }) => ({
 *   fruits: await fetchOptions("/api/fruits", { fetch }),
 * });
 * ```
 *
 * @param url - The endpoint returning the options.
 * @param options - Request and transform options.
 * @returns The options. Rejects when the request fails or the response is
 * not OK.
 * @note Impure: performs a network request.
 */
export default async function fetchOptions<Data = Option[]>(
  url: string,
  options: OptionsFetchOptions<Data> = {},
): Promise<Option[]> {
  const {
    method = "GET",
    headers = {},
    transformData,
    fetch: request = fetch,
    signal,
  } = options;
  const response = await request(url, { method, headers, signal });
  if (!response.ok) throw new Error("Failed to fetch options");
  const data = (await response.json()) as Data;
  return transformData ? transformData(data) : (data as Option[]);
}
