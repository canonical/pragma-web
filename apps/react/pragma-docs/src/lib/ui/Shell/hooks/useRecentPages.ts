import type { CommandPaletteProps } from "@canonical/prism-command-palette";
import { useEffect, useState } from "react";
import { RECENT_PAGE_LIMIT } from "../constants.js";
import type { RecentPagesRouter } from "./types.js";

/** A page the reader read before, as the palette lists it. */
type RecentPage = NonNullable<
  CommandPaletteProps["destinations"]
>["recent"][number];

/** The address of the router's page: its path and its query. */
const readHref = (router: RecentPagesRouter): string => {
  const { url } = router.getState().location;
  return `${url.pathname}${url.search}`;
};

/**
 * Keep the pages the reader read before the one on screen, latest first,
 * at most `RECENT_PAGE_LIMIT` of them, each once: as the router leaves a
 * page, the page is recorded under the document's title, which still
 * names it, and the page arrived at leaves the list. None on the server
 * and before the first navigation, so the hydrated tree matches the
 * server's.
 *
 * @param router - The site's router, whose navigations are followed.
 * @returns The recent pages, latest first.
 * @note Impure: subscribes to the router and reads the document's title.
 */
export default function useRecentPages(
  router: RecentPagesRouter,
): readonly RecentPage[] {
  const [recent, setRecent] = useState<readonly RecentPage[]>([]);
  useEffect(() => {
    let current = readHref(router);
    return router.subscribe(() => {
      const next = readHref(router);
      if (next === current) return;
      const left = { label: document.title, href: current };
      current = next;
      setRecent((pages) =>
        [
          left,
          ...pages.filter(({ href }) => href !== left.href && href !== next),
        ].slice(0, RECENT_PAGE_LIMIT),
      );
    });
  }, [router]);
  return recent;
}
