import type { InstancePage } from "./types.js";

/**
 * The nodes of one class's instances page, failing when the page did not
 * hold them all, so a reader built on it can never pass over a partial list.
 * `description` names the page in the error.
 */
export const readWholePage = <T>(
  page: InstancePage<T>,
  description: string,
): T[] => {
  if (page.instances.pageInfo.hasNextPage) {
    throw new Error(`${description} was truncated`);
  }
  return page.instances.edges.map((edge) => edge.node);
};
